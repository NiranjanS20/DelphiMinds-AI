from app.models.ml_models import CAREER_PROFILES
from app.services.embedding_service import EmbeddingService
from app.utils.preprocessing import normalize_skill


def recommend_careers(
    skills: list[str],
    embedding_service: EmbeddingService | None = None,
) -> tuple[list[str], list[str]]:
    normalized_skills = {normalize_skill(skill) for skill in skills if normalize_skill(skill)}
    if not normalized_skills:
        return [], []

    scored_profiles: list[tuple[float, str, list[str]]] = []

    for profile in CAREER_PROFILES:
        required = [normalize_skill(skill) for skill in profile.required_skills]
        matched = [skill for skill in required if skill in normalized_skills]
        missing = [skill for skill in required if skill not in normalized_skills]

        keyword_score = len(matched) / max(len(required), 1)

        if embedding_service is not None:
            user_text = " ".join(sorted(normalized_skills))
            profile_text = f"{profile.title} {' '.join(required)}"
            semantic_score = max(embedding_service.cosine_similarity(user_text, profile_text), 0.0)
            total_score = (0.85 * keyword_score) + (0.15 * semantic_score)
        else:
            total_score = keyword_score

        scored_profiles.append((total_score, profile.title, missing))

    scored_profiles.sort(key=lambda item: item[0], reverse=True)

    top_profiles = scored_profiles[:3]
    careers = [title for score, title, _ in top_profiles if score > 0]

    if not careers:
        careers = [title for _, title, _ in top_profiles]

    skill_gaps = top_profiles[0][2] if top_profiles else []
    return careers, skill_gaps
