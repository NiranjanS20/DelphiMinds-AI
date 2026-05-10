/**
 * Chat session management — abstraction layer for session persistence.
 *
 * Currently uses localStorage. Future-ready for:
 * - DB-backed persistence
 * - Multi-device sync
 * - Server-side session restoration
 *
 * RULE: UI components should NEVER access localStorage directly for chat state.
 *       Always go through this service.
 */

const STORAGE_KEY = 'delphiminds_chat_session';
const SESSIONS_KEY = 'delphiminds_chat_sessions';

const chatSession = {
  /**
   * Get the active session ID.
   * @returns {string|null}
   */
  getActiveSessionId() {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  },

  /**
   * Set the active session ID.
   * @param {string} sessionId
   */
  setActiveSessionId(sessionId) {
    try {
      if (sessionId) {
        localStorage.setItem(STORAGE_KEY, sessionId);
        this._addToSessionList(sessionId);
      }
    } catch {
      // localStorage unavailable — fail silently
    }
  },

  /**
   * Clear the active session (start fresh conversation).
   */
  clearActiveSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // noop
    }
  },

  /**
   * Get list of all known session IDs (for session switcher).
   * @returns {string[]}
   */
  getSessionList() {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Add a session ID to the session list.
   * @param {string} sessionId
   * @private
   */
  _addToSessionList(sessionId) {
    try {
      const sessions = this.getSessionList();
      if (!sessions.includes(sessionId)) {
        sessions.unshift(sessionId);
        // Keep only last 20 sessions
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 20)));
      }
    } catch {
      // noop
    }
  },

  /**
   * Remove a session from the list.
   * @param {string} sessionId
   */
  removeSession(sessionId) {
    try {
      const sessions = this.getSessionList().filter((s) => s !== sessionId);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      if (this.getActiveSessionId() === sessionId) {
        this.clearActiveSession();
      }
    } catch {
      // noop
    }
  },
};

export default chatSession;
