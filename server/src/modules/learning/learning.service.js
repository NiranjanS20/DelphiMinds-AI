const { callGeminiLearning } = require('../../services/geminiLearning.service');
const { AppError } = require('../../middleware/error.middleware');

/**
 * Evaluates the resume score using 4 factors.
 * @param {Object} parsedData 
 * @returns {Object} score, level, reasons
 */
const calculateResumeScore = (parsedData) => {
  let score = 0;
  const reasons = [];

  const { skillsMatch, projects, experience, keywords } = parsedData || {};

  // Mock scoring weights: skillsMatch (40%), projects (20%), experience (20%), keywords (20%)
  if (skillsMatch && typeof skillsMatch === 'number') {
    score += skillsMatch * 0.4;
    reasons.push(`Skills match contributed ${Math.round(skillsMatch * 0.4)} points`);
  } else {
    reasons.push('Missing skills match data');
  }

  if (projects && typeof projects === 'number') {
    score += projects * 0.2;
    reasons.push(`Projects alignment contributed ${Math.round(projects * 0.2)} points`);
  }

  if (experience && typeof experience === 'number') {
    score += experience * 0.2;
    reasons.push(`Experience relevance contributed ${Math.round(experience * 0.2)} points`);
  }

  if (keywords && typeof keywords === 'number') {
    score += keywords * 0.2;
    reasons.push(`Keywords matched contributed ${Math.round(keywords * 0.2)} points`);
  }

  score = Math.min(Math.max(Math.round(score), 0), 100);

  let level = 'beginner';
  if (score >= 70) level = 'advanced';
  else if (score >= 40) level = 'intermediate';

  return {
    score,
    level,
    reasons,
  };
};

/**
 * Diagnostic Report via LLM.
 * @param {Object} userData 
 */
const generateDiagnosticReport = async (userData) => {
  const systemPrompt = `You are an expert career diagnostician. Return a JSON object ONLY.
Structure must be exactly:
{
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "market_gap": ["...", "..."],
  "improvement_areas": ["...", "..."]
}`;

  const message = `
    User Skills: ${userData.skills?.join(', ') || 'None'}
    Missing Skills: ${userData.missingSkills?.join(', ') || 'None'}
    Resume Score: ${userData.score}
    Target Role: ${userData.targetRole}
  `;

  try {
    const rawResponse = await callGeminiLearning({
      systemPrompt,
      message,
    });

    // Cleaning to ensure strict JSON parse
    const jsonStr = rawResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    // Fallback if LLM fails or parse fails
    return {
      strengths: ['Analytical Thinking'],
      weaknesses: userData.missingSkills || ['System Design'],
      market_gap: ['Not meeting senior level requirements yet'],
      improvement_areas: ['Complete structured learning path'],
    };
  }
};

/**
 * Hybrid logic improvement score calculation (Matched / Total) * 40
 */
const calculateImprovement = (missingSkills, coveredSkills) => {
  if (!missingSkills || missingSkills.length === 0) return 40;
  
  const matched = missingSkills.filter(skill => coveredSkills.includes(skill)).length;
  const total = missingSkills.length;
  
  return Math.round((matched / total) * 40);
};

/**
 * Learning Path via LLM. STRICT JSON.
 */
const generateLearningPath = async (userId, role, timeCommitment, level, missingSkills) => {
  const systemPrompt = `You are a learning path generator. Return STRICT JSON without any additional text or markdown formatting.
Structure must be exactly:
{
  "beginner": [{"skill": "", "resource": "", "reason": "", "duration": ""}],
  "intermediate": [{"skill": "", "resource": "", "reason": "", "duration": ""}],
  "advanced": [{"skill": "", "resource": "", "reason": "", "duration": ""}],
  "estimated_score_improvement": 0
}
Rules:
- Resources should be real link names/platforms (e.g. Coursera, Udemy).
- Provide 2-3 items per applicable tier.`;

  const message = `Role: ${role}. Commitment: ${timeCommitment}. Level: ${level}. Missing: ${missingSkills?.join(', ')}`;

  try {
    const rawResponse = await callGeminiLearning({ systemPrompt, message });
    const jsonStr = rawResponse.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const pathData = JSON.parse(jsonStr);

    // Hybrid formula override if we want deterministic improvement score
    const allGenSkills = [
      ...(pathData.beginner || []),
      ...(pathData.intermediate || []),
      ...(pathData.advanced || [])
    ].map(item => item.skill);
    
    pathData.estimated_score_improvement = calculateImprovement(missingSkills, allGenSkills);

    return pathData;
  } catch (error) {
    throw new AppError('Failed to generate learning path', 500);
  }
};

module.exports = {
  calculateResumeScore,
  generateDiagnosticReport,
  generateLearningPath,
  calculateImprovement,
};
