const { callGeminiLearning } = require('../../services/geminiLearning.service');
const { AppError } = require('../../middleware/error.middleware');
const logger = require('../../utils/logger');

/**
 * Calculates resume score from actual parsed data fields.
 */
const calculateResumeScore = (parsedData) => {
  let score = 0;
  const reasons = [];

  const { skillsMatch, projects, experience, keywords } = parsedData || {};

  if (skillsMatch && typeof skillsMatch === 'number') {
    score += skillsMatch * 0.4;
    reasons.push(`Skills match contributed ${Math.round(skillsMatch * 0.4)} points`);
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

  return { score, level, reasons };
};

/**
 * Strip markdown code fences and parse JSON safely.
 */
const safeParseJson = (rawText) => {
  if (!rawText) return null;
  // Remove markdown code fences
  const cleaned = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/gi, '')
    .trim();

  // Find the first { or [ and last } or ]
  const firstBrace = cleaned.search(/[{[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

  if (firstBrace === -1 || lastBrace === -1) return null;

  try {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  } catch (_e) {
    return null;
  }
};

/**
 * Diagnostic Report via LLM.
 */
const generateDiagnosticReport = async (userData) => {
  const systemPrompt = `You are an expert career diagnostician. Your response must be valid JSON only.
Return exactly this structure with no additional text, no markdown, no code blocks:
{"strengths":["..."],"weaknesses":["..."],"market_gap":["..."],"improvement_areas":["..."]}
Each array should have 3-5 items. Be specific and actionable based on the user's actual skills.`;

  const message = `
Analyze this candidate's profile and generate a career diagnostic report:
- Skills: ${userData.skills?.length > 0 ? userData.skills.join(', ') : 'Not specified'}
- Missing/Gap Skills: ${userData.missingSkills?.length > 0 ? userData.missingSkills.join(', ') : 'None identified'}
- Resume Score: ${userData.score}/100
- Target Role: ${userData.targetRole}
- Experience: ${userData.experience ? 'Has experience section' : 'No experience section'}
- Education: ${userData.education ? 'Has education section' : 'No education section'}

Generate specific strengths, weaknesses, market gaps, and improvement areas.`;

  try {
    const rawResponse = await callGeminiLearning({ systemPrompt, message });
    const parsed = safeParseJson(rawResponse);

    if (parsed && typeof parsed === 'object' && (parsed.strengths || parsed.weaknesses)) {
      return {
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        market_gap: Array.isArray(parsed.market_gap) ? parsed.market_gap : [],
        improvement_areas: Array.isArray(parsed.improvement_areas) ? parsed.improvement_areas : [],
      };
    }
  } catch (error) {
    logger.warn('Gemini diagnostic report generation failed, using fallback', { error: error.message });
  }

  // Intelligent fallback based on actual user data
  const skills = userData.skills || [];
  const missing = userData.missingSkills || [];

  return {
    strengths: skills.length > 0
      ? [`Strong foundation in ${skills.slice(0, 3).join(', ')}`, 'Demonstrated technical capability', 'Shows breadth across multiple domains']
      : ['Resume submitted for review', 'Career development intent', 'Proactive in seeking guidance'],
    weaknesses: missing.length > 0
      ? missing.slice(0, 3).map((s) => `Limited proficiency in ${s}`)
      : ['Skill depth could be improved', 'Portfolio evidence not yet assessed'],
    market_gap: [`${userData.targetRole} roles increasingly require cloud and DevOps skills`, 'System design knowledge is in high demand', 'Soft skills like leadership are valued at senior levels'],
    improvement_areas: [`Complete a project demonstrating ${missing[0] || 'system design'}`, 'Add measurable achievements to resume', 'Earn a relevant certification to validate skills'],
  };
};

/**
 * Hybrid improvement score calculation
 */
const calculateImprovement = (missingSkills, coveredSkills) => {
  if (!missingSkills || missingSkills.length === 0) return 40;
  const matched = missingSkills.filter((skill) =>
    coveredSkills.some((s) => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
  ).length;
  return Math.round((matched / missingSkills.length) * 40);
};

/**
 * Learning Path via LLM. Returns structured JSON with beginner/intermediate/advanced stages.
 */
const generateLearningPath = async (userId, role, timeCommitment, level, missingSkills) => {
  const systemPrompt = `You are a learning path generator. Return ONLY valid JSON with no markdown, no code blocks, no extra text.
The JSON must have exactly this structure:
{
  "beginner": [{"skill": "skill name", "resource": "platform/course name", "reason": "why this skill", "duration": "time estimate"}],
  "intermediate": [{"skill": "skill name", "resource": "platform/course name", "reason": "why this skill", "duration": "time estimate"}],
  "advanced": [{"skill": "skill name", "resource": "platform/course name", "reason": "why this skill", "duration": "time estimate"}],
  "estimated_score_improvement": 25
}
Provide 2-3 real, actionable items per tier. Use real platforms like Coursera, Udemy, freeCodeCamp, official docs.`;

  const gapText = Array.isArray(missingSkills) && missingSkills.length > 0
    ? missingSkills.join(', ')
    : 'general skills for this role';

  const message = `Create a personalized learning roadmap:
- Target Role: ${role}
- Time Commitment: ${timeCommitment}
- Current Level: ${level}
- Key Skill Gaps: ${gapText}

Generate practical, role-specific resources for each learning stage.`;

  try {
    const rawResponse = await callGeminiLearning({ systemPrompt, message });
    const parsed = safeParseJson(rawResponse);

    if (parsed && typeof parsed === 'object') {
      const allGenSkills = [
        ...(Array.isArray(parsed.beginner) ? parsed.beginner : []),
        ...(Array.isArray(parsed.intermediate) ? parsed.intermediate : []),
        ...(Array.isArray(parsed.advanced) ? parsed.advanced : []),
      ].map((item) => item.skill || '');

      // Override with deterministic improvement score
      parsed.estimated_score_improvement = calculateImprovement(missingSkills, allGenSkills);

      // Ensure arrays exist
      parsed.beginner = Array.isArray(parsed.beginner) ? parsed.beginner : [];
      parsed.intermediate = Array.isArray(parsed.intermediate) ? parsed.intermediate : [];
      parsed.advanced = Array.isArray(parsed.advanced) ? parsed.advanced : [];

      return parsed;
    }
  } catch (error) {
    logger.warn('Gemini learning path generation failed', { error: error.message });
  }

  // Meaningful fallback
  const roleLower = role.toLowerCase();
  const isML = roleLower.includes('ml') || roleLower.includes('data');
  const isDevOps = roleLower.includes('devops') || roleLower.includes('cloud');

  return {
    beginner: [
      {
        skill: missingSkills?.[0] || (isML ? 'Python for Data Science' : 'JavaScript Fundamentals'),
        resource: isML ? 'Coursera - Python for Everybody' : 'freeCodeCamp - Full Stack Curriculum',
        reason: 'Foundation skill required for this role',
        duration: '4-6 weeks',
      },
      {
        skill: missingSkills?.[1] || 'Git & Version Control',
        resource: 'GitHub Learning Lab',
        reason: 'Essential for collaborative development',
        duration: '1-2 weeks',
      },
    ],
    intermediate: [
      {
        skill: missingSkills?.[2] || (isDevOps ? 'Docker & Containers' : 'System Design Basics'),
        resource: isDevOps ? 'Docker Official Docs + Play with Docker' : 'Grokking the System Design Interview',
        reason: 'Mid-level skill expected in most interviews',
        duration: '6-8 weeks',
      },
      {
        skill: 'Algorithms & Data Structures',
        resource: 'LeetCode / NeetCode.io',
        reason: 'Critical for technical interviews',
        duration: '4-8 weeks',
      },
    ],
    advanced: [
      {
        skill: missingSkills?.[3] || 'Cloud Platform (AWS/GCP)',
        resource: 'AWS Certified Solutions Architect – Associate (Udemy)',
        reason: 'Highly valued in senior roles',
        duration: '8-12 weeks',
      },
    ],
    estimated_score_improvement: 25,
  };
};

module.exports = {
  calculateResumeScore,
  generateDiagnosticReport,
  generateLearningPath,
  calculateImprovement,
};
