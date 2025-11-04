/**
 * Voice Command Utilities
 * Handles recognition and processing of voice commands in dictation mode
 */

// Send command words in multiple languages
export const SEND_COMMAND_WORDS = [
  "send",
  "enviar",
  "envoyer",
  "senden",
  "invia",
  "envoie",
  "송신",
  "送信",
];

// Regex to match send commands at the end of text
export const SEND_COMMAND_REGEX = new RegExp(
  `(?:\\b(${SEND_COMMAND_WORDS.join("|")})\\b[\\s.!?]*)$`,
  "i"
);

/**
 * Normalizes command text by removing punctuation and converting to lowercase
 */
export const normalizeCommandText = (text: string): string =>
  text.replace(/[.!?]/g, "").trim().toLowerCase();

/**
 * Checks if the text is an "enter" command
 */
export const isEnterCommand = (text: string): boolean =>
  normalizeCommandText(text) === "enter";

/**
 * Checks if the text is a "clear" command
 */
export const isClearCommand = (text: string): boolean =>
  normalizeCommandText(text) === "clear";

/**
 * Checks if the text is a "delete" command
 */
export const isDeleteCommand = (text: string): boolean =>
  normalizeCommandText(text) === "delete";

/**
 * Counts how many times "delete" appears as a complete command
 * Used to determine how many words to delete
 */
export const countDeleteCommands = (text: string): number => {
  const normalized = normalizeCommandText(text);
  const words = normalized.split(/\s+/);
  return words.filter((word) => word === "delete").length;
};

/**
 * Strips send command from text and returns the remaining text
 * Returns an object with the cleaned text and a flag indicating if send was triggered
 */
export const stripSendCommand = (
  text: string
): { text: string; triggered: boolean } => {
  const match = text.match(SEND_COMMAND_REGEX);
  if (!match || match.index === undefined) {
    return { text, triggered: false };
  }
  const remaining = text.slice(0, match.index).trim();
  return { text: remaining, triggered: true };
};

/**
 * Normalizes AIVA name variations from speech recognition
 * Replaces common phonetic variations with the correct spelling
 */
export const normalizeAivaName = (text: string): string => {
  return text
    .replace(/\b(ava|eva|iva|aiva|eiva|ayva|eyva|aeva|iowa)\b/gi, "AIVA")
    .replace(
      /\bhi\s+(ava|eva|iva|aiva|eiva|ayva|eyva|aeva|iowa)\b/gi,
      "hi AIVA"
    );
};
