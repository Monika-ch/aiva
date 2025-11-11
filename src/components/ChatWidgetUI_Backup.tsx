import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";
import { CHAT_PLACEHOLDERS } from "../constants/chatConstants";
// NOTE: Primary chat widget used by the app with all current features enabled.

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  id?: string;
  reaction?: "helpful" | "not-helpful" | null;
}

interface Props {
  messages: Message[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  input: string;
  setInput: (s: string) => void;
  handleSend: (messageOverride?: string) => void;
  unreadCount?: number;
  latestAssistantMessage?: string | null;
  isTyping?: boolean;
  onClearMessages?: () => void;
  onReaction?: (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => void;
}

// Quick action templates
const QUICK_ACTIONS = [
  { icon: "🎯", label: "View Projects", query: "Show me your projects" },
  { icon: "💼", label: "Experience", query: "Tell me about your experience" },
  { icon: "⚡", label: "Skills", query: "What are your top skills?" },
  { icon: "📧", label: "Contact", query: "How can I contact you?" },
];

const INTRO_SUGGESTIONS = [
  "Ask for a project walkthrough",
  "Request a summary of skills",
  "Learn about recent achievements",
];

const LANGUAGE_OPTIONS = [
  { code: "auto", label: "Auto (Browser language)" },
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "es-ES", label: "Spanish (España)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "de-DE", label: "German (Germany)" },
  { code: "hi-IN", label: "Hindi (India)" },
  { code: "ja-JP", label: "Japanese (日本語)" },
  { code: "ko-KR", label: "Korean (한국어)" },
  { code: "zh-CN", label: "Chinese (简体中文)" },
];

const SEND_COMMAND_WORDS = [
  "send",
  "enviar",
  "envoyer",
  "senden",
  "invia",
  "envoie",
  "송신",
  "送信",
];

const SEND_COMMAND_REGEX = new RegExp(
  `(?:\\b(${SEND_COMMAND_WORDS.join("|")})\\b[\\s.!?]*)$`,
  "i"
);

const normalizeCommandText = (text: string) =>
  text.replace(/[.!?]/g, "").trim().toLowerCase();

const stripSendCommand = (text: string) => {
  const match = text.match(SEND_COMMAND_REGEX);
  if (!match || match.index === undefined) {
    return { text, triggered: false };
  }
  const remaining = text.slice(0, match.index).trim();
  return { text: remaining, triggered: true };
};

const isEnterCommand = (text: string) => normalizeCommandText(text) === "enter";

const isClearCommand = (text: string) => normalizeCommandText(text) === "clear";

const isDeleteCommand = (text: string) =>
  normalizeCommandText(text) === "delete";

// Count how many times "delete" appears as a complete command
const countDeleteCommands = (text: string): number => {
  const normalized = normalizeCommandText(text);
  const words = normalized.split(/\s+/);
  return words.filter((word) => word === "delete").length;
};

export const QUICK_ACTIONS_MARKER = "__AIVA_QUICK_ACTIONS__";

const ChatWidgetUI: React.FC<Props> = ({
  messages,
  isOpen,
  setIsOpen,
  input,
  setInput,
  handleSend,
  unreadCount = 0,
  latestAssistantMessage = null,
  isTyping = false,
  onClearMessages,
  onReaction,
}) => {
  // Track clicked suggestions
  const [clickedSuggestions, setClickedSuggestions] = useState<Set<string>>(
    new Set()
  );

  // Reference to message container for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const [voiceInputUsed, setVoiceInputUsed] = useState(false); // Track if voice was used for input
  const recognitionRef = useRef<any>(null);
  const [listeningMode, setListeningMode] = useState<"send" | "dictate" | null>(
    null
  );
  const listeningModeRef = useRef<"send" | "dictate" | null>(null);
  const stopRequestedRef = useRef(false);
  const dictationTranscriptRef = useRef("");
  const dictationBaseInputRef = useRef("");
  const sendModeTranscriptRef = useRef("");
  const sendModeSilenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastProcessedResultIndexRef = useRef(0); // Track last processed result to avoid duplicates
  const languageMenuRef = useRef<HTMLDivElement | null>(null);

  const updateListeningMode = useCallback((mode: "send" | "dictate" | null) => {
    listeningModeRef.current = mode;
    setListeningMode(mode);
  }, []);

  // Text-to-speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<
    number | null
  >(null);

  // Copy notification
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("aiva-dark-mode");
    return saved === "true";
  });

  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [languageSearchTerm, setLanguageSearchTerm] = useState("");
  const [speechLanguage, setSpeechLanguage] = useState(() => {
    return localStorage.getItem("aiva-speech-language") || "auto";
  });
  const [customLanguage, setCustomLanguage] = useState(() => {
    const saved = localStorage.getItem("aiva-speech-language-custom");
    if (!saved) return "";
    return saved;
  });
  const resolvedSpeechLanguage =
    speechLanguage === "auto" ? navigator.language || "en-US" : speechLanguage;
  const isCustomSpeechLanguage =
    speechLanguage !== "auto" &&
    !LANGUAGE_OPTIONS.some((option) => option.code === speechLanguage);

  const effectiveSpeechLocale = useMemo(
    () => (speechLanguage === "auto" ? resolvedSpeechLanguage : speechLanguage),
    [speechLanguage, resolvedSpeechLanguage]
  );

  const filteredLanguageOptions = useMemo(() => {
    if (!languageSearchTerm.trim()) {
      return LANGUAGE_OPTIONS;
    }

    const search = languageSearchTerm.trim().toLowerCase();
    return LANGUAGE_OPTIONS.filter(
      (option) =>
        option.code.toLowerCase().includes(search) ||
        option.label.toLowerCase().includes(search)
    );
  }, [languageSearchTerm]);

