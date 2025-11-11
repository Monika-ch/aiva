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
  type Message,
} from "../features";

// Import chat constants
import { INTRO_SUGGESTIONS, QUICK_ACTIONS } from "../constants/chatConstants";

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

  // State
  const [clickedSuggestions, setClickedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [voiceInputUsed, setVoiceInputUsed] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  // Custom hooks
  const theme = getThemeClasses(darkMode);

  const { effectiveSpeechLocale, recordVoiceLanguagePreference } =
    useLanguageSettings();

  const { isSpeaking, speakingMessageIndex, readAloud } = useTextToSpeech();

  const {
    clearDictationSession,
    clearDictationTranscript,
    appendDictationChunk,
    buildDictationCombinedContent,
    deleteLastWordsFromDictation,
    setDictationBase,
  } = useDictation();

  // Send message handler with voice support
  const sendUserMessage = useCallback(
    (
      message: string,
      options?: { triggeredByVoice?: boolean; voiceMode?: "send" | "dictate" }
    ) => {
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
      handleSend(trimmedMessage);
    },
    [handleSend, recordVoiceLanguagePreference]
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

  // Handler functions
  const handleClearChat = () => {
    setClickedSuggestions(new Set());
    clearConversationStorage();
    if (onClearMessages) {
      onClearMessages();
    }
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
    handleSendWithDictation(query);
  };

  // JSX Rendering
  return (
    <div
      className='fixed bottom-6 right-6 z-50 flex flex-col items-end md:hidden'
      aria-live='polite'
    >
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
            className={`w-[90vw] max-w-[380px] ${theme.bg} shadow-2xl rounded-2xl overflow-hidden border ${theme.border} mb-3`}
            role='dialog'
            aria-label='AIVA chat'
          >
            {/* Header */}
            <div
              className={`p-3 border-b ${theme.border} ${theme.headerBg} flex items-center justify-between`}
            >
              <div className='flex items-center gap-2'>
                <img src={sparkIcon} alt='AIVA' className='w-8 h-8' />
                <div>
                  <span className={`text-sm font-semibold ${theme.text}`}>
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

              <div className='flex items-center gap-1.5'>
                {/* Language Button - TODO: Add language menu functionality */}
                <button
                  style={{
                    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
                    color: darkMode ? "#d1d5db" : "#6b7280",
                    padding: "8px",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    border: "none",
                    outline: "none",
                  }}
                  className='hover:opacity-80'
                  aria-label='Language settings'
                  title='Language settings'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    style={{ width: "16px", height: "16px" }}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129'
                    />
                  </svg>
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
                  className='hover:opacity-80'
                  aria-label='Clear chat'
                  title='Clear chat history'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    style={{ width: "16px", height: "16px" }}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>

                {/* Close button */}
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
                  className='hover:opacity-80'
                  aria-label='Close chat'
                  title='Close'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    style={{ width: "16px", height: "16px" }}
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={messageContainerRef}
              className={`p-3 h-[380px] overflow-y-auto text-sm space-y-4 ${
                darkMode
                  ? "bg-gradient-to-b from-gray-800 to-gray-900 chat-messages-dark"
                  : "bg-gradient-to-b from-gray-50 to-white chat-messages-light"
              }`}
            >
              {messages.length === 0 && !isTyping ? (
                // Empty state with welcome message, suggestions, and actions
                <div className='flex flex-col h-full py-4 px-4'>
                  {/* Welcome greeting */}
                  <div className='text-center space-y-1.5 mb-5'>
                    <h2
                      className={`text-base font-semibold ${
                        darkMode ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      Ask AIVA...
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
                  <div className='space-y-2.5 w-full mb-5'>
                    <p
                      className={`text-[9px] font-semibold uppercase tracking-wider text-center ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      💡 Try asking about:
                    </p>
                    <div className='flex flex-wrap gap-2 justify-center'>
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

                  {/* Quick action cards */}
                  <div className='space-y-2.5 w-full'>
                    <p
                      className={`text-[9px] font-semibold uppercase tracking-wider text-center ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      ⚡ Quick actions:
                    </p>
                    <div className='grid grid-cols-2 gap-2.5'>
                      {QUICK_ACTIONS.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(action.query)}
                          className={`group p-3 rounded-lg text-left transition-all transform hover:scale-105 w-full ${
                            darkMode
                              ? "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-indigo-600"
                              : "bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white border border-gray-200 hover:border-indigo-400 shadow-sm hover:shadow-md"
                          }`}
                        >
                          <div className='flex items-center gap-2.5'>
                            <div
                              className={`text-xl transform transition-transform group-hover:scale-110 ${
                                darkMode ? "drop-shadow-lg" : ""
                              }`}
                            >
                              {action.icon}
                            </div>
                            <span
                              className={`font-semibold text-[11px] ${
                                darkMode ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {action.label}
                            </span>
                          </div>
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
                      isSpeaking={isSpeaking}
                      speakingMessageIndex={speakingMessageIndex}
                      onReadAloud={readAloud}
                      onCopy={copyToClipboard}
                      onReaction={handleReaction}
                      onSuggestionClick={handleSuggestionClick}
                      onActionClick={handleQuickAction}
                    />
                  ))}

                  {isTyping && <TypingIndicator darkMode={darkMode} />}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Container */}
            <div className={`p-3 border-t ${theme.border} ${theme.bg}`}>
              <div className='flex items-end gap-1.5 mb-2'>
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
                  placeholder={isListening ? "Listening..." : "Ask AIVA..."}
                  className={`flex-1 min-w-0 ${theme.inputBg} ${
                    darkMode ? "dark-scrollbar" : ""
                  } border ${
                    darkMode
                      ? "border-gray-700 placeholder-gray-300"
                      : "border-gray-200 placeholder-gray-400"
                  } rounded-lg px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${
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
                  aria-label='Type your question to AIVA'
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
                  aria-label='Send message'
                  disabled={
                    !input.trim() ||
                    (isListening && listeningMode !== "dictate")
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    background: darkMode
                      ? "linear-gradient(135deg, #4c1d95, #6d28d9)"
                      : "#6366f1",
                    color: "#ffffff",
                    paddingInline: "clamp(12px, 1.8vw, 16px)",
                  }}
                  className='flex-shrink-0 inline-flex items-center justify-center h-10 px-0 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-4 h-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M22 2L11 13'
                    />
                    <path
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M22 2l-7 20-4-9-9-4 20-7z'
                    />
                  </svg>
                </button>
              </div>

              <div
                className={`text-xs ${
                  darkMode ? "text-gray-300" : "text-gray-400"
                } text-center mt-2`}
              >
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className='relative'>
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
          className='relative p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg hover:shadow-xl transition-all'
        >
          <img
            src={sparkIcon}
            alt='Open AIVA chat'
            className='w-8 h-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)]'
          />
        </motion.button>

        {/* Unread Badge */}
        {!isOpen && typeof unreadCount === "number" && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full shadow-md'
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </div>
    </div>
  );
};

export default ChatWidgetUI;
