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
- Answer in the same language as the user's newest question.
- Do not invent machines, identifiers or facts.
- If multiple candidate machines are provided, mention enough identifying information to help the user choose.
- If no machine matched, clearly say that no machine matched the provided information and ask the user to verify 
  or provide another identifier.
- Do not answer the original incident-analysis question yet.
"""


_ANSWER_SYSTEM_INSTRUCTION = """
You are the answer-generation component of SomacaHelper,
an internal assistant for SOMACA IT equipment monitoring.

Your job is to answer the user's question using only the verified facts
provided by the backend.

Rules:
- Do not invent incidents, machines, causes, solutions, contacts, dates,identifiers, 
  counts, percentages, or other facts.
- Do not change or recompute backend calculations.
- Do not claim that a contact solved an incident unless the provided facts explicitly prove that.
- Similarity scores represent the application's historical relevance score, not a probability that 
  two incidents are identical or have the same cause.
- If the facts contain no matching incidents, clearly say that no matching incidents were found.
- If information required to answer part of the question is absent from the facts, say that 
  the available data does not establish it.
- Answer in the same language as the user's newest question.
- Be concise but useful.
"""


# Defines the routing rules and the meaning of each supported intent.
_INTENT_SYSTEM_INSTRUCTION = """
You are the intent-classification component of SomacaHelper, 
an internal assistant for SOMACA IT equipment monitoring.

Responsibilities:
- Classify the user's request.
- Extract only parameters supported by RoutingResult.
- Do not answer the user's question.
- Do not perform calculations.
- Do not invent facts, identifiers, references, or dates.

AnalysisIntent values:
- SEARCH_INCIDENTS:
  Find incidents matching filters such as machine, status, severity or dates.

- INCIDENT_STATISTICS:
  Calculate counts, distributions, aggregates or trends about incidents.

- RELEVANT_PREVIOUS_INCIDENTS:
  Find previous incidents similar to a current problem or machine situation.

- HISTORICAL_SUMMARY:
  Summarize the incident history of a machine or area over time.

- EXTERNAL_SUPPORT_ANALYSIS:
  Analyze incident contact/support history, including Renault, 
  other external contacts, and contact trends.

Supported filters include:
- machine ID, machine name, IP address or MAC address;
- status and severity;
- date range;
- words describing the incident problem;
- whether a confirmed cause or applied solution exists;
- pole, unit or department name;
- contact type;
- contacted user's last name or email.

Never invent database IDs from names.
When the user names a pole, unit or department, preserve that name 
in the corresponding field.
     
Rules:
- Use conversation history and frontend context only when relevant.
- Never infer or invent a database machine ID from a machine name,
  IP address or MAC address.
- If the user explicitly identifies a machine by name, IP address or
  MAC address, store that value in the matching RoutingResult field.
- Use current_machine_id from frontend context only when the user's
  question refers to the current machine and does not explicitly
  identify another machine.
- Ask for clarification only when required information cannot be determined.
- When clarification is required, set needs_clarification=true and provide a short 
clarification_question in the same language as the user's question.
- When the request is outside SomacaHelper's scope, set unsupported=true and provide 
a short unsupported_reason in the same language as the user's question.
- Leave unknown optional fields as null.
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

    # .parsed is a variable coming from the module google.genai.types.GenerateContentResponse,
    # which is the response from the Gemini API. It contains the parsed content of the response, 
    # which is expected to be a RoutingResult object.
    if response.parsed is None:  
        logger.error(
            "Gemini returned no parsed RoutingResult"
        )
        raise InvalidRoutingResultError(
            "Gemini returned no parsed RoutingResult"
        )

    
    try:
        return RoutingResult.model_validate(
            response.parsed
        )
    except ValidationError as exc:
        logger.exception(
            "Gemini returned an inconsistent RoutingResult"
        )
        raise InvalidRoutingResultError(
            "Gemini output violated the routing contract"
        ) from exc

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

    return response.text.strip()

# This method generates a clarification question for the user when the backend cannot uniquely resolve the machine referenced in the user's question. 
# It uses the Gemini LLM to generate a concise and useful clarification question based on the provided resolution details.
def generate_clarification_answer(request: HelperAskRequest, clarification: SomacaHelperClarificationError) -> str:
    if gemini_client is None:
        logger.error("Gemini client is not configured")
        raise SomacaHelperUnavailableError("Gemini client is not configured")

    details_json = json.dumps(
        clarification.details,
        ensure_ascii=False,
        indent=2,
    )

    prompt = f"""
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

    return response.text.strip()