  useEffect(() => {
    if (isCustomSpeechLanguage && !customLanguage) {
      setCustomLanguage(speechLanguage);
    }
    if (
      !isCustomSpeechLanguage &&
      customLanguage &&
      LANGUAGE_OPTIONS.some((option) => option.code === speechLanguage)
    ) {
      setCustomLanguage("");
    }
  }, [customLanguage, isCustomSpeechLanguage, speechLanguage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("aiva-current-language", effectiveSpeechLocale);
    } catch (error) {
      // ignore persistence errors
    }
  }, [effectiveSpeechLocale]);

  useEffect(() => {
    if (!languageMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setLanguageMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [languageMenuOpen]);

  useEffect(() => {
    if (!languageMenuOpen) {
      setLanguageSearchTerm("");
    }
  }, [languageMenuOpen]);

  const isVoiceSendActive = isListening && listeningMode === "send";
  const isDictateActive = isListening && listeningMode === "dictate";

  const getVoiceButtonStyle = useCallback(
    (active: boolean): React.CSSProperties => ({
      backgroundColor: active ? "#ef4444" : darkMode ? "#374151" : "#f3f4f6",
      color: active ? "#ffffff" : darkMode ? "#d1d5db" : "#6b7280",
      padding: "10px",
      borderRadius: "8px",
      position: "relative",
      flexShrink: 0,
      transition: "all 0.3s ease",
      boxShadow: active
        ? "0 10px 15px -3px rgba(239, 68, 68, 0.5), 0 4px 6px -2px rgba(239, 68, 68, 0.25)"
        : "none",
      border: "none",
      outline: "none",
    }),
    [darkMode]
  );

  // Helper to normalize AIVA name variations from speech recognition
  const normalizeAivaName = useCallback((text: string): string => {
    // Replace common phonetic variations of "AIVA" with the correct spelling
    // Using word boundaries to avoid replacing within other words
    return text
      .replace(/\b(ava|eva|iva|aiva|eiva|ayva|eyva|aeva|iowa)\b/gi, "AIVA")
      .replace(
        /\bhi\s+(ava|eva|iva|aiva|eiva|ayva|eyva|aeva|iowa)\b/gi,
        "hi AIVA"
      );
  }, []);

  const clearDictationSession = useCallback(() => {
    dictationTranscriptRef.current = "";
    dictationBaseInputRef.current = "";
  }, []);

  const buildDictationCombinedContent = useCallback(() => {
    const base = dictationBaseInputRef.current || "";
    const transcript = dictationTranscriptRef.current || "";

    if (!base) return transcript;
    if (!transcript) return base;

    const baseEndsWithWhitespace = /\s$/.test(base);
    const transcriptStartsWithNewline = transcript.startsWith("\n");
    const separator =
      baseEndsWithWhitespace || transcriptStartsWithNewline ? "" : " ";
    return `${base}${separator}${transcript}`;
  }, []);

  const clearDictationTranscript = useCallback(() => {
    // Clear only the current dictation transcript, not the base input
    dictationTranscriptRef.current = "";
    const base = dictationBaseInputRef.current || "";
    setInput(base);
  }, [setInput]);

  const deleteLastWordsFromDictation = useCallback(
    (wordCount: number) => {
      const current = dictationTranscriptRef.current || "";
      if (!current) return;

      // Split by whitespace, preserving newlines as separate "words"
      const parts = current.split(/(\s+)/);

      // Filter out empty strings and count actual words (non-whitespace)
      const words: string[] = [];
      const separators: string[] = [];

      for (let i = 0; i < parts.length; i++) {
        if (parts[i].trim()) {
          words.push(parts[i]);
          if (i + 1 < parts.length) {
            separators.push(parts[i + 1] || "");
          }
        }
      }

      // Delete the specified number of words from the end
      const wordsToKeep = Math.max(0, words.length - wordCount);
      const separatorsToKeep = Math.max(0, separators.length - wordCount);

      let result = "";
      for (let i = 0; i < wordsToKeep; i++) {
        result += words[i];
        if (i < separatorsToKeep && separators[i]) {
          result += separators[i];
        }
      }

      dictationTranscriptRef.current = result.trimEnd();
      const combined = buildDictationCombinedContent();
      setInput(combined);
    },
    [buildDictationCombinedContent, setInput]
  );

  const appendDictationChunk = useCallback((rawChunk: string) => {
    if (!rawChunk) return;

    if (rawChunk === "\n") {
      const current = dictationTranscriptRef.current || "";
      // Allow multiple consecutive newlines
      dictationTranscriptRef.current = `${current}\n`;
      return;
    }

    const chunk = rawChunk.trim();
    if (!chunk) return;

    const current = dictationTranscriptRef.current || "";
    if (!current) {
      dictationTranscriptRef.current = chunk;
      return;
    }

    const needsSpace = !current.endsWith("\n");
    dictationTranscriptRef.current = `${current}${
      needsSpace ? " " : ""
    }${chunk}`;
  }, []);

  const clearSendModeTimer = useCallback(() => {
    if (sendModeSilenceTimerRef.current) {
      clearTimeout(sendModeSilenceTimerRef.current);
      sendModeSilenceTimerRef.current = null;
    }
  }, []);

  const recordVoiceLanguagePreference = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("aiva-last-voice-language", effectiveSpeechLocale);
      localStorage.setItem("aiva-current-language", effectiveSpeechLocale);
    } catch (error) {
      // ignore storage errors
    }
  }, [effectiveSpeechLocale]);

  const sendUserMessage = useCallback(
    (
      message: string,
      options?: { triggeredByVoice?: boolean; voiceMode?: "send" | "dictate" }
    ) => {
      console.log("[DEBUG] sendUserMessage called with:", { message, options });
      // Trim leading and trailing whitespace/newlines from the message
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        console.log("[DEBUG] Empty message, returning");
        return;
      }

      if (options?.triggeredByVoice) {
        console.log("[DEBUG] Recording voice language preference");
        recordVoiceLanguagePreference();
        // Only auto-read response for "send" mode, not "dictate" mode
        if (options?.voiceMode === "send") {
          setVoiceInputUsed(true);
        } else {
          setVoiceInputUsed(false);
        }
      } else {
        setVoiceInputUsed(false);
      }

      console.log(
        "[DEBUG] Calling handleSend from hook with trimmed message:",
        trimmedMessage
      );
      handleSend(trimmedMessage);
    },
    [handleSend, recordVoiceLanguagePreference]
  );

  const resetListeningState = useCallback(() => {
    const lastMode = listeningModeRef.current;
    setIsListening(false);
    updateListeningMode(null);
    stopRequestedRef.current = false;
    lastProcessedResultIndexRef.current = 0; // Reset for next session
    if (lastMode === "dictate") {
      clearDictationSession();
    }
    if (lastMode === "send") {
      clearSendModeTimer();
      sendModeTranscriptRef.current = "";
    }
  }, [clearDictationSession, clearSendModeTimer, updateListeningMode]);

  const finalizeSendModeMessage = useCallback(() => {
    const message = sendModeTranscriptRef.current.trim();
    clearSendModeTimer();
    sendModeTranscriptRef.current = "";

    if (message) {
      sendUserMessage(message, { triggeredByVoice: true, voiceMode: "send" });
    }

    try {
      stopRequestedRef.current = true;
      recognitionRef.current?.stop();
    } catch (error) {
      // ignore stop errors; state reset happens below
    } finally {
      resetListeningState();
    }
  }, [clearSendModeTimer, resetListeningState, sendUserMessage]);

  useEffect(() => {
    localStorage.setItem("aiva-speech-language", speechLanguage);
  }, [speechLanguage]);

  useEffect(() => {
    if (customLanguage) {
      localStorage.setItem("aiva-speech-language-custom", customLanguage);
    } else {
      localStorage.removeItem("aiva-speech-language-custom");
    }
  }, [customLanguage]);

  const handleSendWithDictation = useCallback(
    (
      messageOverride?: string,
      options?: { triggeredByVoice?: boolean; voiceMode?: "send" | "dictate" }
    ) => {
      console.log("[DEBUG] handleSendWithDictation called:", {
        messageOverride,
        options,
        input,
      });
      const triggeredByVoice = options?.triggeredByVoice ?? false;
      const voiceMode = options?.voiceMode;
      const rawMessage =
        messageOverride !== undefined ? messageOverride : input;

      console.log("[DEBUG] rawMessage:", rawMessage, "voiceMode:", voiceMode);
      // Trim leading and trailing whitespace/newlines
      const messageToSend = rawMessage.trim();
      if (!messageToSend) {
        console.log("[DEBUG] Empty message after trimming, returning");
        return;
      }

      if (
        recognitionRef.current &&
        listeningModeRef.current === "dictate" &&
        isListening
      ) {
        stopRequestedRef.current = true;
        recognitionRef.current.stop();
        setIsListening(false);
        updateListeningMode(null);
        listeningModeRef.current = null;
      }

      clearDictationSession();
      console.log(
        "[DEBUG] Calling sendUserMessage with trimmed message:",
        messageToSend,
        "voiceMode:",
        voiceMode
      );
      sendUserMessage(messageToSend, { triggeredByVoice, voiceMode });
      console.log("[DEBUG] Clearing input");
      setInput("");
    },
    [
      clearDictationSession,
      input,
      isListening,
      sendUserMessage,
      updateListeningMode,
    ]
  );

  // Save/Load conversation history
  useEffect(() => {
    if (isOpen) {
      // Save conversation to localStorage
      localStorage.setItem("aiva-conversation", JSON.stringify(messages));
    }
  }, [messages, isOpen]);

  // Dark mode effect
  useEffect(() => {
    localStorage.setItem("aiva-dark-mode", darkMode.toString());
  }, [darkMode]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Auto-read response if voice input was used
  useEffect(() => {
    if (voiceInputUsed && messages.length > 0 && !isTyping) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        // Automatically read the assistant's response
        setTimeout(() => {
          readAloud(lastMessage.content, messages.length - 1);
          setVoiceInputUsed(false); // Reset the flag
        }, 500); // Small delay to ensure message is rendered
      }
    }
  }, [messages, isTyping, voiceInputUsed]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 140;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [input]);

  // Initialize Speech Recognition (Web Speech API)
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }
      recognitionRef.current.lang = resolvedSpeechLanguage;

      recognitionRef.current.onresult = (event: any) => {
        console.log(
          "[DEBUG] Speech recognition onresult fired, resultIndex:",
          event.resultIndex,
          "total results:",
          event.results.length
        );
        if (stopRequestedRef.current) {
          console.log("[DEBUG] Stop was requested, ignoring result");
          return;
        }

        const mode = listeningModeRef.current;
        console.log("[DEBUG] Current listening mode:", mode);
        if (!mode) {
          console.log("[DEBUG] No mode set, ignoring result");
          return;
        }

        let collectedTranscript = "";

        // Only process NEW final results to avoid duplicates
        const startIndex = Math.max(
          event.resultIndex,
          lastProcessedResultIndexRef.current
        );
        console.log(
          "[DEBUG] Processing results from index",
          startIndex,
          "to",
          event.results.length
        );

        for (let i = startIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          console.log(
            "[DEBUG] Result",
            i,
            "isFinal:",
            result.isFinal,
            "transcript:",
            result[0].transcript
          );

          // Only process final results to avoid duplicates from interim results
          if (result.isFinal) {
            collectedTranscript += result[0].transcript;
            console.log(
              "[DEBUG] Collected final result from index",
              i,
              ":",
              result[0].transcript
            );
            // Update last processed index after processing each final result
            lastProcessedResultIndexRef.current = i + 1;
          }
        }

        const cleanedTranscript = normalizeAivaName(
          collectedTranscript.replace(/\s+/g, " ").trim()
        );
        console.log(
          "[DEBUG] Cleaned and normalized transcript:",
          cleanedTranscript
        );
        if (!cleanedTranscript) {
          console.log("[DEBUG] Empty transcript, ignoring");
          return;
        }

        if (mode === "send") {
          const combinedTranscript = [
            sendModeTranscriptRef.current,
            cleanedTranscript,
          ]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          sendModeTranscriptRef.current = combinedTranscript;

          if (sendModeSilenceTimerRef.current) {
            clearTimeout(sendModeSilenceTimerRef.current);
          }

          sendModeSilenceTimerRef.current = setTimeout(
            finalizeSendModeMessage,
            5000
          );
          return;
        }

        if (mode === "dictate") {
          // Handle "enter" command - add newline
          if (isEnterCommand(cleanedTranscript)) {
            appendDictationChunk("\n");
            const combined = buildDictationCombinedContent();
            setInput(combined);
            return;
          }

          // Handle "clear" command - clear all dictated text
          if (isClearCommand(cleanedTranscript)) {
            clearDictationTranscript();
            return;
          }

          // Handle "delete" command - delete last N words (where N is the number of times "delete" is said)
          if (isDeleteCommand(cleanedTranscript)) {
            const deleteCount = countDeleteCommands(cleanedTranscript);
            deleteLastWordsFromDictation(deleteCount);
            return;
          }

          const { text: chunkWithoutCommand, triggered } =
            stripSendCommand(cleanedTranscript);
          const trimmedChunk = chunkWithoutCommand.trim();

          if (trimmedChunk) {
            appendDictationChunk(trimmedChunk);
            const combined = buildDictationCombinedContent();
            setInput(combined);
          } else if (!triggered) {
            return;
          }

          if (triggered) {
            const finalContent = buildDictationCombinedContent();
            handleSendWithDictation(finalContent, {
              triggeredByVoice: true,
              voiceMode: "dictate",
            });
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("[DEBUG] Speech recognition error:", event?.error, event);
        setVoiceInputUsed(false);

        if (
          listeningModeRef.current === "dictate" &&
          !stopRequestedRef.current &&
          event?.error === "no-speech"
        ) {
          try {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = resolvedSpeechLanguage;
            recognitionRef.current?.start();
            setIsListening(true);
            return;
          } catch (error) {
            // fall through to reset if restart fails
          }
        }

        resetListeningState();
      };

      recognitionRef.current.onend = () => {
        const mode = listeningModeRef.current;
        if (stopRequestedRef.current) {
          resetListeningState();
          return;
        }

        if (mode === "dictate") {
          try {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = resolvedSpeechLanguage;
            recognitionRef.current.start();
            setIsListening(true);
          } catch (error) {
            resetListeningState();
          }
        } else if (mode === "send") {
          if (sendModeSilenceTimerRef.current) {
            try {
              recognitionRef.current.continuous = false;
              recognitionRef.current.interimResults = false;
              recognitionRef.current.lang = resolvedSpeechLanguage;
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              // If restart fails we still wait for the silence timer to finalize
            }
            return;
          }
          resetListeningState();
        } else {
          resetListeningState();
        }
      };
    }
  }, [
    appendDictationChunk,
    buildDictationCombinedContent,
    finalizeSendModeMessage,
    handleSendWithDictation,
    normalizeAivaName,
    resolvedSpeechLanguage,
    resetListeningState,
    setInput,
  ]);

  const handleSpeechCapture = (mode: "send" | "dictate") => {
    console.log("[DEBUG] handleSpeechCapture called with mode:", mode);
    if (!recognitionRef.current) {
      console.log("[DEBUG] recognitionRef.current is null or undefined");
      alert(
        "Voice recognition is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    console.log("[DEBUG] isListening:", isListening);
    if (isListening) {
      if (listeningModeRef.current === "send") {
        if (sendModeTranscriptRef.current.trim()) {
          finalizeSendModeMessage();
          return;
        }
        clearSendModeTimer();
        sendModeTranscriptRef.current = "";
      }
      stopRequestedRef.current = true;
      recognitionRef.current.stop();
      return;
    }

    setVoiceInputUsed(false);
    updateListeningMode(mode);
    stopRequestedRef.current = false;
    lastProcessedResultIndexRef.current = 0; // Reset for new session
    if (mode === "dictate") {
      dictationBaseInputRef.current = input;
      dictationTranscriptRef.current = "";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    } else {
      clearDictationSession();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      clearSendModeTimer();
      sendModeTranscriptRef.current = "";
    }
    recognitionRef.current.lang = resolvedSpeechLanguage;

    console.log(
      "[DEBUG] Starting speech recognition with lang:",
      resolvedSpeechLanguage
    );
    try {
      recognitionRef.current.start();
      setIsListening(true);
      console.log("[DEBUG] Speech recognition started successfully");
    } catch (error) {
      console.error("[DEBUG] Error starting speech recognition:", error);
      setIsListening(false);
      updateListeningMode(null);
    }
  };

  const handleLanguageSelect = useCallback((code: string) => {
    setSpeechLanguage(code);
    if (
      code === "auto" ||
      LANGUAGE_OPTIONS.some((option) => option.code === code)
    ) {
      setCustomLanguage("");
    } else {
      setCustomLanguage(code);
    }
    setLanguageSearchTerm("");
    setLanguageMenuOpen(false);
  }, []);

  const applyCustomLanguage = useCallback(() => {
    const trimmed = customLanguage.trim();
    if (!trimmed) {
      return;
    }
    handleLanguageSelect(trimmed);
  }, [customLanguage, handleLanguageSelect]);

  // Text-to-Speech (Read Aloud)
  const readAloud = (text: string, messageIndex: number) => {
    // Stop any current speech
    window.speechSynthesis.cancel();

    if (isSpeaking && speakingMessageIndex === messageIndex) {
      // If already speaking this message, stop it
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageIndex(messageIndex);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Clear chat history
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setClickedSuggestions(new Set());
      localStorage.removeItem("aiva-conversation");
      // Call the parent clear function
      if (onClearMessages) {
        onClearMessages();
      }
    }
  };

  // Copy message to clipboard with notification
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    });
  };

  // Handle message reaction
  const handleReaction = (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => {
    if (onReaction) {
      onReaction(messageIndex, reaction);
    }
  };

  // Helper to handle suggestion clicks - sends immediately
  const handleSuggestionClick = (suggestion: string) => {
    setClickedSuggestions((prev) => new Set(prev).add(suggestion));
    handleSendWithDictation(suggestion);
  };

  // Handle quick action click
  const handleQuickAction = (query: string) => {
    handleSendWithDictation(query);
  };

  const renderQuickActions = () => (
    <div className="grid grid-cols-2 gap-2 mt-2" style={{ maxWidth: "260px" }}>
      {QUICK_ACTIONS.map((action, idx) => (
        <button
          key={idx}
          onClick={() => handleQuickAction(action.query)}
          className="p-3 rounded-lg transition-transform duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:outline-none cursor-pointer"
          style={{
            backgroundColor: darkMode ? "#1f2937" : "#eef2ff",
            border: `1px solid ${darkMode ? "#4338ca" : "#c7d2fe"}`,
            color: darkMode ? "#e0e7ff" : "#312e81",
            fontWeight: 600,
            boxShadow: darkMode
              ? "0 8px 18px rgba(76, 106, 255, 0.18)"
              : "0 10px 18px rgba(79, 70, 229, 0.14)",
          }}
        >
          <div className="text-2xl mb-1">{action.icon}</div>
          <div className="text-xs tracking-wide">{action.label}</div>
        </button>
      ))}
    </div>
  );

  // Format timestamp
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to render message content with clickable suggestions
  const renderMessageContent = (content: string, isAssistant: boolean) => {
    if (isAssistant && content.startsWith(QUICK_ACTIONS_MARKER)) {
      const description = content.substring(QUICK_ACTIONS_MARKER.length).trim();
      return (
        <div style={{ whiteSpace: "pre-wrap" }}>
          {description && (
            <div className="mb-3 text-sm leading-relaxed">{description}</div>
          )}
          {renderQuickActions()}
        </div>
      );
    }

    if (!isAssistant || !content.includes("• ")) {
      return <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>;
    }

    const lines = content.split("\n");
    let firstSuggestionFound = false;

    return lines.map((line, i) => {
      if (line.startsWith("• ")) {
        const suggestion = line.substring(2).trim();
        const isClicked = clickedSuggestions.has(suggestion);
        const isFirstSuggestion = !firstSuggestionFound;
        if (isFirstSuggestion) firstSuggestionFound = true;

        return (
          <button
            key={i}
            onClick={() => handleSuggestionClick(suggestion)}
            style={{
              backgroundColor: isClicked
                ? darkMode
                  ? "#1e293b"
                  : "#dbeafe"
                : darkMode
                  ? "#1e293b"
                  : "#f1f5f9",
              color: isClicked
                ? darkMode
                  ? "#38bdf8"
                  : "#0369a1"
                : darkMode
                  ? "#cbd5e1"
                  : "#334155",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: darkMode ? "#334155" : "#cbd5e1",
              padding: "6px 10px",
              marginBottom: "8px",
              marginTop: isFirstSuggestion ? "12px" : "0",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              display: "inline-block",
              textAlign: "left",
              cursor: "pointer",
              fontWeight: isClicked ? "500" : "400",
              border: "none",
              outline: "none",
              whiteSpace: "pre-wrap",
            }}
            className="hover:opacity-80"
          >
            • {suggestion}
          </button>
        );
      }
      return (
        <div key={i} style={{ whiteSpace: "pre-wrap" }}>
          {line}
        </div>
      );
    });
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex items-end justify-start mb-4">
      <div
        className={`w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
          darkMode ? "bg-indigo-900" : "bg-indigo-50"
        }`}
      >
        <img src={sparkIcon} alt="AIVA" className="w-3 h-3" />
      </div>
      <div
        className={`px-4 py-2 rounded-2xl rounded-bl-none shadow-sm ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex gap-1">
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );

  // Theme classes
  const bgClass = darkMode ? "bg-gray-900" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-800";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBgClass = darkMode ? "bg-gray-800" : "bg-gray-50";
  const headerBgClass = darkMode
    ? "bg-gradient-to-r from-gray-800 to-gray-900"
    : "bg-gradient-to-r from-indigo-50 to-purple-50";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end md:hidden"
      aria-live="polite"
    >
      {/* Copy Notification */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg"
          >
            ✓ Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`w-[90vw] max-w-[380px] ${bgClass} shadow-2xl rounded-2xl overflow-hidden border ${borderClass} mb-3`}
            role="dialog"
            aria-label="AIVA chat"
          >
            {/* Header with logo and actions */}
            <div
              className={`p-3 border-b ${borderClass} ${headerBgClass} flex items-center justify-between`}
            >
              <div className="flex items-center gap-2">
                <img src={sparkIcon} alt="AIVA" className="w-8 h-8" />
                <div>
                  <span className={`text-sm font-semibold ${textClass}`}>
                    AIVA Chat
                  </span>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    AI Portfolio Assistant
                  </p>
                </div>
              </div>

              <div
                ref={languageMenuRef}
                className="flex items-center gap-2 relative"
              >
                {/* Language selection menu toggle */}
                <button
                  onClick={() => setLanguageMenuOpen((prev) => !prev)}
                  style={{
                    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "none",
                    outline: "none",
                  }}
                  className="hover:opacity-80"
                  aria-label="Select voice language"
                  aria-expanded={languageMenuOpen}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "16px", height: "16px" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c1.74 0 3 3.357 3 9s-1.26 9-3 9-3-3.357-3-9 1.26-9 3-9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>

                {languageMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-gray-200"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                    style={{ zIndex: 100 }}
                  >
                    <div className="p-3 space-y-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-xs uppercase tracking-wide opacity-70">
                            Voice language
                          </p>
                          {speechLanguage !== "auto" && (
                            <button
                              type="button"
                              onClick={() => handleLanguageSelect("auto")}
                              className={`text-[10px] font-medium ${
                                darkMode
                                  ? "text-indigo-300 hover:text-indigo-200"
                                  : "text-indigo-600 hover:text-indigo-500"
                              }`}
                            >
                              Auto
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="search"
                            value={languageSearchTerm}
                            onChange={(e) =>
                              setLanguageSearchTerm(e.target.value)
                            }
                            placeholder="Search languages"
                            className={`w-full px-3 py-2 text-xs rounded-lg border ${
                              darkMode
                                ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                                : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400"
                            }`}
                          />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 15l5 5m-5-5a7 7 0 10-10 0 7 7 0 0010 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      <div
                        className={`max-h-48 overflow-y-auto pr-1 space-y-1 ${
                          darkMode
                            ? "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                            : "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                        }`}
                      >
                        {filteredLanguageOptions.map((option) => {
                          const isActive = speechLanguage === option.code;
                          return (
                            <button
                              key={option.code}
                              onClick={() => handleLanguageSelect(option.code)}
                              className={`w-full px-3 py-2 rounded-lg text-left transition-all text-xs ${
                                isActive ? "ring-2 ring-indigo-400" : ""
                              }`}
                              style={{
                                backgroundColor: darkMode
                                  ? isActive
                                    ? "#312e81"
                                    : "#1f2937"
                                  : isActive
                                    ? "#e0e7ff"
                                    : "#eef2ff",
                                color: darkMode ? "#e0e7ff" : "#1f1f3d",
                              }}
                            >
                              <div className="font-medium">{option.label}</div>
                              <div className="text-[10px] opacity-70 mt-0.5">
                                {option.code}
                              </div>
                            </button>
                          );
                        })}

                        {filteredLanguageOptions.length === 0 && (
                          <div
                            className={`text-center text-[11px] py-4 ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            No matches. Try a different search or add a custom
                            code below.
                          </div>
                        )}
                      </div>

                      <div
                        className={`space-y-2 pt-1 border-t ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <label
                          className="text-xs font-semibold uppercase tracking-wide opacity-70"
                          htmlFor="custom-language-input"
                        >
                          Custom language code
                        </label>
                        <input
                          id="custom-language-input"
                          type="text"
                          value={customLanguage}
                          onChange={(e) => setCustomLanguage(e.target.value)}
                          placeholder="e.g., it-IT, ar-SA"
                          className={`w-full px-3 py-2 rounded-lg border ${
                            darkMode
                              ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
                              : "bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400"
                          }`}
                        />
                        <button
                          onClick={applyCustomLanguage}
                          className="w-full px-3 py-2 rounded-lg text-sm font-medium text-white"
                          style={{
                            background:
                              "linear-gradient(135deg, #4338ca, #312e81)",
                          }}
                        >
                          Use custom language
                        </button>
                        {customLanguage && (
                          <p className="text-[10px] opacity-60">
                            Currently using{" "}
                            {speechLanguage === "auto"
                              ? resolvedSpeechLanguage
                              : speechLanguage}
                            .
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Dark mode toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  style={{
                    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "none",
                    outline: "none",
                  }}
                  className="hover:opacity-80"
                  aria-label="Toggle dark mode"
                  title={darkMode ? "Light mode" : "Dark mode"}
                >
                  {darkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "16px", height: "16px" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: "16px", height: "16px" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </button>

                {/* Clear chat button */}
                <button
                  onClick={handleClearChat}
                  style={{
                    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "none",
                    outline: "none",
                  }}
                  className="hover:opacity-80"
                  aria-label="Clear chat"
                  title="Clear chat history"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "16px", height: "16px" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                {/* Minimize/Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "none",
                    outline: "none",
                  }}
                  className="hover:opacity-80"
                  aria-label="Close chat"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "16px", height: "16px" }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages container */}
            <div
              ref={messageContainerRef}
              className={`p-3 h-[380px] overflow-y-auto text-sm space-y-4 ${
                darkMode
                  ? "bg-gradient-to-b from-gray-800 to-gray-900"
                  : "bg-gradient-to-b from-gray-50 to-white"
              }`}
            >
              {/* Live region for screen readers */}
              <div className="sr-only" aria-live="polite">
                {latestAssistantMessage || ""}
              </div>

              {messages.length === 0 ? (
                isTyping ? (
                  <div className="pt-6">
                    <TypingIndicator />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mb-3">
                      <img
                        src={sparkIcon}
                        alt="AIVA"
                        className="w-16 h-16 mx-auto opacity-50"
                      />
                    </div>
                    <p
                      className={`${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      } italic`}
                    >
                      Start a conversation with AIVA!
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      } mt-2`}
                    >
                      Ask about projects, skills, or experience
                    </p>

                    <div
                      className="mt-4 text-left mx-auto"
                      style={{ maxWidth: "240px" }}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-indigo-200" : "text-indigo-500"
                        } mb-2`}
                      >
                        Suggested prompts
                      </p>
                      <ul
                        className={`space-y-1 text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {INTRO_SUGGESTIONS.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span
                              className={`mt-1 h-1.5 w-1.5 rounded-full ${
                                darkMode ? "bg-indigo-400" : "bg-indigo-500"
                              }`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      <p
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-indigo-200" : "text-indigo-500"
                        } mb-3`}
                      >
                        Quick actions
                      </p>
                      <div className="flex justify-center">
                        {renderQuickActions()}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <div
                    className={`rounded-2xl border ${
                      darkMode
                        ? "border-gray-700 bg-gray-800/60 text-gray-100"
                        : "border-gray-100 bg-white/70 text-gray-700"
                    } p-3 shadow-sm mb-4`}
                  >
                    <div
                      className="text-left"
                      style={{ maxWidth: "260px", margin: "0 auto" }}
                    >
                      <p
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-indigo-200" : "text-indigo-500"
                        } mb-2`}
                      >
                        Suggested prompts
                      </p>
                      <ul
                        className={`space-y-1 text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {INTRO_SUGGESTIONS.map((item, idx) => (
                          <li
                            key={`inline-suggestion-${idx}`}
                            className="flex items-start gap-2"
                          >
                            <span
                              className={`mt-1 h-1.5 w-1.5 rounded-full ${
                                darkMode ? "bg-indigo-400" : "bg-indigo-500"
                              }`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4">
                        <p
                          className={`text-xs uppercase tracking-wide ${
                            darkMode ? "text-indigo-200" : "text-indigo-500"
                          } mb-3`}
                        >
                          Quick actions
                        </p>
                        <div className="flex justify-center">
                          {renderQuickActions()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-end ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      } group`}
                    >
                      {m.role === "assistant" && (
                        <div
                          className={`w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
                            darkMode ? "bg-indigo-900" : "bg-indigo-50"
                          }`}
                        >
                          <img src={sparkIcon} alt="AIVA" className="w-3 h-3" />
                        </div>
                      )}
                      <div className="flex flex-col max-w-[80%]">
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                            m.role === "user"
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none"
                              : darkMode
                                ? "bg-gray-700 text-gray-100 rounded-bl-none border border-gray-600"
                                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                          }`}
                        >
                          {renderMessageContent(
                            m.content,
                            m.role === "assistant"
                          )}
                        </div>

                        {/* Timestamp and actions */}
                        <div
                          className={`flex items-center gap-1 mt-1 px-1 ${
                            m.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {m.timestamp && (
                            <span
                              className={`text-[10px] whitespace-nowrap ${
                                darkMode ? "text-gray-300" : "text-gray-500"
                              }`}
                            >
                              {formatTime(m.timestamp)}
                            </span>
                          )}
                          {m.role === "assistant" && (
                            <>
                              {/* Read Aloud Button */}
                              <button
                                onClick={() => readAloud(m.content, i)}
                                style={{
                                  backgroundColor:
                                    isSpeaking && speakingMessageIndex === i
                                      ? darkMode
                                        ? "#4338ca"
                                        : "#6366f1"
                                      : darkMode
                                        ? "#374151"
                                        : "#e5e7eb",
                                  color: darkMode ? "#d1d5db" : "#6b7280",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  transition: "all 0.2s ease",
                                  border: "none",
                                  outline: "none",
                                }}
                                className="hover:opacity-80"
                                title={
                                  isSpeaking && speakingMessageIndex === i
                                    ? "Stop reading"
                                    : "Read aloud"
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ width: "14px", height: "14px" }}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                  />
                                </svg>
                              </button>

                              {/* Copy Button */}
                              <button
                                onClick={() => copyToClipboard(m.content)}
                                style={{
                                  backgroundColor: darkMode
                                    ? "#374151"
                                    : "#e5e7eb",
                                  color: darkMode ? "#d1d5db" : "#6b7280",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  transition: "all 0.2s ease",
                                  border: "none",
                                  outline: "none",
                                }}
                                className="hover:opacity-80"
                                title="Copy message"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ width: "14px", height: "14px" }}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                              </button>

                              {/* Message Reactions */}
                              <button
                                onClick={() => handleReaction(i, "helpful")}
                                style={{
                                  backgroundColor:
                                    m.reaction === "helpful"
                                      ? darkMode
                                        ? "#16a34a"
                                        : "#22c55e"
                                      : darkMode
                                        ? "#374151"
                                        : "#e5e7eb",
                                  color:
                                    m.reaction === "helpful"
                                      ? "#ffffff"
                                      : darkMode
                                        ? "#d1d5db"
                                        : "#6b7280",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  transition: "all 0.2s ease",
                                  border: "none",
                                  outline: "none",
                                }}
                                className="hover:opacity-80"
                                title="Helpful"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ width: "14px", height: "14px" }}
                                  fill={
                                    m.reaction === "helpful"
                                      ? "currentColor"
                                      : "none"
                                  }
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReaction(i, "not-helpful")}
                                style={{
                                  backgroundColor:
                                    m.reaction === "not-helpful"
                                      ? darkMode
                                        ? "#dc2626"
                                        : "#ef4444"
                                      : darkMode
                                        ? "#374151"
                                        : "#e5e7eb",
                                  color:
                                    m.reaction === "not-helpful"
                                      ? "#ffffff"
                                      : darkMode
                                        ? "#d1d5db"
                                        : "#6b7280",
                                  padding: "6px",
                                  borderRadius: "8px",
                                  transition: "all 0.2s ease",
                                  border: "none",
                                  outline: "none",
                                }}
                                className="hover:opacity-80"
                                title="Not helpful"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ width: "14px", height: "14px" }}
                                  fill={
                                    m.reaction === "not-helpful"
                                      ? "currentColor"
                                      : "none"
                                  }
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && <TypingIndicator />}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className={`p-3 border-t ${borderClass} ${bgClass}`}>
              <div className="flex items-center gap-1">
                {/* Voice input button (auto send) */}
                <button
                  onClick={() => handleSpeechCapture("send")}
                  style={getVoiceButtonStyle(isVoiceSendActive)}
                  className="hover:opacity-90"
                  aria-label={
                    isVoiceSendActive ? "Stop voice input" : "Start voice input"
                  }
                  title={isVoiceSendActive ? "Stop voice input" : "Voice input"}
                >
                  {isVoiceSendActive && (
                    <>
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "8px",
                          backgroundColor: "#f87171",
                          animation:
                            "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                          opacity: 0.4,
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: "-2px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(239, 68, 68, 0.3)",
                          filter: "blur(4px)",
                        }}
                      />
                    </>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      width: "16px",
                      height: "16px",
                      position: "relative",
                      zIndex: 10,
                    }}
                    fill={isVoiceSendActive ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>

                {/* Dictate button (fills input) */}
                <button
                  onClick={() => handleSpeechCapture("dictate")}
                  style={getVoiceButtonStyle(isDictateActive)}
                  className="hover:opacity-90"
                  aria-label={
                    isDictateActive ? "Stop dictation" : "Dictate message"
                  }
                  title={isDictateActive ? "Stop dictation" : "Dictate"}
                >
                  {isDictateActive && (
                    <>
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "8px",
                          backgroundColor: "#f87171",
                          animation:
                            "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
                          opacity: 0.4,
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: "-2px",
                          borderRadius: "8px",
                          backgroundColor: "rgba(239, 68, 68, 0.3)",
                          filter: "blur(4px)",
                        }}
                      />
                    </>
                  )}
                  {isDictateActive ? (
                    // Stop icon when dictation is active
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        width: "16px",
                        height: "16px",
                        position: "relative",
                        zIndex: 10,
                      }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 6h12v12H6z" />
                    </svg>
                  ) : (
                    // Pen icon when dictation is not active
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        width: "16px",
                        height: "16px",
                        position: "relative",
                        zIndex: 10,
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 3.487l3.651 3.651-10.95 10.95a3 3 0 01-1.271.749l-4.106 1.23 1.23-4.106a3 3 0 01.749-1.271l10.95-10.95zM15 5l3.5 3.5"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 21h11"
                      />
                    </svg>
                  )}
                </button>

                <textarea
                  ref={inputRef}
                  placeholder={
                    isListening
                      ? CHAT_PLACEHOLDERS.LISTENING
                      : CHAT_PLACEHOLDERS.ASK_AIVA
                  }
                  className={`flex-1 min-w-0 ${inputBgClass} border ${
                    darkMode
                      ? "border-gray-700 placeholder-gray-300"
                      : "border-gray-200 placeholder-gray-400"
                  } rounded-xl px-4 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${textClass} resize-none`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendWithDictation(undefined, {
                        triggeredByVoice: false,
                      });
                    }
                  }}
                  aria-label="Type your question to AIVA"
                  readOnly={isListening && listeningMode === "send"}
                  rows={1}
                  spellCheck={false}
                  style={{
                    caretColor: darkMode ? "#f9fafb" : "#4338ca",
                    minHeight: "40px",
                    maxHeight: "140px",
                  }}
                />

                <button
                  onClick={() =>
                    handleSendWithDictation(undefined, {
                      triggeredByVoice: false,
                    })
                  }
                  aria-label="Send message"
                  disabled={
                    !input.trim() ||
                    (isListening && listeningMode !== "dictate")
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    background: darkMode
                      ? "linear-gradient(135deg, #4c1d95, #6d28d9)"
                      : "linear-gradient(135deg, #4338ca, #312e81)",
                    color: "#ffffff",
                    paddingInline: "clamp(12px, 1.8vw, 16px)",
                  }}
                  className="flex-shrink-0 inline-flex items-center justify-center h-10 px-0 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M22 2L11 13"
                    />
                    <path
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M22 2l-7 20-4-9-9-4 20-7z"
                    />
                  </svg>
                </button>
              </div>

              {/* Quick action hints */}
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                } text-center mt-2`}
              >
                Press Enter to send • Shift+Enter for new line
              </div>

              {/* Virtual keyboard intentionally disabled to restore widget accessibility */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating action button */}
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            unreadCount
              ? `Open chat, ${unreadCount} unread messages`
              : "Open chat"
          }
          aria-expanded={isOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl transition-all"
        >
          <img
            src={sparkIcon}
            alt="Open AIVA chat"
            className="w-8 h-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]"
          />
        </motion.button>

        {/* Unread badge */}
        {!isOpen && typeof unreadCount === "number" && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full shadow-md"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default ChatWidgetUI;
