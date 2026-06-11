"""
Extraction prompt for Gemini-powered structured resume parsing.

This prompt enforces strict JSON output matching the DelphiMinds
production schema. Gemini is configured with response_mime_type=
"application/json" at the API level, so this prompt focuses on
the schema definition and extraction instructions.
"""

from __future__ import annotations


SYSTEM_INSTRUCTION = """\
You are a strict data extraction system. You receive raw text extracted from a \
resume PDF. Your task is to parse it into a precise JSON object matching the \
schema below.

RULES:
1. Output ONLY the JSON object. No markdown, no backticks, no explanations.
2. If a section is missing from the resume, use the default value shown in the \
schema (empty string, empty array, or 0).
3. For skills, infer proficiency from context:
   - "Beginner" if mentioned only briefly or in coursework.
   - "Intermediate" if used in 1-2 projects or jobs.
   - "Advanced" if used extensively, led projects, or is a core competency.
4. For "evidence", list project names or company names where the skill was used.
5. For "achievements", separate the description from the quantifiable impact.
6. The resume text may have scrambled columns. Reconstruct sentences logically.
7. "inferred_roles" should be 2-4 job titles this candidate is best suited for.
8. "missing_sections" should list any standard resume sections that are absent \
(e.g., "certifications", "projects", "summary").
9. "resume_strengths" and "resume_weaknesses" are 1-sentence observations about \
resume quality.
10. "ats_readiness_score" is 0-100 based on formatting, keyword density, and \
section completeness.
"""

TARGET_SCHEMA = """\
{
  "personal_information": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin_url": "",
    "portfolio_url": ""
  },
  "summary": "",
  "career_metadata": {
    "current_job_title": "",
    "years_of_experience": 0,
    "career_level": ""
  },
  "skills": {
    "technical_skills": [
      {
        "name": "",
        "proficiency": "Beginner | Intermediate | Advanced",
        "evidence": ["project or company name"]
      }
    ],
    "soft_skills": [
      {
        "name": "",
        "proficiency": "Beginner | Intermediate | Advanced",
        "evidence": []
      }
    ],
    "tools_and_platforms": [
      {
        "name": "",
        "proficiency": "Beginner | Intermediate | Advanced",
        "evidence": []
      }
    ]
  },
  "experience": [
    {
      "company": "",
      "role": "",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or Present",
      "description": "",
      "achievements": [
        {
          "description": "",
          "impact": ""
        }
      ],
      "technologies_used": []
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "major": "",
      "graduation_year": "",
      "gpa": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies_used": [],
      "url": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "year": ""
    }
  ],
  "career_preferences": {
    "inferred_domains": [],
    "recommended_roles": []
  },
  "gap_analysis_seed": {
    "missing_skills": []
  },
  "ai_analysis": {
    "confidence_score": 0.0,
    "inferred_roles": [],
    "missing_sections": [],
    "resume_strengths": [],
    "resume_weaknesses": [],
    "ats_readiness_score": 0
  }
}
"""


def build_extraction_prompt(resume_text: str) -> str:
    """
    Build the full prompt to send to Gemini.

    The system instruction is set separately via the model's
    system_instruction parameter. This function returns the
    user-turn content.
    """
    return (
        f"Parse the following resume text into the required JSON schema.\n\n"
        f"REQUIRED JSON SCHEMA:\n{TARGET_SCHEMA}\n\n"
        f"RESUME TEXT:\n{resume_text}"
    )
