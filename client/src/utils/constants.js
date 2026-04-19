/** Application-wide constants */

export const APP_NAME = 'DelphiMinds';
export const APP_TAGLINE = 'AI Career Intelligence Platform';

export const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Resume', path: '/resume', icon: 'FileText' },
  { label: 'Jobs', path: '/jobs', icon: 'Briefcase' },
  { label: 'Career Path', path: '/career', icon: 'TrendingUp' },
  { label: 'Skill Gap', path: '/skill-gap', icon: 'Target' },
  { label: 'AI Mentor', path: '/chat', icon: 'MessageSquare' },
  { label: 'Insights', path: '/insights', icon: 'BarChart3' },
];

export const SKILL_LEVELS = {
  BEGINNER: { label: 'Beginner', color: '#f87171', min: 0, max: 30 },
  INTERMEDIATE: { label: 'Intermediate', color: '#facc15', min: 31, max: 60 },
  ADVANCED: { label: 'Advanced', color: '#4ade80', min: 61, max: 85 },
  EXPERT: { label: 'Expert', color: '#7c5cfc', min: 86, max: 100 },
};

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const CHAT_PLACEHOLDER_MESSAGES = [
  'Ask me about career transitions...',
  'What skills should I learn next?',
  'Help me prepare for interviews...',
  'Review my career trajectory...',
  'Suggest learning resources...',
];
