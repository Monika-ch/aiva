/**
 * UI Controls Labels and Text Constants
 * Centralized string constants for UI control buttons
 */

export const UI_CONTROL_LABELS = {
  READ_ALOUD: {
    SPEAKING: "Stop reading",
    NOT_SPEAKING: "Read aloud",
  },
  COPY: {
    COPIED: "Copied!",
    NOT_COPIED: "Copy message",
  },
  REPLY: {
    TITLE: "Reply to message",
    ARIA_LABEL: "Reply to message",
  },
  REACTIONS: {
    HELPFUL: "Helpful",
    NOT_HELPFUL: "Not helpful",
  },
  CLOSE: {
    TITLE: "Close",
    ARIA_LABEL: "Close chat",
  },
  SEND: {
    TITLE: "Send",
    ARIA_LABEL: "Send message",
  },
} as const;
