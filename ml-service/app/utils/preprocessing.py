import re


_WHITESPACE_PATTERN = re.compile(r"\s+")


def normalize_text(text: str) -> str:
    if not text:
        return ""
    normalized = text.replace("\x00", " ")
    normalized = _WHITESPACE_PATTERN.sub(" ", normalized)
    return normalized.strip()


def normalize_skill(skill: str) -> str:
    return normalize_text(skill).lower()
