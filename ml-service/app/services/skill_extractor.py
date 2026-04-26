import re

from app.utils.preprocessing import normalize_skill


SKILL_KEYWORDS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "c++",
    "c#",
    "go",
    "rust",
    "react",
    "node.js",
    "express",
    "fastapi",
    "django",
    "flask",
    "spring",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "tensorflow",
    "pytorch",
    "machine learning",
    "deep learning",
    "nlp",
    "pandas",
    "numpy",
    "scikit-learn",
    "git",
    "github",
    "ci/cd",
    "linux",
    "tableau",
    "power bi",
}


_SECTION_BREAK_PATTERN = re.compile(
    r"\n\s*(experience|work experience|professional experience|education|projects|skills|summary)\s*[:\-]?",
    flags=re.IGNORECASE,
)


def _extract_section(text: str, heading_candidates: tuple[str, ...]) -> str:
    lower_text = text.lower()
    start_index = -1

    for heading in heading_candidates:
        marker = heading.lower()
        index = lower_text.find(marker)
        if index != -1 and (start_index == -1 or index < start_index):
            start_index = index

    if start_index == -1:
        return ""

    section_text = text[start_index:]
    match = _SECTION_BREAK_PATTERN.search(section_text[1:])
    if match:
        section_text = section_text[: match.start() + 1]

    return section_text.strip()


def extract_skills(text: str) -> list[str]:
    lower_text = text.lower()
    found: list[tuple[int, str]] = []

    for skill in SKILL_KEYWORDS:
        index = lower_text.find(skill.lower())
        if index != -1:
            found.append((index, skill))

    found.sort(key=lambda item: (item[0], item[1]))

    unique_skills: list[str] = []
    seen: set[str] = set()
    for _, skill in found:
        normalized = normalize_skill(skill)
        if normalized not in seen:
            unique_skills.append(skill)
            seen.add(normalized)

    return unique_skills


def extract_experience(text: str) -> str:
    section = _extract_section(
        text,
        (
            "professional experience",
            "work experience",
            "experience",
            "employment history",
        ),
    )
    return section


def extract_education(text: str) -> str:
    section = _extract_section(
        text,
        (
            "education",
            "academic background",
            "qualification",
            "qualifications",
        ),
    )
    return section
