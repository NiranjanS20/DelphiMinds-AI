"""
Top-level orchestrator for the Gemini resume extraction pipeline.

Flow: PDF bytes → document_loader → extraction_prompt → gemini_client → Pydantic validation → envelope.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field

from app.core.logging import get_logger
from app.services.document_loader import extract_text
from app.services.extraction_prompt import build_extraction_prompt
from app.services.gemini_resume_client import call_gemini_json

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Pydantic models for Gemini output validation
# ---------------------------------------------------------------------------

class PersonalInformation(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin_url: str = ""
    portfolio_url: str = ""


class CareerMetadata(BaseModel):
    current_job_title: str = ""
    years_of_experience: float = 0
    career_level: str = ""


class SkillEntry(BaseModel):
    name: str = ""
    proficiency: str = "Intermediate"
    evidence: list[str] = Field(default_factory=list)


class SkillsBlock(BaseModel):
    technical_skills: list[SkillEntry] = Field(default_factory=list)
    soft_skills: list[SkillEntry] = Field(default_factory=list)
    tools_and_platforms: list[SkillEntry] = Field(default_factory=list)


class AchievementEntry(BaseModel):
    description: str = ""
    impact: str = ""


class ExperienceEntry(BaseModel):
    company: str = ""
    role: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""
    achievements: list[AchievementEntry] = Field(default_factory=list)
    technologies_used: list[str] = Field(default_factory=list)


class EducationEntry(BaseModel):
    institution: str = ""
    degree: str = ""
    major: str = ""
    graduation_year: str = ""
    gpa: str = ""


class ProjectEntry(BaseModel):
    name: str = ""
    description: str = ""
    technologies_used: list[str] = Field(default_factory=list)
    url: str = ""


class CertificationEntry(BaseModel):
    name: str = ""
    issuer: str = ""
    year: str = ""


class CareerPreferences(BaseModel):
    inferred_domains: list[str] = Field(default_factory=list)
    recommended_roles: list[str] = Field(default_factory=list)


class GapAnalysisSeed(BaseModel):
    missing_skills: list[str] = Field(default_factory=list)


class AiAnalysis(BaseModel):
    confidence_score: float = 0.0
    inferred_roles: list[str] = Field(default_factory=list)
    missing_sections: list[str] = Field(default_factory=list)
    resume_strengths: list[str] = Field(default_factory=list)
    resume_weaknesses: list[str] = Field(default_factory=list)
    ats_readiness_score: float = 0


class ResumeExtraction(BaseModel):
    """Complete validated extraction from Gemini."""
    personal_information: PersonalInformation = Field(default_factory=PersonalInformation)
    summary: str = ""
    career_metadata: CareerMetadata = Field(default_factory=CareerMetadata)
    skills: SkillsBlock = Field(default_factory=SkillsBlock)
    experience: list[ExperienceEntry] = Field(default_factory=list)
    education: list[EducationEntry] = Field(default_factory=list)
    projects: list[ProjectEntry] = Field(default_factory=list)
    certifications: list[CertificationEntry] = Field(default_factory=list)
    career_preferences: CareerPreferences = Field(default_factory=CareerPreferences)
    gap_analysis_seed: GapAnalysisSeed = Field(default_factory=GapAnalysisSeed)
    ai_analysis: AiAnalysis = Field(default_factory=AiAnalysis)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def parse_resume_to_json(file_bytes: bytes, filename: str = "resume.pdf") -> dict[str, Any]:
    """
    End-to-end resume extraction: PDF → structured JSON envelope.

    Args:
        file_bytes: Raw PDF file content.
        filename: Original filename (used for logging).

    Returns:
        Complete envelope with parser_metadata, processing_info,
        raw_resume_text, and all parsed fields.

    Raises:
        ValueError: If the PDF cannot be read or has no extractable text.
        RuntimeError: If Gemini fails after retries.
    """
    logger.info("Starting resume extraction for: %s", filename)

    # Step 1: Extract text from PDF
    extraction_result = extract_text(file_bytes)
    raw_text = extraction_result["text"]

    logger.info(
        "Extracted %d chars from %d pages using %s (fallback=%s)",
        extraction_result["characters_extracted"],
        extraction_result["pages"],
        extraction_result["library_used"],
        extraction_result["fallback_used"],
    )

    # Step 2: Build prompt and call Gemini
    prompt = build_extraction_prompt(raw_text)
    gemini_output = call_gemini_json(prompt)

    # Step 3: Validate with Pydantic (safe defaults for missing fields)
    validated = ResumeExtraction.model_validate(gemini_output)
    parsed_data = validated.model_dump()

    # Step 4: Build the complete envelope
    confidence = parsed_data.get("ai_analysis", {}).get("confidence_score", 0.0)

    envelope: dict[str, Any] = {
        "parser_metadata": {
            "parser_version": "v2",
            "parser_engine": "gemini-2.5-flash",
            "processed_at": datetime.now(timezone.utc).isoformat(),
        },
        "processing_info": {
            "pages": extraction_result["pages"],
            "characters_extracted": extraction_result["characters_extracted"],
            "library_used": extraction_result["library_used"],
            "fallback_used": extraction_result["fallback_used"],
            "warnings": extraction_result["warnings"],
        },
        "raw_resume_text": raw_text,
        "confidence": confidence,
        **parsed_data,
    }

    logger.info(
        "Resume extraction complete. Confidence: %.2f, Skills: %d technical, %d soft, %d tools",
        confidence,
        len(parsed_data.get("skills", {}).get("technical_skills", [])),
        len(parsed_data.get("skills", {}).get("soft_skills", [])),
        len(parsed_data.get("skills", {}).get("tools_and_platforms", [])),
    )

    return envelope
