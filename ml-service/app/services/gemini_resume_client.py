"""
Gemini API client for structured JSON resume extraction.

Adapted from resume_parsing_agent/llm/gemini_client.py.
Key difference: enforces ``response_mime_type="application/json"``
so the model cannot emit markdown wrappers or conversational text.
"""

from __future__ import annotations

import json
import os
import time

import google.generativeai as genai

from app.core.logging import get_logger
from app.services.extraction_prompt import SYSTEM_INSTRUCTION

logger = get_logger(__name__)

_MAX_ATTEMPTS = 2
_MODEL_NAME = "gemini-2.5-flash"


def _get_model() -> genai.GenerativeModel:
    """
    Lazily configure and return the Gemini model.

    Fails fast with a clear error if GEMINI_API_KEY is not set.
    """
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set in ml-service/.env. "
            "Resume parsing requires a valid Gemini API key."
        )

    genai.configure(api_key=api_key)

    return genai.GenerativeModel(
        model_name=_MODEL_NAME,
        system_instruction=SYSTEM_INSTRUCTION,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )


def call_gemini_json(prompt: str) -> dict:
    """
    Send a prompt to Gemini and return a parsed JSON dict.

    Uses ``response_mime_type="application/json"`` to guarantee
    valid JSON output. Retries once on transient failures.

    Args:
        prompt: The user-turn prompt (resume text + schema).

    Returns:
        Parsed dict from the Gemini response.

    Raises:
        RuntimeError: If all attempts are exhausted.
    """
    model = _get_model()
    last_error: Exception | None = None

    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            response = model.generate_content(prompt)
            response_text = response.text

            if not response_text or not response_text.strip():
                raise ValueError("Gemini returned an empty response.")

            parsed = json.loads(response_text)
            logger.info("Gemini parsing succeeded on attempt %d.", attempt)
            return parsed

        except Exception as exc:
            last_error = exc
            logger.warning(
                "Gemini attempt %d/%d failed: %s",
                attempt,
                _MAX_ATTEMPTS,
                exc,
            )
            if attempt < _MAX_ATTEMPTS:
                time.sleep(1)  # brief backoff before retry

    raise RuntimeError(
        f"Gemini resume parsing failed after {_MAX_ATTEMPTS} attempts. "
        f"Last error: {last_error}"
    )
