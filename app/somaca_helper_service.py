import html
import json
from datetime import date
from google.genai import types, errors
from .gemini_client import GEMINI_MODEL, gemini_client
from .models import SomacaHelperMessage
from .schemas import HelperAskRequest, RoutingResult
import logging
from pydantic import ValidationError
from sqlalchemy.orm import Session
from .incident_analysis.service import IncidentAnalysisService,  MachineResolutionError


_CLARIFICATION_SYSTEM_INSTRUCTION = """
You are the clarification component of SomacaHelper.
The backend could not uniquely resolve the machine referenced by the user.
Use only the provided resolution details.
Your job is to ask one short, useful clarification question.

Rules:
- Maintain the language currently used in the conversation.
- A short or language-neutral newest message must not cause a language switch.
- If the newest meaningful sentence is clearly in another language, use it.
- If the user explicitly requested another language, use that language.
- Do not invent machines, identifiers or facts.
- If multiple candidate machines are provided, mention enough identifying information to help the user choose.
- If no machine matched, clearly say that no machine matched the provided information and ask the user to verify 
  or provide another identifier.
- Do not answer the original incident-analysis question yet.
"""


_ANSWER_SYSTEM_INSTRUCTION = """
You are the answer-generation component of SomacaHelper,
an internal assistant for SOMACA IT equipment monitoring.

Your job is to answer the user's newest question using only the verified
backend facts supplied to you.

Domain distinctions:
- Machine state: Opérationnel, Attention requise, Critique, Inconnu.
- Incident status: ouvert, en_cours, en_attente, resolu, ferme, annule.
- Incident severity: mineur, majeur, critique.
- A decommissioned machine is inactive and may have a recorded
  decommission date. The application does not store a decommission reason.

Rules:
- Never invent incidents, machines, causes, solutions, contacts, dates,
  identifiers, counts, percentages, states, statuses or severities.
- Never recompute values already calculated by the backend.
- Never confuse machine state, incident status and incident severity.
- Never claim a contact solved an incident unless the facts explicitly prove it.
- Similarity scores are historical relevance scores, not probabilities.
- If a cause, solution or decommission reason is absent, explicitly say the
  available data does not establish it.
- If no result matched, distinguish that from a machine/pole not being found.
- If facts contain truncated=true, make clear that only the most recent returned
  results are being shown while keeping the exact total supplied by the backend.
- Maintain the language currently used in the conversation.
- Short or language-neutral messages such as "ok", "merci", "oui", "non",
  numbers, identifiers, machine names or short acknowledgements must not by
  themselves cause a language switch.
- If the newest meaningful user sentence is clearly written in another
  language, answer in that language and continue naturally in that language.
- If the user explicitly asks to switch language, switch immediately.
- Use recent conversation history to infer the current language when the newest
  message is too short to decide.
- Never expose raw API enum tokens such as en_cours, en_attente, resolu or
  ferme. Render them naturally for the answer language (for example:
  En cours, En attente, Résolu, Fermé in French).

Presentation:
- For a count/statistics question, lead with the number or conclusion in one
  short sentence, then add only the breakdown needed by the question.
- For incident search results, give a compact summary and at most the incidents
  present in the supplied facts. Keep each incident concise.
- For historical summaries, lead with the overall history, then mention only
  the most useful recent incidents.
- For similarity results, show the strongest matches and briefly state why each
  is relevant. Do not explain embeddings or cosine similarity unless asked.
- For simple questions, do not produce long reports.
- You may use short Markdown lists and bold labels. Do not use tables unless
  they materially improve a comparison.
"""



