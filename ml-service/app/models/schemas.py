from typing import Literal

from pydantic import BaseModel, Field


class ParseResumeResponse(BaseModel):
    skills: list[str] = Field(default_factory=list)
    experience: str = ""
    education: str = ""


class RecommendRequest(BaseModel):
    skills: list[str] = Field(default_factory=list)


class RecommendResponse(BaseModel):
    careers: list[str] = Field(default_factory=list)
    skill_gaps: list[str] = Field(default_factory=list)


class ATSAnalyzeRequest(BaseModel):
    job_description: str = Field(min_length=1)
    resume_text: str = ""
    resume_skills: list[str] = Field(default_factory=list)
    resume_experience: str = ""
    resume_education: str = ""


class ATSBreakdown(BaseModel):
    keyword_match: float = 0
    skill_relevance: float = 0
    completeness: float = 0


class MissingKeyword(BaseModel):
    keyword: str
    importance: Literal["high", "medium", "low"] = "medium"


class ATSKeywordGap(BaseModel):
    missing_keywords: list[MissingKeyword] = Field(default_factory=list)


class ATSAnalyzeResponse(BaseModel):
    ats_score: float = 0
    breakdown: ATSBreakdown = Field(default_factory=ATSBreakdown)
    match_score: float = 0
    matched_keywords: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    keyword_gap: ATSKeywordGap = Field(default_factory=ATSKeywordGap)
    improvement_suggestions: list[str] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    error: str
