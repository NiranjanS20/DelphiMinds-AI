import re

from app.utils.preprocessing import normalize_skill, normalize_text


SKILL_KEYWORDS = {
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "golang", "rust",
    "react", "redux", "next.js", "vue", "angular", "html", "css", "tailwind", "sass",
    "node.js", "node", "express", "fastapi", "django", "flask", "spring", "spring boot",
    "rest api", "graphql", "microservices", "sql", "postgresql", "postgres", "mysql", "mongodb",
    "redis", "elasticsearch", "firebase", "docker", "kubernetes", "terraform", "jenkins",
    "github actions", "aws", "azure", "gcp", "tensorflow", "pytorch", "machine learning",
    "deep learning", "nlp", "computer vision", "pandas", "numpy", "scikit-learn", "spark",
    "git", "github", "gitlab", "ci/cd", "linux", "tableau", "power bi", "excel", "figma",
    "agile", "scrum", "jira", "data analysis", "data visualization", "etl", "devops",
}

_SECTION_HEADINGS = (
    "summary", "profile", "objective", "experience", "work experience", "professional experience",
    "employment history", "education", "academic background", "qualification", "qualifications",
    "projects", "skills", "technical skills", "certifications", "achievements", "awards",
)

_HEADING_PATTERN = re.compile(
    r"^\s*(" + "|".join(re.escape(h) for h in sorted(_SECTION_HEADINGS, key=len, reverse=True)) + r")\s*[:\-–—]?\s*$",
    flags=re.IGNORECASE,
)
_INLINE_HEADING_PATTERN = re.compile(
    r"^\s*(" + "|".join(re.escape(h) for h in sorted(_SECTION_HEADINGS, key=len, reverse=True)) + r")\s*[:\-–—]\s*(.+)$",
    flags=re.IGNORECASE,
)

_BULLET_PREFIX_PATTERN = re.compile(r"^[\s•*\-–—]+")
_SPLIT_SKILL_PATTERN = re.compile(r"[,;|/]|\s{2,}")


def _parse_inline_heading(line: str) -> tuple[str, str] | None:
    match = _INLINE_HEADING_PATTERN.match(line.strip())
    if not match:
        return None
    return match.group(1).lower(), match.group(2).strip()


def _is_heading(line: str) -> str | None:
    stripped = line.strip()
    if not stripped:
        return None

    match = _HEADING_PATTERN.match(stripped)
    if match:
        return match.group(1).lower()

    # Resumes often use all-caps headings without punctuation.
    normalized = stripped.lower()
    if len(stripped.split()) <= 3 and normalized in _SECTION_HEADINGS:
        return normalized

    return None


def _extract_section(text: str, heading_candidates: tuple[str, ...], max_chars: int = 2500) -> str:
    lines = text.splitlines()
    candidate_set = {candidate.lower() for candidate in heading_candidates}
    capturing = False
    chunks: list[str] = []

    for line in lines:
        inline_heading = _parse_inline_heading(line)
        heading = inline_heading[0] if inline_heading else _is_heading(line)
        inline_content = inline_heading[1] if inline_heading else ''

        if heading:
            if capturing and heading not in candidate_set:
                break
            if heading in candidate_set:
                capturing = True
                chunks.append(heading.title())
                if inline_content:
                    chunks.append(inline_content)
                continue

        if capturing:
            chunks.append(line.strip())

    section = normalize_text("\n".join(chunk for chunk in chunks if chunk), preserve_lines=True)
    return section[:max_chars]


def extract_summary(text: str) -> str:
    section = _extract_section(text, ("summary", "profile", "objective"), max_chars=900)
    if section:
        return section

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    filtered = [line for line in lines if not _is_heading(line)][:4]
    return normalize_text(" ".join(filtered))[:700]


def _skills_from_skills_section(text: str) -> list[str]:
    section = _extract_section(text, ("skills", "technical skills"), max_chars=1600)
    if not section:
        return []

    candidates: list[str] = []
    for line in section.splitlines()[1:]:
        cleaned_line = _BULLET_PREFIX_PATTERN.sub("", line).strip()
        for piece in _SPLIT_SKILL_PATTERN.split(cleaned_line):
            candidate = piece.strip(" .:()[]{}")
            if 1 < len(candidate) <= 40 and not _is_heading(candidate):
                candidates.append(candidate)

    return candidates


def extract_skills(text: str) -> list[str]:
    plain_text = normalize_text(text)
    lower_text = plain_text.lower()
    found: list[tuple[int, str]] = []

    for skill in SKILL_KEYWORDS:
        pattern = r"(?<![a-z0-9+#.])" + re.escape(skill.lower()) + r"(?![a-z0-9+#.])"
        match = re.search(pattern, lower_text)
        if match:
            canonical = "Go" if skill == "golang" else skill
            found.append((match.start(), canonical))

    for skill in _skills_from_skills_section(text):
        found.append((lower_text.find(skill.lower()) if skill.lower() in lower_text else len(lower_text), skill))

    found.sort(key=lambda item: (item[0], item[1].lower()))

    unique_skills: list[str] = []
    seen: set[str] = set()
    for _, skill in found:
        normalized = normalize_skill(skill)
        if normalized and normalized not in seen:
            unique_skills.append(skill)
            seen.add(normalized)

    return unique_skills[:40]


def extract_experience(text: str) -> str:
    return _extract_section(
        text,
        (
            "professional experience",
            "work experience",
            "experience",
            "employment history",
        ),
    )


def extract_education(text: str) -> str:
    return _extract_section(
        text,
        (
            "education",
            "academic background",
            "qualification",
            "qualifications",
        ),
        max_chars=1200,
    )
