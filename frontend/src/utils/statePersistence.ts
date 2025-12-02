/**
 * State Persistence Utility
 * Handles saving and restoring application state on refresh
 */

interface PersistedState {
  [key: string]: any;
  timestamp: number;
}

const STATE_KEY = 'reddy_anna_state';
const STATE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export class StatePersistence {
  /**
   * Save state to localStorage
   */
  static saveState(key: string, data: any): void {
    try {
      const state = this.getPersistedState();
      state[key] = data;
      state.timestamp = Date.now();
      
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  static loadState<T>(key: string, defaultValue: T): T {
    try {
      const state = this.getPersistedState();
      
      // Check if state is expired
      if (Date.now() - state.timestamp > STATE_EXPIRY) {
        this.clearState();
        return defaultValue;
      }
      
      return state[key] !== undefined ? state[key] : defaultValue;
    } catch (error) {
      console.error('Failed to load state:', error);
      return defaultValue;
    }
  }

  /**
   * Get entire persisted state
   */
  private static getPersistedState(): PersistedState {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to parse persisted state:', error);
    }
    
    return { timestamp: Date.now() };
  }

  /**
   * Clear all persisted state
   */
  static clearState(): void {
    try {
      localStorage.removeItem(STATE_KEY);
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  }

  /**
   * Clear specific key
   */
  static clearKey(key: string): void {
    try {
      const state = this.getPersistedState();
      delete state[key];
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to clear key:', error);
    }
  }

  /**
   * Auto-save with debounce
   */
  static createAutoSaver(key: string, delay: number = 1000) {
    let timeout: NodeJS.Timeout;
    
    return (data: any) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveState(key, data);
      }, delay);
    };
  }
}

/**
 * Game State Persistence
 */
export const gameStatePersistence = {
  save: (state: any) => StatePersistence.saveState('gameState', state),
  load: () => StatePersistence.loadState('gameState', null),
  clear: () => StatePersistence.clearKey('gameState'),
};

/**
 * Betting State Persistence
 */
export const bettingStatePersistence = {
  save: (state: any) => StatePersistence.saveState('bettingState', state),
  load: () => StatePersistence.loadState('bettingState', {
    activeBets: [],
    pendingBets: [],
    lastBetAmount: 0,
  }),
  clear: () => StatePersistence.clearKey('bettingState'),
};

/**
 * Stream State Persistence
 */
export const streamStatePersistence = {
  save: (state: any) => StatePersistence.saveState('streamState', state),
  load: () => StatePersistence.loadState('streamState', {
    isPlaying: false,
    quality: 'auto',
    volume: 100,
    muted: false,
  }),
  clear: () => StatePersistence.clearKey('streamState'),
};

/**
 * User Preferences Persistence
 */
export const userPreferencesPersistence = {
  save: (preferences: any) => StatePersistence.saveState('userPreferences', preferences),
  load: () => StatePersistence.loadState('userPreferences', {
    theme: 'dark',
    language: 'en',
    soundEnabled: true,
    notificationsEnabled: true,
  }),
  clear: () => StatePersistence.clearKey('userPreferences'),
};