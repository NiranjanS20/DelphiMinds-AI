from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import get_embedding_service
from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.schemas import (
    ATSAnalyzeRequest,
    ATSAnalyzeResponse,
    ErrorResponse,
    ParseResumeResponse,
    RecommendRequest,
    RecommendResponse,
)
from app.services.ats_analyzer import analyze_ats_payload
from app.services.embedding_service import EmbeddingService
from app.services.recommender import recommend_careers
from app.services.resume_parser import ResumeParseError, parse_resume_text
from app.services.skill_extractor import extract_education, extract_experience, extract_skills


router = APIRouter(tags=["ml"])
settings = get_settings()
logger = get_logger(__name__)


@router.post(
    "/parse-resume",
    response_model=ParseResumeResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def parse_resume(file: UploadFile = File(...)) -> ParseResumeResponse:
    filename = file.filename or "resume.pdf"
    extension = Path(filename).suffix.lower()

    if extension not in settings.allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Use PDF or DOCX.",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file. Please upload a valid resume.",
        )

    max_size_bytes = settings.max_file_size_mb * 1024 * 1024
    if len(file_bytes) > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max allowed size is {settings.max_file_size_mb} MB.",
        )

    try:
        text = parse_resume_text(file_bytes, filename)
        return ParseResumeResponse(
            skills=extract_skills(text),
            experience=extract_experience(text),
            education=extract_education(text),
        )
    except ResumeParseError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unexpected resume parsing failure: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse resume.",
        ) from exc
    finally:
        await file.close()


@router.post(
    "/recommend",
    response_model=RecommendResponse,
    responses={500: {"model": ErrorResponse}},
)
def recommend(
    payload: RecommendRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
) -> RecommendResponse:
    try:
        careers, skill_gaps = recommend_careers(payload.skills, embedding_service)
        return RecommendResponse(careers=careers, skill_gaps=skill_gaps)
    except Exception as exc:
        logger.exception("Recommendation generation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations.",
        ) from exc


@router.post(
    "/analyze-ats",
    response_model=ATSAnalyzeResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
def analyze_ats(payload: ATSAnalyzeRequest) -> ATSAnalyzeResponse:
    job_description = payload.job_description.strip()
    if not job_description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description is required.",
        )

    try:
        result = analyze_ats_payload(
            job_description=job_description,
            resume_text=payload.resume_text,
            resume_skills=payload.resume_skills,
            resume_experience=payload.resume_experience,
            resume_education=payload.resume_education,
        )
        return ATSAnalyzeResponse(**result)
    except Exception as exc:
        logger.exception("ATS analysis failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze ATS match.",
        ) from exc
