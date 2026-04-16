/**
 * Utility helper functions used across the application.
 */

/**
 * Format a date to a readable string.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 * @param {string|Date} date
 * @returns {string}
 */
export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

/**
 * Truncate a string to a max length.
 * @param {string} str
 * @param {number} max
 * @returns {string}
 */
export function truncate(str, max = 100) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

/**
 * Get initials from a full name.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get skill level label from a percentage score.
 * @param {number} score
 * @returns {string}
 */
export function getSkillLevel(score) {
  if (score >= 86) return 'Expert';
  if (score >= 61) return 'Advanced';
  if (score >= 31) return 'Intermediate';
  return 'Beginner';
}

/**
 * Generate a color for a skill score.
 * @param {number} score
 * @returns {string}
 */
export function getSkillColor(score) {
  if (score >= 86) return '#7c5cfc';
  if (score >= 61) return '#4ade80';
  if (score >= 31) return '#facc15';
  return '#f87171';
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format file size to human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Class name concatenation utility.
 * @param  {...string} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
