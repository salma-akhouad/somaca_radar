from dataclasses import dataclass, field
from functools import lru_cache
from sentence_transformers import (
    SentenceTransformer,
    SimilarityFunction,
)
from sqlalchemy import and_, or_
from typing import cast
from sqlalchemy.orm import Session
from ..models import Incident, Machine, IncidentSeverity

"""
This module provides functionality to find similar incidents based on various factors such as 
problem description, cause, solution, machine, pole, and severity. It uses a pre-trained 
sentence transformer model to compute semantic similarities between text fields of incidents.
"""

EMBEDDING_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

PROBLEM_WEIGHT = 50.0
SAME_MACHINE_WEIGHT = 20.0
SAME_POLE_WEIGHT = 8.0
CAUSE_WEIGHT = 17.0
SOLUTION_WEIGHT = 10.0
SAME_SEVERITY_WEIGHT = 3.0

SEMANTIC_REASON_THRESHOLD = 0.65


@dataclass
class SimilarIncidentMatch:
    incident: Incident
    score: float
    reasons: list[str] = field(default_factory=list)
    details: dict[str, float | bool] = field(
        default_factory=dict
    )  


# Initializing the embedding model can be expensive, so we cache it to avoid reloading it multiple times.
# lru_cache is used here to cache the result of the function call, allowing for efficient reuse of the model.
@lru_cache(maxsize=1) # maxsize=1 because we only have one model to cache
def _get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(
        EMBEDDING_MODEL_NAME,
        similarity_fn_name=SimilarityFunction.COSINE,
    )
# Cosine similarity is a measure of similarity between two non-zero vectors of an inner product space 
# that measures the cosine of the angle between them. It is often used in text analysis to determine
# how similar two pieces of text are, based on their vector representations (embeddings).


# The _clamp_similarity function ensures that the similarity score is always between 0.0 and 1.0.
def _clamp_similarity(value: float) -> float:
    return max(0.0, min(1.0, value))


def _semantic_similarities(
    reference_text: str | None,
    candidate_texts: list[str | None],
) -> list[float]:
    
    scores = [0.0] * len(candidate_texts)

    if not reference_text or not reference_text.strip():
        return scores

    valid_candidates = [
    (index, text.strip())
    for index, text in enumerate(candidate_texts)
    if text and text.strip()
]

    if not valid_candidates:
        return scores

    texts = [
        reference_text.strip(),
        *[
            text
            for _, text in valid_candidates
        ],
    ]

    model = _get_embedding_model()

    # encode() method converts the supplied sentences into embedding vectors (of 384 dimensions).
    embeddings = model.encode(
        texts,
        convert_to_tensor=True, 
        # Keeping embeddings as tensors is natural and efficient for numerical vector comparison we do next.
        show_progress_bar=False,
    )

    # cosine similarity is computed between the reference embedding and each of the candidate embeddings.
    similarities = model.similarity(
        embeddings[:1], # reference embedding (index 0) and the operation is batch-to-batch similarity [:1].
        embeddings[1:], # candidate embeddings (index 1 to end)
    )[0]

    # zip() pairs corresponding elements from multiple collections.
    for (index,_), similarity in zip(
        valid_candidates,
        similarities.tolist(),
    ):
        scores[index] = _clamp_similarity(
            float(similarity)
        )

    return scores