# Defines the routing rules and the meaning of each supported intent.
_INTENT_SYSTEM_INSTRUCTION = """
You are the intent-classification component of SomacaHelper,
an internal assistant for SOMACA IT equipment monitoring.

Responsibilities:
- Classify the user's newest request.
- Extract only parameters supported by RoutingResult.
- Use recent conversation history to resolve clear follow-ups and pronouns.
- Do not answer the question.
- Do not calculate results.
- Do not invent identifiers, dates or database facts.

AnalysisIntent values:
- CONVERSATIONAL:
  A social or conversational turn that does not require operational database
  analysis: greetings, thanks, acknowledgements, closing a clarification
  ("non", "rien", "laisse tomber", "c'est bon"), short conversational
  follow-ups, or an explicit request to change response language.
  Do not use CONVERSATIONAL for general-knowledge questions outside SOMACA.
- MACHINE_STATE:
  Return the current physical state of one machine from SOMACA RADAR.
  Use this for questions such as:
  "quel est l'état de cette machine ?",
  "état actuel de la machine",
  "is this machine operational?",
  "what is the current state of this machine?",
  or equivalent wording.
  This is a supported operational request, not a conversational turn and
  not an unsupported request.
- SEARCH_INCIDENTS:
  Find incidents matching filters such as machine, machine type, pole,
  status, severity or dates.
- INCIDENT_STATISTICS:
  Calculate counts, distributions, aggregates or trends about incidents.
- RELEVANT_PREVIOUS_INCIDENTS:
  Find previous incidents similar to an existing incident or to a newly
  described problem.
- HISTORICAL_SUMMARY:
  Summarize incident history for a machine or area over time.
- EXTERNAL_SUPPORT_ANALYSIS:
  Analyze incident contact/support history, including Renault, other external
  contacts and contact trends.

Routing-state contract:
- Choose exactly one final routing state.
- CONVERSATIONAL is a supported intent. When intent=CONVERSATIONAL:
  unsupported=false, unsupported_reason=null, needs_clarification=false,
  clarification_question=null.
- For an unsupported request:
  intent=null, unsupported=true, unsupported_reason must explain why,
  needs_clarification=false, clarification_question=null.
- For a clarification request:
  unsupported=false, unsupported_reason=null, needs_clarification=true,
  clarification_question must contain the question.
- For a supported operational request:
  unsupported=false, unsupported_reason=null, needs_clarification=false,
  clarification_question=null, and intent must be one of the operational intents.
- Never combine CONVERSATIONAL with unsupported=true.
- An operational request that is outside the implemented analysis capabilities
  is UNSUPPORTED, not CONVERSATIONAL.
- Current machine state is supported through MACHINE_STATE.
- Questions about administration permissions, role-management operations,
  unsupported configuration actions, or unrelated general knowledge remain
  outside this Helper's operational analysis scope.

Machine identity fields:
- id_machine
- machine_name
- machine_ip
- machine_mac

Group/location filters:
- machine_type
- id_poteau
- poteau_name
- unite_name
- departement_name
- location_level

Important context rules:
- Frontend context is only operational entity context when current_page is
  /cartography.
- current_pole_id identifies the pole currently being viewed in Cartography.
- current_machine_id identifies the exact machine currently being viewed in
  the machine details view.
- If the user says "ce poteau", "this pole", "dans ce poste" or an equivalent
  reference to the currently viewed pole, use current_pole_id as id_poteau.
- If the user says "cette machine", "this machine", "elle" or an equivalent
  reference to the currently viewed machine, use current_machine_id as
  id_machine only when the reference is unambiguous.
- If the user explicitly names another machine or pole, the explicit reference
  always overrides frontend context.
- Never derive or invent a database ID from a typed machine or pole name.
  Typed names belong in machine_name or poteau_name. IDs may come from trusted
  frontend context or an explicit numeric database ID.
- machine_type is a group filter, never a unique machine identifier.
- Natural pole forms such as P5, P-05, P05, "pole 5" and "poteau 5" should be
  preserved as poteau_name when typed by the user; the deterministic backend
  normalizes them.
- For an existing incident similarity request, use reference_incident_id.
- For a newly described problem similarity request, use problem_query.
- Do not copy the whole user question into problem_query unless the question
  actually contains a problem description to compare semantically.

Conversation rules:
- Greetings, acknowledgements, thanks, conversational closure and explicit
  language-switch requests are supported conversation, not unsupported requests.
  Route them as CONVERSATIONAL.
- A short follow-up such as "et elle ?", "pourquoi ?", "et pour celui-là ?"
  should reuse the subject established by recent conversation history when
  there is exactly one clear subject.
- Ask for clarification only when the subject genuinely remains ambiguous.
- Do not use conversation history to invent a cause or fact that was never
  established.

Domain distinctions:
- Machine state is not incident status.
- Incident severity is not machine state.
- "Critique" can describe machine state or incident severity; classify it from
  the wording and requested object.
- Asking for the current state, health or operational condition of a machine
  means MACHINE_STATE.
- MACHINE_STATE is different from incident status and incident severity.
- A question asking whether a machine is Opérationnel, Attention requise,
  Critique or Inconnu must use MACHINE_STATE.

When clarification is required:
- set needs_clarification=true;
- provide one short clarification_question in the user's language.

When the request is outside SomacaHelper's supported operational scope:
- set unsupported=true;
- provide a short unsupported_reason in the user's language.

Leave unknown optional fields as null.
"""


