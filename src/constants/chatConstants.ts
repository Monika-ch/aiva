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

export const QUICK_PROMPTS = [
  {
    label: "DeepThink",
    value:
      "Engage DeepThink mode and provide a structured, step-by-step response.",
  },
  {
    label: "Search",
    value:
      "Search the portfolio for stand-out case studies that match this request.",
  },
  {
    label: "Summarize",
    value:
      "Summarize Monika's background and latest projects in two sentences.",
  },
] as const;

export const DICTATION_MESSAGES = {
  STATUS_LABEL: "Dictation in progress",
} as const;

export const LISTENING_MESSAGES = {
  STATUS_LABEL: "Listening to send",
  READY_STATUS: "AIVA is ready",
} as const;

export const UI_TEXT = {
  QUICK_ACTIONS_HEADER: "Quick actions:",
  SUGGESTIONS_HEADER: "Try asking about:",
  FAB_OPEN: "Chat with AIVA",
  FAB_CLOSE: "Close",
  WELCOME_DESCRIPTION:
    "I'm your AI-Powered Portfolio Assistant. I can help you explore projects, discuss technical skills, and answer questions about experience.",
  ROLE_LABELS: {
    AIVA: "AIVA",
    YOU: "You",
  },
} as const;

export const WELCOME_MESSAGES = {
  GREETING:
    "Hi, I'm AIVA your personal AI Virtual Assistant to help you navigate the portfolio",
  SUGGESTIONS: `Try asking me about:
• learn top tech skills
• explore experience
• tell me more about their journey
• do a storytelling on Monika`,
} as const;

export const SWIPE_CONFIG = {
  THRESHOLD: 80,
  RESISTANCE: 2.5,
  ICON_SHOW_OFFSET: 20,
  MIN_HORIZONTAL_DELTA: 10,
} as const;

export const DEFAULT_AI_RESPONSE =
  "That's interesting! Tell me more about your portfolio goals.";

export const AI_RESPONSE_TRANSLATIONS: Record<string, string> = {
  en: DEFAULT_AI_RESPONSE,
  es: "¡Eso es interesante! Cuéntame más sobre tus objetivos de portafolio.",
  fr: "C'est intéressant ! Parle-moi davantage de tes objectifs de portfolio.",
  de: "Das ist interessant! Erzähl mir mehr über deine Portfolio-Ziele.",
  hi: "यह दिलचस्प है! कृपया अपने पोर्टफोलियो लक्ष्यों के बारे में और बताएं।",
  ja: "それは興味深いですね！ポートフォリオの目標についてもっと教えてください。",
  ko: "흥미로운데요! 포트폴리오 목표에 대해 더 이야기해 주세요.",
  zh: "这很有意思！请再多告诉我一些你的作品集目标。",
};