# Applying weights to different factors to calculate a final score for how similar two incidents are. 
# Storing the reasons for the score in a list for later reference.
def _calculate_similarity(
    reference: Incident,
    candidate: Incident,
    reference_poteau_id: int,
    candidate_poteau_id: int,
    problem_similarity: float,
    cause_similarity: float,
    solution_similarity: float,
) -> SimilarIncidentMatch:
    score = 0.0
    reasons: list[str] = []

    reference_machine_id = cast(int,reference.id_machine)
    candidate_machine_id = cast(int,candidate.id_machine)
    reference_severity = cast(IncidentSeverity,reference.severity)
    candidate_severity = cast(IncidentSeverity,candidate.severity)
    reference_cause = cast(str | None,reference.confirmed_cause)
    reference_solution = cast(str | None,reference.applied_solution)
    
    same_machine = (
       reference_machine_id == candidate_machine_id
    )

    same_pole = (
        not same_machine
        and reference_poteau_id == candidate_poteau_id
    )

    same_severity = (
        reference_severity == candidate_severity
    )

    if same_machine:
        score += SAME_MACHINE_WEIGHT
        reasons.append("same_machine")

    elif same_pole:
        score += SAME_POLE_WEIGHT
        reasons.append("same_pole")

    if same_severity:
        score += SAME_SEVERITY_WEIGHT
        reasons.append("same_severity")

    score += problem_similarity * PROBLEM_WEIGHT
    score += cause_similarity * CAUSE_WEIGHT
    score += solution_similarity * SOLUTION_WEIGHT

    if (
        problem_similarity >= SEMANTIC_REASON_THRESHOLD
    ):
        reasons.append("similar_problem")

    if (
        cause_similarity >= SEMANTIC_REASON_THRESHOLD
    ):
        reasons.append("similar_cause")

    if (
        solution_similarity >= SEMANTIC_REASON_THRESHOLD
    ):
        reasons.append("similar_solution")

    available_weight = PROBLEM_WEIGHT + SAME_SEVERITY_WEIGHT
    
    if same_machine:
        available_weight += SAME_MACHINE_WEIGHT

    elif same_pole:
        available_weight += SAME_POLE_WEIGHT

    if (
        reference_cause
        and reference_cause.strip()
    ):
        available_weight += CAUSE_WEIGHT

    if (
        reference_solution
        and reference_solution.strip()
    ):
        available_weight += SOLUTION_WEIGHT

    normalized_score = (
        score / available_weight
    ) * 100
    
    return SimilarIncidentMatch(
        incident=candidate,
        score=round(normalized_score, 2),
        reasons=reasons,
        details={
            "problem_similarity": round(
                problem_similarity,
                3,
            ),
            "cause_similarity": round(
                cause_similarity,
                3,
            ),
            "solution_similarity": round(
                solution_similarity,
                3,
            ),
            "same_machine": same_machine,
            "same_pole": same_pole,
            "same_severity": same_severity,
            "raw_score": round(score, 2),
            "available_weight": available_weight,
        },
    )

# Returns a historical relevance score
def find_similar_incidents(
    db: Session,
    reference_incident: Incident,
    min_score: float = 30.0,
    limit: int = 5,
) -> list[SimilarIncidentMatch]:
    
    reference_poteau_id = (
        db.query(Machine.id_poteau)
        .filter(
            Machine.id_machine == reference_incident.id_machine
        )
        .scalar()
    )

    candidate_rows = (
        db.query(
            Incident,
            Machine.id_poteau.label(
                "candidate_id_poteau"
            ),
        )
        .join(
            Machine,
            Incident.id_machine
            == Machine.id_machine,
        )
        .filter(
            or_(
                Incident.created_at
                < reference_incident.created_at,
                and_(
                    Incident.created_at
                    == reference_incident.created_at,
                    Incident.id_incident
                    < reference_incident.id_incident,
                ),
            )
        )
        .all()
    )

    if not candidate_rows:
        return []

    candidates = [
        row.Incident
        for row in candidate_rows
    ]

    reference_problem = cast(str, reference_incident.problem)
    reference_cause = cast(str | None, reference_incident.confirmed_cause)
    reference_solution = cast(str | None, reference_incident.applied_solution)
    
    problem_similarities = (
        _semantic_similarities(
            reference_problem,
            [
                candidate.problem
                for candidate in candidates
            ],
        )
    )

    cause_similarities = (
        _semantic_similarities(
            reference_cause,
            [
                candidate.confirmed_cause
                for candidate in candidates
            ],
        )
    )

    solution_similarities = (
        _semantic_similarities(
            reference_solution,
            [
                candidate.applied_solution
                for candidate in candidates
            ],
        )
    )

    matches: list[SimilarIncidentMatch] = []

    # zip() is used to iterate over multiple sequences (candidate_rows, problem_similarities, cause_similarities, solution_similarities) in parallel. It aligns related pieces of data.
    for (
        row,
        problem_similarity,
        cause_similarity,
        solution_similarity,
    ) in zip(
        candidate_rows,
        problem_similarities,
        cause_similarities,
        solution_similarities,
    ):
        match = _calculate_similarity(
            reference=reference_incident,
            candidate=row.Incident,
            reference_poteau_id=reference_poteau_id,
            candidate_poteau_id=row.candidate_id_poteau,
            problem_similarity=problem_similarity,
            cause_similarity=cause_similarity,
            solution_similarity=solution_similarity,
        )

        if match.score >= min_score:
            matches.append(match)

    matches.sort(
        key=lambda match: (
            match.score,
            match.incident.created_at,
        ),
        reverse=True, # for descending order
    )

    return matches[:limit]