/**
 * Lightweight store for future state management needs.
 * Currently the app uses React Context for auth state.
 * This file can be upgraded to Redux Toolkit if needed.
 */

// Simple pub-sub event bus for cross-component communication
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}

export const eventBus = new EventBus();

export default eventBus;
