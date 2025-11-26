/**
 * Accessibility Labels Constants
 * ARIA labels, alt text, and titles for all UI elements
 */

export const ARIA_LABELS = {
  CHAT: {
    WIDGET: "AIVA chat",
    INPUT: "Type your question to AIVA",
    SEND: "Send message",
  },
  LANGUAGE: {
    SETTINGS: "Language settings",
  },
  CLEAR_CHAT: {
    BUTTON: "Clear chat history",
  },
  REPLY: {
    CLEAR: "Clear reply",
  },
  VOICE: {
    STOP_LISTENING: "Stop listening",
    START_VOICE: "Start voice input",
    VOICE_INPUT: "Voice input",
  },
  DARK_MODE: {
    TOGGLE: "Toggle dark mode",
  },
  MESSAGE_INPUT: {
    TYPE_MESSAGE: "Type your message",
  },
} as const;

export const TITLES = {
  LANGUAGE: {
    SETTINGS: "Language settings",
  },
  CLEAR_CHAT: {
    BUTTON: "Clear chat",
    HISTORY: "Clear chat history",
  },
  CLOSE: {
    BUTTON: "Close",
  },
  REPLY: {
    CLEAR: "Clear reply",
  },
  VOICE: {
    STOP_LISTENING: "Stop listening",
    VOICE_INPUT: "Voice input",
  },
  DARK_MODE: {
    LIGHT: "Light mode",
    DARK: "Dark mode",
  },
} as const;

export const ALT_TEXT = {
  AIVA: {
    LOGO: "AIVA Logo",
    OPEN_CHAT: "Open AIVA Chat",
  },
} as const;

export const PLACEHOLDERS = {
  SEARCH: "Search...",
} as const;

export const TOGGLE_TEXT = {
  CHAT: {
    OPEN: "Open chat",
    CLOSE: "Close chat",
  },
} as const;
