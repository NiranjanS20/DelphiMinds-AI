from dataclasses import dataclass


@dataclass(frozen=True)
class CareerProfile:
    title: str
    required_skills: tuple[str, ...]


CAREER_PROFILES: tuple[CareerProfile, ...] = (
    CareerProfile(
        title="Backend Developer",
        required_skills=("python", "node.js", "sql", "postgresql", "docker", "git"),
    ),
    CareerProfile(
        title="Data Scientist",
        required_skills=("python", "machine learning", "pandas", "numpy", "sql", "statistics"),
    ),
    CareerProfile(
        title="ML Engineer",
        required_skills=("python", "machine learning", "deep learning", "docker", "aws", "tensorflow"),
    ),
    CareerProfile(
        title="Frontend Developer",
        required_skills=("javascript", "react", "html", "css", "typescript", "git"),
    ),
    CareerProfile(
        title="DevOps Engineer",
        required_skills=("docker", "kubernetes", "aws", "ci/cd", "linux", "terraform"),
    ),
)
