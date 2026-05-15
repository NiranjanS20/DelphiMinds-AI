/**
 * ml.service.js
 * All communication with the Python FastAPI ML microservice.
 * FIX: parseResume now returns ALL fields (skills, experience, education, summary, rawText)
 *      so that resume.service.js can persist everything to the DB.
 */
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const env = require('../config/env');
const logger = require('../utils/logger');

const MAX_RETRIES = 2;
const ML_BASE_URL = (env.mlServiceUrl || 'http://localhost:8000').replace(/\/$/, '');

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const fallbackParsePayload = (reason = 'ML service unavailable') => ({
  skills: [],
  experience: '',
  education: '',
  summary: '',
  rawText: '',
  parsedData: { skills: [], experience: '', education: '', summary: '', rawText: '', source: 'fallback' },
  meta: { fallback: true, reason },
});

const fallbackRecommendationPayload = (reason = 'ML service unavailable') => ({
  recommendations: [],
  careers: [],
  skill_gaps: [],
  meta: { fallback: true, reason },
});

const fallbackAtsPayload = (reason = 'ML service unavailable') => ({
  ats_score: 0,
  breakdown: { keyword_match: 0, skill_relevance: 0, completeness: 0 },
  match_score: 0,
  matched_keywords: [],
  missing_keywords: [],
  keyword_gap: { missing_keywords: [] },
  improvement_suggestions: [
    'Add role-specific keywords from the job description.',
    'Strengthen your skills, experience, and education sections.',
    'Use measurable achievements aligned with the target role.',
  ],
  meta: { fallback: true, reason },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toArray = (v) => (Array.isArray(v) ? v : []);
const toStr   = (v) => (typeof v === 'string' ? v.trim() : '');
const toNum   = (v, def = 0) => { const n = Number(v); return Number.isFinite(n) ? n : def; };

const normaliseSkill = (raw) => {
  if (typeof raw === 'string') {
    const name = raw.trim();
    return name ? { name, category: 'Extracted', proficiency: 70 } : null;
  }
  if (raw && typeof raw === 'object') {
    const name = toStr(raw.name || raw.skill || '');
    if (!name) return null;
    const rawProf = Number(raw.proficiency ?? raw.level ?? 0);
    const proficiency = Number.isFinite(rawProf) && rawProf > 0
      ? (rawProf <= 10 ? Math.min(100, Math.round(rawProf * 10)) : Math.min(100, Math.round(rawProf)))
      : 70;
    return { name, category: raw.category || 'Extracted', proficiency };
  }
  return null;
};

const normaliseSkillList = (skills) => toArray(skills).map(normaliseSkill).filter(Boolean);

// ─── callParseResume ──────────────────────────────────────────────────────────

const callParseResume = async ({ filePath, originalName, mimetype }) => {
  const endpoint = `${ML_BASE_URL}/parse-resume`;

  if (!filePath || !fs.existsSync(filePath)) {
    logger.warn('[ML] Resume file missing', { filePath });
    return fallbackParsePayload('Resume file not found on disk');
  }

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath), {
        filename: originalName || 'resume.pdf',
        contentType: mimetype || 'application/pdf',
      });

      const response = await axios.post(endpoint, form, {
        headers: form.getHeaders(),
        timeout: 30000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      const d = response.data || {};

      // ML service ParseResumeResponse: {skills[], experience, education, summary, raw_text, metadata}
      const skills     = normaliseSkillList(toArray(d.skills));
      const experience = toStr(d.experience);
      const education  = toStr(d.education);
      const summary    = toStr(d.summary);
      const rawText    = toStr(d.raw_text || d.rawText); // schema field is raw_text
      const metadata   = (d.metadata && typeof d.metadata === 'object') ? d.metadata : {};

      const parsedData = { skills, experience, education, summary, rawText, metadata, source: 'ml-service' };

      logger.info('[ML] Resume parsed', {
        skills: skills.length,
        rawTextLen: rawText.length,
        hasSummary: summary.length > 0,
      });

      return { skills, experience, education, summary, rawText, parsedData, meta: { fallback: false, source: 'ml-service', metadata } };
    } catch (err) {
      attempt += 1;
      logger.warn('[ML] Parse attempt failed', { attempt, error: err.message });
      if (attempt > MAX_RETRIES) {
        logger.error('[ML] All parse attempts failed', { error: err.message });
        return fallbackParsePayload(err.message);
      }
    }
  }
  return fallbackParsePayload();
};

// ─── callRecommendation ───────────────────────────────────────────────────────

const callRecommendation = async (data = {}) => {
  const endpoint = `${ML_BASE_URL}/recommend`;
  const skillNames = toArray(data.skills).map((s) => {
    if (typeof s === 'string') return s.trim();
    if (s && typeof s === 'object') return toStr(s.name || '');
    return '';
  }).filter(Boolean);

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await axios.post(endpoint, { skills: skillNames }, {
        timeout: 20000,
        headers: { 'Content-Type': 'application/json' },
      });
      const d = response.data || {};
      return {
        recommendations: toArray(d.recommendations || d.careers),
        careers: toArray(d.careers),
        skill_gaps: toArray(d.skill_gaps),
        meta: { fallback: false, source: 'ml-service' },
      };
    } catch (err) {
      attempt += 1;
      logger.warn('[ML] Recommend failed', { attempt, error: err.message });
      if (attempt > MAX_RETRIES) return fallbackRecommendationPayload(err.message);
    }
  }
  return fallbackRecommendationPayload();
};

// ─── callAtsAnalysis ──────────────────────────────────────────────────────────

const callAtsAnalysis = async (data = {}) => {
  const endpoint = `${ML_BASE_URL}/analyze-ats`;
  const skillNames = toArray(data.resumeSkills).map((s) => {
    if (typeof s === 'string') return s.trim();
    if (s && typeof s === 'object') return toStr(s.name || '');
    return '';
  }).filter(Boolean);

  const payload = {
    job_description:   toStr(data.jobDescription),
    resume_text:       toStr(data.resumeText),
    resume_skills:     skillNames,
    resume_experience: toStr(data.resumeExperience),
    resume_education:  toStr(data.resumeEducation),
  };

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await axios.post(endpoint, payload, {
        timeout: 25000,
        headers: { 'Content-Type': 'application/json' },
      });
      const r = response.data || {};
      const kw = r.keyword_gap || {};
      return {
        ats_score:    Math.max(0, Math.min(100, toNum(r.ats_score, 0))),
        breakdown: {
          keyword_match:   Math.max(0, Math.min(100, toNum(r.breakdown?.keyword_match, 0))),
          skill_relevance: Math.max(0, Math.min(100, toNum(r.breakdown?.skill_relevance, 0))),
          completeness:    Math.max(0, Math.min(100, toNum(r.breakdown?.completeness, 0))),
        },
        match_score:      Math.max(0, Math.min(100, toNum(r.match_score, 0))),
        matched_keywords: toArray(r.matched_keywords),
        missing_keywords: toArray(r.missing_keywords),
        keyword_gap:      { missing_keywords: toArray(kw.missing_keywords) },
        improvement_suggestions: toArray(r.improvement_suggestions),
        meta: { fallback: false, source: 'ml-service' },
      };
    } catch (err) {
      attempt += 1;
      logger.warn('[ML] ATS failed', { attempt, error: err.message });
      if (attempt > MAX_RETRIES) return fallbackAtsPayload(err.message);
    }
  }
  return fallbackAtsPayload();
};

const parseResume = callParseResume; // main entry for resume.service.js

module.exports = { parseResume, callParseResume, callRecommendation, callAtsAnalysis, analyzeAts: callAtsAnalysis };
