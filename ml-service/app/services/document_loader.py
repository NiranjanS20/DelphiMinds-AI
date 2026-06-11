"""
Resume document loader with PyMuPDF (primary) and pypdf (fallback).

PyMuPDF extracts text as positioned blocks, naturally handling
multi-column layouts that trip up sequential stream parsers.
"""

from __future__ import annotations

import io
from typing import Any

from app.core.logging import get_logger

logger = get_logger(__name__)

MIN_USEFUL_CHARS = 50


# ---------------------------------------------------------------------------
# Primary extractor — PyMuPDF (fitz)
# ---------------------------------------------------------------------------

def _extract_with_pymupdf(file_bytes: bytes) -> tuple[str, int, list[str]]:
    """
    Extract text using PyMuPDF block-level extraction.

    Each block is a rectangle of text on the page. Sorting by
    (page_number, y0, x0) preserves natural reading order even
    for multi-column resumes.
    """

    import fitz  # PyMuPDF

    warnings: list[str] = []
    all_blocks: list[tuple[int, float, float, str]] = []

    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        page_count = len(doc)

        if page_count == 0:
            raise ValueError("PDF contains zero pages.")

        for page_idx, page in enumerate(doc):
            blocks = page.get_text("blocks")  # list of (x0, y0, x1, y1, text, block_no, block_type)
            text_blocks = [b for b in blocks if b[6] == 0]  # type 0 = text

            if not text_blocks:
                warnings.append(f"Page {page_idx + 1}: no text blocks found (possibly scanned).")
                continue

            for block in text_blocks:
                x0, y0, _x1, _y1, text, _block_no, _block_type = block
                cleaned = text.strip()
                if cleaned:
                    all_blocks.append((page_idx, y0, x0, cleaned))

    # Sort by page, then top-to-bottom, then left-to-right
    all_blocks.sort(key=lambda b: (b[0], b[1], b[2]))
    full_text = "\n".join(block[3] for block in all_blocks)

    return full_text, page_count, warnings


# ---------------------------------------------------------------------------
# Fallback extractor — pypdf
# ---------------------------------------------------------------------------

def _extract_with_pypdf(file_bytes: bytes) -> tuple[str, int, list[str]]:
    """Fallback extraction using pypdf sequential stream parser."""
    from pypdf import PdfReader

    warnings: list[str] = []
    reader = PdfReader(io.BytesIO(file_bytes))
    page_count = len(reader.pages)

    if page_count == 0:
        raise ValueError("PDF contains zero pages.")

    chunks: list[str] = []
    for page_idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if text.strip():
            chunks.append(text.strip())
        else:
            warnings.append(f"Page {page_idx + 1}: no text extracted (possibly scanned).")

    full_text = "\n".join(chunks)
    return full_text, page_count, warnings


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def extract_text(file_bytes: bytes) -> dict[str, Any]:
    """
    Extract text from a PDF resume.

    Returns:
        {
            "text": str,
            "pages": int,
            "characters_extracted": int,
            "library_used": str,
            "fallback_used": bool,
            "warnings": list[str],
        }
    """
    if not file_bytes:
        raise ValueError("Empty file bytes provided.")

    text = ""
    pages = 0
    library_used = "pymupdf"
    fallback_used = False
    warnings: list[str] = []

    # --- Primary: PyMuPDF ---
    try:
        text, pages, pymupdf_warnings = _extract_with_pymupdf(file_bytes)
        warnings.extend(pymupdf_warnings)
    except Exception as exc:
        logger.warning("PyMuPDF extraction failed: %s. Falling back to pypdf.", exc)
        warnings.append(f"PyMuPDF failed: {exc}")
        text = ""

    # --- Fallback: pypdf ---
    if len(text.strip()) < MIN_USEFUL_CHARS:
        try:
            fallback_text, fallback_pages, pypdf_warnings = _extract_with_pypdf(file_bytes)
            warnings.extend(pypdf_warnings)

            if len(fallback_text.strip()) > len(text.strip()):
                text = fallback_text
                pages = fallback_pages
                library_used = "pypdf"
                fallback_used = True
        except Exception as exc:
            logger.error("pypdf fallback also failed: %s", exc)
            warnings.append(f"pypdf fallback failed: {exc}")

    characters_extracted = len(text.strip())

    if characters_extracted < MIN_USEFUL_CHARS:
        raise ValueError(
            f"Resume must be a text-based PDF. Only {characters_extracted} characters "
            "were extracted. Scanned images or password-protected PDFs are not supported."
        )

    return {
        "text": text.strip(),
        "pages": pages,
        "characters_extracted": characters_extracted,
        "library_used": library_used,
        "fallback_used": fallback_used,
        "warnings": warnings,
    }
