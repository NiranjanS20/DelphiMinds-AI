import io
import os

import pdfplumber
from docx import Document

from app.utils.preprocessing import normalize_text


class ResumeParseError(Exception):
    pass


def _extract_pdf_text(file_bytes: bytes) -> str:
    text_chunks: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_chunks.append(page_text)
    return "\n".join(text_chunks)


def _extract_docx_text(file_bytes: bytes) -> str:
    document = Document(io.BytesIO(file_bytes))
    lines = [paragraph.text for paragraph in document.paragraphs if paragraph.text.strip()]
    return "\n".join(lines)


def parse_resume_text(file_bytes: bytes, filename: str) -> str:
    extension = os.path.splitext((filename or "").lower())[1]

    if extension == ".pdf":
        raw_text = _extract_pdf_text(file_bytes)
    elif extension == ".docx":
        raw_text = _extract_docx_text(file_bytes)
    else:
        raise ResumeParseError("Unsupported file format. Only PDF and DOCX are allowed.")

    cleaned = normalize_text(raw_text)
    if not cleaned:
        raise ResumeParseError("No readable text found in resume.")

    return cleaned
