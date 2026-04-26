import re
from collections import Counter


_TOKEN_PATTERN = re.compile(r"[a-zA-Z][a-zA-Z0-9\+#\./\-]{1,}")

_STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "with",
    "you",
    "your",
    "we",
    "our",
    "will",
    "this",
    "have",
    "has",
    "must",
    "should",
    "can",
    "ability",
    "skills",
    "skill",
    "experience",
    "preferred",
    "requirements",
    "requirement",
    "team",
    "work",
    "role",
    "job",
}

_PHRASE_KEYWORDS = (
    "machine learning",
    "deep learning",
    "natural language processing",
    "data analysis",
    "data visualization",
    "project management",
    "software development",
    "system design",
    "problem solving",
    "cloud computing",
)

_CRITICAL_KEYWORDS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "react",
    "node.js",
    "fastapi",
    "django",
    "flask",
    "spring",
    "nlp",
    "machine learning",
    "data analysis",
    "data visualization",
}

_IMPORTANCE_PRIORITY = {"high": 0, "medium": 1, "low": 2}


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def _extract_keyword_counts(text: str) -> Counter[str]:
    normalized_text = _normalize(text)
    counts: Counter[str] = Counter()

    if not normalized_text:
        return counts

    for phrase in _PHRASE_KEYWORDS:
        phrase_count = len(re.findall(rf"\b{re.escape(phrase)}\b", normalized_text))
        if phrase_count > 0:
            counts[phrase] += phrase_count

    for token in _TOKEN_PATTERN.findall(normalized_text):
        if token in _STOP_WORDS:
            continue
        if token.isdigit() or len(token) <= 1:
            continue
        counts[token] += 1

    return counts


def _rank_keywords(keyword_counts: Counter[str], limit: int = 60) -> list[str]:
    ranked = sorted(
        keyword_counts.items(),
        key=lambda item: (-item[1], -len(item[0]), item[0]),
    )
    return [keyword for keyword, _ in ranked[:limit]]


def _match_keyword_to_skill(keyword: str, resume_skills: set[str]) -> bool:
    if keyword in resume_skills:
        return True

    for skill in resume_skills:
        if keyword in skill or skill in keyword:
            return True

    return False


def _section_completeness(
    resume_text: str,
    resume_experience: str,
    resume_education: str,
    resume_skills: list[str],
) -> tuple[float, dict[str, bool]]:
    normalized_text = _normalize(resume_text)

    skills_present = bool(resume_skills) or ("skills" in normalized_text)
    experience_present = bool(_normalize(resume_experience)) or bool(
        re.search(r"\b(experience|employment|work history|professional summary)\b", normalized_text)
    )
    education_present = bool(_normalize(resume_education)) or bool(
        re.search(r"\b(education|qualification|degree|university|college)\b", normalized_text)
    )

    score = 0.0
    if skills_present:
        score += 40.0
    if experience_present:
        score += 35.0
    if education_present:
        score += 25.0

    return score, {
        "skills": skills_present,
        "experience": experience_present,
        "education": education_present,
    }


def _keyword_importance(keyword: str, frequency: int) -> str:
    if keyword in _CRITICAL_KEYWORDS or frequency >= 3:
        return "high"
    if frequency == 2:
        return "medium"
    return "low"


def _build_improvement_suggestions(
    missing_keyword_gap: list[dict[str, str]],
    section_presence: dict[str, bool],
    keyword_match_score: float,
) -> list[str]:
    suggestions: list[str] = []

    if missing_keyword_gap:
        top_missing = missing_keyword_gap[0]["keyword"]
        suggestions.append(
            f"Add practical evidence of {top_missing} in projects or work experience to improve ATS matching."
        )

    if len(missing_keyword_gap) > 1:
        secondary = missing_keyword_gap[1]["keyword"]
        suggestions.append(
            f"Include the keyword '{secondary}' with concrete achievements to improve keyword coverage."
        )

    if not section_presence.get("experience"):
        suggestions.append("Add an experience section with role, impact, and measurable results.")

    if not section_presence.get("education"):
        suggestions.append("Include an education section with degree, institution, and graduation details.")

    if keyword_match_score < 60:
        suggestions.append(
            "Mirror key terminology from the job description while keeping statements truthful and specific."
        )

    if not section_presence.get("skills"):
        suggestions.append("Add a dedicated skills section listing tools, languages, and frameworks.")

    if len(suggestions) < 3:
        suggestions.append("Add 2 to 3 quantified achievements to strengthen resume relevance.")

    return suggestions[:3]


def analyze_ats_payload(
    job_description: str,
    resume_text: str,
    resume_skills: list[str],
    resume_experience: str,
    resume_education: str,
) -> dict:
    normalized_skills = sorted({_normalize(skill) for skill in resume_skills if _normalize(skill)})

    jd_counts = _extract_keyword_counts(job_description)
    jd_keywords = _rank_keywords(jd_counts)

    resume_counts = _extract_keyword_counts(resume_text)
    for skill in normalized_skills:
        resume_counts[skill] += 2

    resume_keyword_set = set(resume_counts.keys())

    matched_keywords = [keyword for keyword in jd_keywords if keyword in resume_keyword_set]
    missing_keywords = [keyword for keyword in jd_keywords if keyword not in resume_keyword_set]

    denominator = max(len(jd_keywords), 1)
    match_score = round((len(matched_keywords) / denominator) * 100, 2)

    skill_hits = [keyword for keyword in jd_keywords if _match_keyword_to_skill(keyword, set(normalized_skills))]
    skill_relevance = round((len(skill_hits) / denominator) * 100, 2)

    completeness_score, section_presence = _section_completeness(
        resume_text=resume_text,
        resume_experience=resume_experience,
        resume_education=resume_education,
        resume_skills=normalized_skills,
    )

    ats_score = round(
        (0.5 * match_score) + (0.3 * skill_relevance) + (0.2 * completeness_score),
        2,
    )

    keyword_gap = [
        {
            "keyword": keyword,
            "importance": _keyword_importance(keyword, jd_counts.get(keyword, 1)),
        }
        for keyword in missing_keywords
    ]

    keyword_gap.sort(
        key=lambda item: (
            _IMPORTANCE_PRIORITY[item["importance"]],
            -jd_counts.get(item["keyword"], 1),
            item["keyword"],
        )
    )

    improvement_suggestions = _build_improvement_suggestions(
        missing_keyword_gap=keyword_gap,
        section_presence=section_presence,
        keyword_match_score=match_score,
    )

    return {
        "ats_score": max(0.0, min(100.0, ats_score)),
        "breakdown": {
            "keyword_match": max(0.0, min(100.0, match_score)),
            "skill_relevance": max(0.0, min(100.0, skill_relevance)),
            "completeness": max(0.0, min(100.0, completeness_score)),
        },
        "match_score": max(0.0, min(100.0, match_score)),
        "matched_keywords": matched_keywords,
        "missing_keywords": [item["keyword"] for item in keyword_gap],
        "keyword_gap": {
            "missing_keywords": keyword_gap,
        },
        "improvement_suggestions": improvement_suggestions,
    }
