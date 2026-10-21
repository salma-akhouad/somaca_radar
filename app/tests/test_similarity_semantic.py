from app.incident_analysis.similarity import _semantic_similarities


def main():
    print("\n=== Semantic similarity smoke test ===\n")

    reference = "Perte de connexion réseau sur la machine."

    candidates = [
        "The machine lost its network connection.",
        "Impossible de communiquer avec le serveur.",
        "Le papier de l'imprimante est bloqué.",
        None,
    ]

    scores = _semantic_similarities(
        reference,
        candidates,
    )

    for candidate, score in zip(candidates, scores):
        print(f"Candidate: {candidate}")
        print(f"Similarity: {score:.3f}\n")

    network_score = scores[0]
    communication_score = scores[1]
    printer_score = scores[2]
    missing_score = scores[3]

    assert network_score > printer_score
    assert communication_score > printer_score
    assert missing_score == 0.0

    identical_score = _semantic_similarities(
        reference,
        [reference],
    )[0]

    print(
        "Identical-text similarity:",
        f"{identical_score:.3f}",
    )

    assert identical_score >= 0.99

    blank_reference_scores = _semantic_similarities(
        "   ",
        [
            "Network failure",
            "Printer failure",
        ],
    )

    assert blank_reference_scores == [
        0.0,
        0.0,
    ]

    print("\nAll semantic similarity smoke tests passed.")


if __name__ == "__main__":
    main()