logger = logging.getLogger(__name__)

class SomacaHelperServiceError(RuntimeError):
    """Base error for expected SomacaHelper service failures."""

class SomacaHelperUnavailableError(SomacaHelperServiceError):
    """Raised when the LLM provider cannot process the request."""

class InvalidRoutingResultError(SomacaHelperServiceError):
    """Raised when the LLM output violates the routing contract."""

class SomacaHelperClarificationError(SomacaHelperServiceError):
    def __init__(self, reason: str, details: dict):
        super().__init__(reason)
        self.reason = reason
        self.details = details

# Convert stored messages into a transcript for Gemini
def _format_history(messages: list[SomacaHelperMessage]) -> str:
    if not messages:
        return "(no previous messages)"

    return "\n".join(
        f"{message.role}: {message.content}"
        for message in messages
    )


def _normalize_routing_payload(payload: dict) -> dict:
    normalized = dict(payload)

    unsupported = normalized.get("unsupported") is True
    needs_clarification = normalized.get("needs_clarification") is True
    intent = normalized.get("intent")

    if unsupported:
        normalized["intent"] = None
        normalized["needs_clarification"] = False
        normalized["clarification_question"] = None
        return normalized

    normalized["unsupported"] = False
    normalized["unsupported_reason"] = None

    if needs_clarification:
        if intent == "CONVERSATIONAL":
            normalized["intent"] = None
        return normalized

    normalized["needs_clarification"] = False
    normalized["clarification_question"] = None

    if intent == "CONVERSATIONAL":
        normalized["unsupported"] = False
        normalized["unsupported_reason"] = None

    return normalized


def _validate_routing_response(response) -> RoutingResult:
    if response.parsed is not None:
        try:
            return RoutingResult.model_validate(
                response.parsed
            )
        except ValidationError:
            logger.warning(
                "Gemini parsed routing result failed validation; "
                "attempting safe normalization"
            )

    raw_text = getattr(response, "text", None)
    if not raw_text:
        raise InvalidRoutingResultError(
            "Gemini returned no routing payload"
        )

    try:
        payload = json.loads(raw_text)
    except (TypeError, json.JSONDecodeError) as exc:
        raise InvalidRoutingResultError(
            "Gemini routing response was not valid JSON"
        ) from exc

    if not isinstance(payload, dict):
        raise InvalidRoutingResultError(
            "Gemini routing response was not a JSON object"
        )

    normalized = _normalize_routing_payload(
        payload
    )

    if normalized != payload:
        logger.warning(
            "Normalized inconsistent Gemini routing state: "
            "intent=%r unsupported=%r needs_clarification=%r",
            payload.get("intent"),
            payload.get("unsupported"),
            payload.get("needs_clarification"),
        )

    try:
        return RoutingResult.model_validate(
            normalized
        )
    except ValidationError as exc:
        raise InvalidRoutingResultError(
            "Gemini output violated the routing contract"
        ) from exc

def _clean_model_text(
    value: str,
) -> str:
    return html.unescape(
        value.strip()
    )

