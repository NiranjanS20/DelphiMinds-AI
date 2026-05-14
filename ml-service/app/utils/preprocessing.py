import re


_HORIZONTAL_WHITESPACE_PATTERN = re.compile(r"[\t\r\f\v ]+")
_BLANK_LINE_PATTERN = re.compile(r"\n{3,}")
_WHITESPACE_PATTERN = re.compile(r"\s+")


def normalize_text(text: str, preserve_lines: bool = False) -> str:
    if not text:
        return ""

    normalized = text.replace("\x00", " ")
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")

    if preserve_lines:
        lines = [_HORIZONTAL_WHITESPACE_PATTERN.sub(" ", line).strip() for line in normalized.split("\n")]
        normalized = "\n".join(line for line in lines if line)
        normalized = _BLANK_LINE_PATTERN.sub("\n\n", normalized)
        return normalized.strip()

    normalized = _WHITESPACE_PATTERN.sub(" ", normalized)
    return normalized.strip()


def normalize_skill(skill: str) -> str:
    return normalize_text(skill).lower()
