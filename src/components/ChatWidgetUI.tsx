/**
 * Refactored ChatWidgetUI Component
 * Clean, modular implementation using feature hooks and components
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";

// Import all features
import {
  getThemeClasses,
  useLanguageSettings,
  useTextToSpeech,
  useDictation,
  useVoiceRecognition,
  clearConversationStorage,
  CopyNotification,
  TypingIndicator,
  MessageBubble,
  VoiceSendButton,
  DictateButton,
  filterLanguageOptions,
} from "../features";
import type { Message, SendMessageOptions } from "../types/Message";

// Import chat constants
import {
  INTRO_SUGGESTIONS,
  CHAT_PLACEHOLDERS,
} from "../constants/chatConstants";
import { DIALOG_MESSAGES } from "../constants/dialogMessages";

// Import confirm dialog
import { ConfirmDialog } from "./ConfirmDialog";
import { ReplyPreview } from "./ReplyPreview";

interface Props {
  messages: Message[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  input: string;
  setInput: (s: string) => void;
  handleSend: (messageOverride?: string, options?: SendMessageOptions) => void;
  unreadCount?: number;
  latestAssistantMessage?: string | null;
  isTyping?: boolean;
  onClearMessages?: () => void;
  onReaction?: (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => void;
  darkMode?: boolean;
}

const ChatWidgetUI: React.FC<Props> = ({
  messages,
  isOpen,
  setIsOpen,
  input,
  setInput,
  handleSend,
  unreadCount = 0,
  isTyping = false,
  onClearMessages,
  onReaction,
  darkMode = false,
}) => {
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // State
  const [clickedSuggestions, setClickedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [clickedActions, setClickedActions] = useState<Set<string>>(new Set());
  const [voiceInputUsed, setVoiceInputUsed] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    message: Message;
    index: number;
  } | null>(null);

  // Custom hooks
  const theme = getThemeClasses(darkMode);

  const {
    effectiveSpeechLocale,
    recordVoiceLanguagePreference,
    speechLanguage,
    setSpeechLanguage,
  } = useLanguageSettings();

  const { isSpeaking, speakingMessageIndex, readAloud } = useTextToSpeech();

  const {
    clearDictationSession,
    clearDictationTranscript,
    appendDictationChunk,
    buildDictationCombinedContent,
    deleteLastWordsFromDictation,
    setDictationBase,
  } = useDictation();

  // Handle reply to message
  const handleReply = useCallback((message: Message, index: number) => {
    setReplyingTo({ message, index });
    inputRef.current?.focus();
  }, []);

  // Clear reply
  const clearReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Send message handler with voice support
  const sendUserMessage = useCallback(
    (message: string, options?: SendMessageOptions) => {
      console.log("[DEBUG] sendUserMessage called with:", { message, options });
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
      handleSend(trimmedMessage, {
        ...options,
        replyToId: replyingTo?.message.id,
      });
      if (replyingTo) {
        clearReply();
      }
    },
    [handleSend, recordVoiceLanguagePreference, replyingTo, clearReply]
  );

  const { isListening, listeningMode, startVoiceRecognition } =
    useVoiceRecognition({
      effectiveSpeechLocale,
      onSendMessage: sendUserMessage,
      setInput,
      input,
      appendDictationChunk,
      buildDictationCombinedContent,
      clearDictationTranscript,
      deleteLastWordsFromDictation,
      setDictationBase,
      clearDictationSession,
    });

  const isVoiceSendActive = isListening && listeningMode === "send";
  const isDictateActive = isListening && listeningMode === "dictate";

  // Handle send with dictation cleanup
  const handleSendWithDictation = useCallback(
    (messageOverride?: string, options?: SendMessageOptions) => {
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
      const messageToSend = rawMessage.trim();
      if (!messageToSend) {
        console.log("[DEBUG] Empty message after trimming, returning");
        return;
      }

      // Stop dictation if active
      if (isListening && listeningMode === "dictate") {
        startVoiceRecognition("dictate"); // This will stop it since it's already active
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
      listeningMode,
      sendUserMessage,
      setInput,
      startVoiceRecognition,
    ]
  );

  // Auto-scroll to bottom
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
        setTimeout(() => {
          readAloud(lastMessage.content, messages.length - 1);
          setVoiceInputUsed(false);
        }, 500);
      }
    }
  }, [messages, isTyping, voiceInputUsed, readAloud]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 140;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  }, [input]);

  // Save conversation to localStorage
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem("aiva-conversation", JSON.stringify(messages));
    }
  }, [messages, isOpen]);

  // Close language menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setShowLanguageMenu(false);
      }
    };

    if (showLanguageMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showLanguageMenu]);

  // Handler functions
  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    setClickedSuggestions(new Set());
    setClickedActions(new Set());
    clearConversationStorage();
    if (onClearMessages) {
      onClearMessages();
    }
    clearReply();
    setShowClearConfirm(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopyNotification(true);
      setTimeout(() => setShowCopyNotification(false), 2000);
    });
  };

  const handleReaction = (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => {
    if (onReaction) {
      onReaction(messageIndex, reaction);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setClickedSuggestions((prev) => new Set(prev).add(suggestion));
    handleSendWithDictation(suggestion);
  };

  const handleQuickAction = (query: string) => {
    setClickedActions((prev) => new Set(prev).add(query));
    handleSendWithDictation(query);
  };

  const handleLanguageSelect = (code: string) => {
    setSpeechLanguage(code);
    setShowLanguageMenu(false);
    setLanguageSearch("");
  };

  const filteredOptions = filterLanguageOptions(languageSearch);

  // JSX Rendering
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end md:hidden"
      aria-live="polite"
    >
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title={DIALOG_MESSAGES.CLEAR_CHAT.title}
        message={DIALOG_MESSAGES.CLEAR_CHAT.message}
        confirmText={DIALOG_MESSAGES.CLEAR_CHAT.confirmText}
        cancelText={DIALOG_MESSAGES.CLEAR_CHAT.cancelText}
        onConfirm={confirmClearChat}
        onCancel={() => setShowClearConfirm(false)}
        darkMode={darkMode}
      />

      {/* Copy Notification */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CopyNotification show={showCopyNotification} />
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
            className={`w-[90vw] max-w-[380px] shadow-2xl rounded-2xl overflow-hidden border mb-3`}
            style={{
              background: darkMode
                ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e293b 100%)"
                : "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%)",
              borderColor: darkMode ? "#4c1d95" : "#c7d2fe",
            }}
            role="dialog"
            aria-label="AIVA chat"
          >
            {/* Header */}
            <div
              className={`p-3 border-b backdrop-blur-sm flex items-center justify-between`}
              style={{
                backgroundColor: darkMode
                  ? "rgba(30, 27, 75, 0.8)"
                  : "rgba(255, 255, 255, 0.7)",
                borderColor: darkMode ? "#4c1d95" : "#c7d2fe",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={sparkIcon}
                    alt="AIVA"
                    className="w-8 h-8"
                    style={{
                      filter: "drop-shadow(0 2px 6px rgba(99, 102, 241, 0.35))",
                    }}
                  />
                </div>
                <div>
                  <span
                    className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}
                  >
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

              <div className="flex items-center gap-1.5">
                {/* Language Button */}
                <div className="relative" ref={languageMenuRef}>
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    style={{
                      backgroundColor: darkMode
                        ? "rgba(55, 65, 81, 0.8)"
                        : "rgba(229, 231, 235, 0.8)",
                      color: darkMode ? "#d1d5db" : "#6b7280",
                      padding: "8px",
                      borderRadius: "8px",
                      transition: "all 0.2s ease",
                      border: "none",
                      outline: "none",
                      backdropFilter: "blur(8px)",
                    }}
                    className="hover:opacity-80"
                    aria-label="Language settings"
                    title="Language settings"
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
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                  </button>

                  {/* Language Dropdown Menu */}
                  {showLanguageMenu && (
                    <div
                      className="absolute right-0 mt-2 w-72 rounded-lg shadow-2xl border z-50"
                      style={{
                        backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                        borderColor: darkMode ? "#374151" : "#e5e7eb",
                      }}
                    >
                      <div
                        className="p-3 border-b"
                        style={{
                          borderColor: darkMode ? "#374151" : "#e5e7eb",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Search languages..."
                          value={languageSearch}
                          onChange={(e) => setLanguageSearch(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-400"
                          style={{
                            backgroundColor: darkMode ? "#374151" : "#ffffff",
                            borderColor: darkMode ? "#4b5563" : "#d1d5db",
                            color: darkMode ? "#f3f4f6" : "#111827",
                          }}
                        />
                      </div>

                      <div
                        className={`max-h-64 overflow-y-auto ${
                          darkMode ? "dark-scrollbar" : "light-scrollbar"
                        }`}
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: darkMode
                            ? "#4b5563 #1f2937"
                            : "#d1d5db #f9fafb",
                        }}
                      >
                        {filteredOptions.map((option) => (
                          <button
                            key={option.code}
                            onClick={() => handleLanguageSelect(option.code)}
                            className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                            style={{
                              backgroundColor:
                                speechLanguage === option.code
                                  ? darkMode
                                    ? "#312e81"
                                    : "#eef2ff"
                                  : "transparent",
                              color:
                                speechLanguage === option.code
                                  ? darkMode
                                    ? "#c7d2fe"
                                    : "#4338ca"
                                  : darkMode
                                    ? "#e5e7eb"
                                    : "#374151",
                            }}
                            onMouseEnter={(e) => {
                              if (speechLanguage !== option.code) {
                                e.currentTarget.style.backgroundColor = darkMode
                                  ? "#374151"
                                  : "#f9fafb";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (speechLanguage !== option.code) {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              {speechLanguage === option.code && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clear chat button */}
                <button
                  onClick={handleClearChat}
                  style={{
                    backgroundColor: darkMode
                      ? "rgba(55, 65, 81, 0.8)"
                      : "rgba(229, 231, 235, 0.8)",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "none",
                    outline: "none",
                    backdropFilter: "blur(8px)",
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

                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    backgroundColor: darkMode
                      ? "rgba(55, 65, 81, 0.8)"
                      : "rgba(229, 231, 235, 0.8)",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "none",
                    outline: "none",
                    backdropFilter: "blur(8px)",
                  }}
                  className="hover:opacity-80"
                  aria-label="Close chat"
                  title="Close"
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

            {/* Messages Container */}
            <div
              ref={messageContainerRef}
              className={`p-3 h-[380px] overflow-y-auto text-sm space-y-4`}
              style={{
                background: darkMode
                  ? "linear-gradient(to bottom, rgba(31, 41, 55, 0.6), rgba(17, 24, 39, 0.8))"
                  : "linear-gradient(to bottom, rgba(249, 250, 251, 0.6), rgba(255, 255, 255, 0.9))",
              }}
            >
              {messages.length === 0 && !isTyping ? (
                // Empty state with welcome message, suggestions, and actions
                <div className="flex flex-col h-full py-4 px-4">
                  {/* Welcome greeting */}
                  <div className="text-center space-y-1.5 mb-5">
                    <h2
                      className={`text-base font-semibold ${
                        darkMode ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {CHAT_PLACEHOLDERS.ASK_AIVA}
                    </h2>
                    <p
                      className={`text-[11px] leading-relaxed ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      I'm your AI-Powered Portfolio Assistant. I can help you
                      explore projects, discuss technical skills, and answer
                      questions about experience.
                    </p>
                  </div>

                  {/* Suggestion chips */}
                  <div className="space-y-2.5 w-full mb-5">
                    <p
                      className={`text-[9px] font-semibold uppercase tracking-wider text-center ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      💡 Try asking about:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {INTRO_SUGGESTIONS.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={clickedSuggestions.has(suggestion)}
                          className={`px-3 py-2 rounded-full text-[11px] font-medium transition-all ${
                            clickedSuggestions.has(suggestion)
                              ? darkMode
                                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : darkMode
                                ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 hover:from-gray-700 hover:to-gray-600 border border-gray-600 hover:border-gray-500"
                                : "bg-gradient-to-r from-white to-gray-50 text-gray-700 hover:from-gray-50 hover:to-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300"
                          }`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id || index}
                      message={message}
                      messageIndex={index}
                      darkMode={darkMode}
                      clickedSuggestions={clickedSuggestions}
                      clickedActions={clickedActions}
                      isSpeaking={isSpeaking}
                      speakingMessageIndex={speakingMessageIndex}
                      onReadAloud={readAloud}
                      onCopy={copyToClipboard}
                      onReaction={handleReaction}
                      onSuggestionClick={handleSuggestionClick}
                      onActionClick={handleQuickAction}
                      onReply={handleReply}
                      replyToMessage={
                        message.replyToId
                          ? messages.find((m) => m.id === message.replyToId)
                          : undefined
                      }
                    />
                  ))}

                  {isTyping && <TypingIndicator darkMode={darkMode} />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Container */}
            <div
              className={`p-3 border-t backdrop-blur-sm`}
              style={{
                backgroundColor: darkMode
                  ? "rgba(30, 27, 75, 0.8)"
                  : "rgba(255, 255, 255, 0.7)",
                borderColor: darkMode ? "#4c1d95" : "#c7d2fe",
              }}
            >
              {/* Reply Preview */}
              {replyingTo && (
                <ReplyPreview
                  replyToContent={replyingTo.message.content}
                  replyToRole={replyingTo.message.role}
                  darkMode={darkMode}
                  onClear={clearReply}
                />
              )}

              <div className="flex items-end gap-1.5 mb-2">
                <VoiceSendButton
                  onClick={() => startVoiceRecognition("send")}
                  isActive={isVoiceSendActive}
                  darkMode={darkMode}
                />

                <DictateButton
                  onClick={() => startVoiceRecognition("dictate")}
                  isActive={isDictateActive}
                  darkMode={darkMode}
                />

                <textarea
                  ref={inputRef}
                  placeholder={
                    isListening
                      ? CHAT_PLACEHOLDERS.LISTENING
                      : CHAT_PLACEHOLDERS.ASK_AIVA
                  }
                  className={`flex-1 min-w-0 ${theme.inputBg} ${
                    darkMode ? "dark-scrollbar" : ""
                  } border ${
                    darkMode
                      ? "border-gray-700 placeholder-gray-300"
                      : "border-gray-200 placeholder-gray-400"
                  } rounded-lg px-4 py-3 text-sm leading-6 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${
                    theme.text
                  } resize-none`}
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
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "#ffffff",
                    paddingInline: "clamp(12px, 1.8vw, 16px)",
                    boxShadow:
                      !input.trim() ||
                      (isListening && listeningMode !== "dictate")
                        ? "none"
                        : "0 4px 12px rgba(99, 102, 241, 0.4)",
                    opacity:
                      !input.trim() ||
                      (isListening && listeningMode !== "dictate")
                        ? 0.5
                        : 1,
                  }}
                  className="flex-shrink-0 inline-flex items-center justify-center h-10 px-0 rounded-lg hover:brightness-110 transform transition-all active:scale-95 disabled:cursor-not-allowed"
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
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
          className="relative p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
          style={{
            background: darkMode
              ? "linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)"
              : "linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)",
            boxShadow: darkMode
              ? "0 8px 32px rgba(129, 140, 248, 0.5), 0 4px 16px rgba(167, 139, 250, 0.4)"
              : "0 8px 32px rgba(165, 180, 252, 0.6), 0 4px 16px rgba(196, 181, 253, 0.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          <img
            src={sparkIcon}
            alt="Open AIVA chat"
            className="w-8 h-8"
            style={{
              filter: "drop-shadow(0 2px 8px rgba(255, 255, 255, 0.5))",
            }}
          />
        </motion.button>

        {/* Unread Badge */}
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