# Its input : HelperAskRequest. Its output : RoutingResult
def detect_intent(
    request: HelperAskRequest,
    recent_messages: list[SomacaHelperMessage],
) -> RoutingResult:
    if gemini_client is None:
        logger.error("Gemini client is not configured")
        raise SomacaHelperUnavailableError(
            "Gemini client is not configured"
        ) 

    conversation_context = _format_history(recent_messages)

    prompt = f"""
                Current date:{date.today().isoformat()}
                Conversation history:{conversation_context}
                Frontend context:
                - current_page: {request.context.current_page}
                - current_pole_id: {request.context.current_pole_id}
                - current_machine_id: {request.context.current_machine_id}
                Newest user question:{request.question}

            """
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_INTENT_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=RoutingResult, 
            ),
        )
    except errors.APIError as exc:
        logger.exception(
            "Gemini routing request failed with code %s",
            exc.code,
        )
        raise SomacaHelperUnavailableError(
            "Gemini could not process the routing request"
        ) from exc # from exc connects the new exception to the original one, preserving the traceback and context of the original exception.

    try:
        routing = (
            _validate_routing_response(
                response
            )
        )

        if (
            routing.unsupported_reason
            is not None
        ):
            routing.unsupported_reason = (
                _clean_model_text(
                    routing.unsupported_reason
                )
            )

        if (
            routing.clarification_question
            is not None
        ):
            routing.clarification_question = (
                _clean_model_text(
                    routing.clarification_question
                )
            )

        return routing

    except InvalidRoutingResultError:
        finish_reasons = []
        for candidate in getattr(
            response,
            "candidates",
            None,
        ) or []:
            finish_reason = getattr(
                candidate,
                "finish_reason",
                None,
            )
            if finish_reason is not None:
                finish_reasons.append(
                    str(finish_reason)
                )

        logger.exception(
            "Gemini routing output could not be validated; "
            "finish_reasons=%s",
            finish_reasons,
        )
        raise


_CONVERSATIONAL_SYSTEM_INSTRUCTION = """
You are SOMACA Helper, the conversational interface of SOMACA RADAR.

This call is only for a conversational turn. It does not contain verified
operational facts and must never invent any.

Rules:
- Respond naturally and briefly to greetings, thanks, acknowledgements,
  clarification closures and similar social turns.
- If the user says they do not want to continue a clarification ("non",
  "rien", "laisse tomber", "c'est bon", or equivalent), acknowledge it and
  stop asking for the missing information.
- Maintain the language currently used in the conversation.
- Short or language-neutral messages such as "ok", "merci", "oui", "non",
  numbers, identifiers and names do not by themselves switch the language.
- If the newest meaningful sentence is clearly written in another language,
  respond in that language.
- If the user explicitly asks to switch language, switch immediately.
- You may explain what SOMACA Helper can do, but do not reveal or guess
  internal provider/model details that are not explicitly supplied.
- Do not answer unrelated general-knowledge questions; those belong outside
  SOMACA Helper's operational scope.
- Keep the response concise.
"""


def generate_conversational_answer(
    request: HelperAskRequest,
    recent_messages: list[SomacaHelperMessage],
) -> str:
    if gemini_client is None:
        logger.error("Gemini client is not configured")
        raise SomacaHelperUnavailableError(
            "Gemini client is not configured"
        )

    conversation_context = _format_history(recent_messages)

    prompt = f"""
        Conversation history:
        {conversation_context}

        Newest user message:
        {request.question}

        Respond to the newest conversational turn.
    """

    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=_CONVERSATIONAL_SYSTEM_INSTRUCTION,
            ),
        )
    except errors.APIError as exc:
        logger.exception(
            "Gemini conversational request failed with code %s",
            exc.code,
        )
        raise SomacaHelperUnavailableError(
            "Gemini could not process the conversational request"
        ) from exc

    if not response.text:
        logger.error(
            "Gemini returned an empty conversational answer"
        )
        raise SomacaHelperUnavailableError(
            "Gemini returned no conversational answer"
        )

    return _clean_model_text(
        response.text
    )


