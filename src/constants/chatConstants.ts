/**
 * Chat Constants
 * Quick actions, suggestions, and other static data
 */

export const QUICK_ACTIONS = [
  { icon: "🎯", label: "View Projects", query: "Show me your projects" },
  { icon: "💼", label: "Experience", query: "Tell me about your experience" },
  { icon: "⚡", label: "Skills", query: "What are your top skills?" },
  { icon: "📧", label: "Contact", query: "How can I contact you?" },
];

export const INTRO_SUGGESTIONS = [
  "Ask for a project walkthrough",
  "Request a summary of skills",
  "Learn about recent achievements",
];

export const CHAT_PLACEHOLDERS = {
  ASK_AIVA: "Ask AIVA...",
  LISTENING: "Listening...",
} as const;

export const DICTATION_MESSAGES = {
  PLACEHOLDER: "Dictating... (say 'send' or 'enter' to submit)",
  STATUS_LABEL: "Dictation in progress",
  AUTO_SEND_HINT: "(auto-send after 5s pause)",
} as const;

export const LISTENING_MESSAGES = {
  STATUS_LABEL: "Listening to send",
  READY_STATUS: "AIVA is ready",
} as const;