# This method receives an already-understood RoutingResult and execute the corresponding deterministic incident analysis.
def analyze_routing(db: Session, routing: RoutingResult) -> dict:
    analysis_service = IncidentAnalysisService(db)
    try:
        return analysis_service.analyze(routing)
    except MachineResolutionError as exc:
        raise SomacaHelperClarificationError(
            reason=exc.reason,
            details={
                "identifiers": exc.identifiers,
                "candidates": exc.candidates,
            },
        ) from exc


def resolve_routing_machine_id(
    db: Session,
    routing: RoutingResult,
    facts: dict | None = None,
) -> int | None:
    facts = facts or {}

    reference_incident = facts.get("reference_incident")
    if isinstance(reference_incident, dict):
        id_machine = reference_incident.get("id_machine")
        if isinstance(id_machine, int):
            return id_machine

    reference_machine = facts.get("reference_machine")
    if isinstance(reference_machine, dict):
        id_machine = reference_machine.get("id_machine")
        if isinstance(id_machine, int):
            return id_machine

    analysis_service = IncidentAnalysisService(db)

    try:
        return analysis_service.resolve_machine_id(routing)
    except MachineResolutionError:
        return None


def generate_final_answer(
    request: HelperAskRequest,
    routing: RoutingResult,
    facts: dict, # Are the verified backend facts coming from the IncidentAnalysisService.analyze method.
    recent_messages: list[SomacaHelperMessage],
) -> str:
    if gemini_client is None:
        logger.error("Gemini client is not configured")
        raise SomacaHelperUnavailableError(
            "Gemini client is not configured"
        )

    conversation_context = _format_history(recent_messages)
    facts_json = json.dumps(
        facts,
        ensure_ascii=False,
        indent=2, 
    )# Convert the facts dictionary into a JSON string with indentation for readability, ensuring that non-ASCII characters are preserved.

    routing_json = json.dumps(
        routing.model_dump(mode="json"), # mode="json" means extract the data in a format suitable for JSON serialization, excluding any internal or private attributes of the RoutingResult object.
        ensure_ascii=False,
        indent=2,
    )

    prompt = f"""
        Conversation history:{conversation_context}
        Newest user question:{request.question}
        Validated routing:{routing_json}
        Verified backend facts:{facts_json}
        Write the final answer to the newest user question.
  """

    try:
        response = (
            gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=_ANSWER_SYSTEM_INSTRUCTION,
                ),
            )
        )

    except errors.APIError as exc:
        logger.exception(
            "Gemini final-answer request failed "
            "with code %s",
            exc.code,
        )
        raise SomacaHelperUnavailableError(
            "Gemini could not generate the final answer"
        ) from exc

    if not response.text:
        logger.error(
            "Gemini returned an empty final answer"
        )
        raise SomacaHelperUnavailableError(
            "Gemini returned no final answer"
        )

    return _clean_model_text(
        response.text
    )

# This method generates a clarification question for the user when the backend cannot uniquely resolve the machine referenced in the user's question. 
# It uses the Gemini LLM to generate a concise and useful clarification question based on the provided resolution details.
def generate_clarification_answer(
    request: HelperAskRequest,
    clarification: SomacaHelperClarificationError,
    recent_messages: list[SomacaHelperMessage] | None = None,
) -> str:
    if gemini_client is None:
        logger.error("Gemini client is not configured")
        raise SomacaHelperUnavailableError("Gemini client is not configured")

    details_json = json.dumps(
        clarification.details,
        ensure_ascii=False,
        indent=2,
    )

    conversation_context = _format_history(
        recent_messages or []
    )

    prompt = f"""
        Conversation history:{conversation_context}
        Newest user question:{request.question}
        Machine resolution reason:{clarification.reason}
        Verified resolution details:{details_json}
        Ask the user for the information needed to continue.
    """

    try:
        response = (
            gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=_CLARIFICATION_SYSTEM_INSTRUCTION,
                ),
            )
        )

    except errors.APIError as exc:
        logger.exception(
            "Gemini clarification request failed with code %s",
            exc.code,
        )
        raise SomacaHelperUnavailableError("Gemini could not generate clarification") from exc

    if not response.text:
        raise SomacaHelperUnavailableError("Gemini returned no clarification")

    return _clean_model_text(
        response.text
    )
