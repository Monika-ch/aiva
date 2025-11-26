/**
 * Refactored ChatWidgetUI Component
 * Clean, modular implementation using feature hooks and components
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";
import "../styles/ChatWidgetUI.css";

// Import all utils
import {
  getThemeClasses,
  useLanguageSettings,
  useTextToSpeech,
  useDictation,
  useVoiceRecognition,
  clearConversationStorage,
  TypingIndicator,
  MessageBubble,
  VoiceSendButton,
  DictateButton,
  useSmoothScroll,
} from "../utils";
import type { Message, SendMessageOptions } from "../types/Message";

// Import chat constants
import { CHAT_PLACEHOLDERS } from "../constants/chatConstants";
import { DIALOG_MESSAGES } from "../constants/dialogMessages";
import {
  ARIA_LABELS,
  TITLES,
  ALT_TEXT,
  TOGGLE_TEXT,
} from "../constants/accessibilityLabels";

// Import icons
import {
  LanguageIcon,
  TrashIcon,
  CloseIcon,
  SendIcon,
} from "../constants/icons";

// Import confirm dialog
import { ConfirmDialog } from "./ConfirmDialog";
import { ReplyPreview } from "./ReplyPreview";
import { SuggestionList } from "./SuggestionList";
import { WelcomeMessage } from "./WelcomeMessage";
import { QuickActionsSection } from "./QuickActionsSection";
import { LanguageDropdown } from "../utils/LanguageDropdown";

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
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);

  // Enhanced scroll behavior
  const { scrollElementRef: messageContainerRef } = useSmoothScroll({
    enabled: true,
    delay: 100,
    dependencies: [messages, isTyping],
  });

  // Legacy ref for compatibility
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [clickedSuggestions, setClickedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [clickedActions, setClickedActions] = useState<Set<string>>(new Set());
  const [voiceInputUsed, setVoiceInputUsed] = useState(false);
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
    navigator.clipboard.writeText(text);
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

      {/* Messages Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`w-[90vw] max-w-[380px] shadow-2xl rounded-2xl overflow-hidden border mb-3 ${
              darkMode ? "chat-dialog-dark" : "chat-dialog-light"
            }`}
            role="dialog"
            aria-label="AIVA chat"
          >
            {/* Header */}
            <div
              className={`p-3 border-b backdrop-blur-sm flex items-center justify-between ${
                darkMode ? "chat-header-dark" : "chat-header-light"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={sparkIcon}
                    alt={ALT_TEXT.AIVA.LOGO}
                    className="w-8 h-8 chat-logo"
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
                    ref={languageButtonRef}
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className={`hover:opacity-80 chat-header-btn ${
                      darkMode
                        ? "chat-header-btn-dark"
                        : "chat-header-btn-light"
                    }`}
                    aria-label={ARIA_LABELS.LANGUAGE.SETTINGS}
                    title={TITLES.LANGUAGE.SETTINGS}
                  >
                    <LanguageIcon className="chat-header-btn-icon" />
                  </button>

                  {/* Language Dropdown Menu */}
                  {showLanguageMenu && (
                    <LanguageDropdown
                      darkMode={darkMode}
                      speechLanguage={speechLanguage}
                      languageSearch={languageSearch}
                      onLanguageSearchChange={setLanguageSearch}
                      onLanguageSelect={handleLanguageSelect}
                      buttonRef={languageButtonRef}
                      usePortal={true}
                      onClose={() => setShowLanguageMenu(false)}
                      containerRef={languageMenuRef}
                    />
                  )}
                </div>

                {/* Clear chat button */}
                <button
                  onClick={handleClearChat}
                  className={`hover:opacity-80 chat-header-btn ${
                    darkMode ? "chat-header-btn-dark" : "chat-header-btn-light"
                  }`}
                  aria-label={ARIA_LABELS.CLEAR_CHAT.BUTTON}
                  title={TITLES.CLEAR_CHAT.HISTORY}
                >
                  <TrashIcon className="chat-header-btn-icon" />
                </button>

                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className={`hover:opacity-80 chat-header-btn ${
                    darkMode ? "chat-header-btn-dark" : "chat-header-btn-light"
                  }`}
                  aria-label={TOGGLE_TEXT.CHAT.CLOSE}
                  title={TITLES.CLOSE.BUTTON}
                >
                  <CloseIcon className="chat-header-btn-icon" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div
              ref={messageContainerRef}
              className={`p-3 h-[380px] overflow-y-auto text-sm space-y-4 ${
                darkMode ? "chat-messages-dark" : "chat-messages-light"
              }`}
            >
              {messages.length === 0 && !isTyping ? (
                // Empty state with welcome message, suggestions, and actions
                <div className="flex flex-col h-full px-4 overflow-y-auto">
                  {/* Welcome greeting */}
                  <WelcomeMessage darkMode={darkMode} variant="mobile" />

                  {/* Suggestion chips */}
                  <SuggestionList
                    darkMode={darkMode}
                    clickedSuggestions={clickedSuggestions}
                    onSuggestionClick={handleSuggestionClick}
                    variant="mobile"
                  />

                  {/* Quick action cards */}
                  <QuickActionsSection
                    darkMode={darkMode}
                    clickedActions={clickedActions}
                    onActionClick={handleQuickAction}
                    variant="mobile"
                  />
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
              className={`p-3 border-t backdrop-blur-sm ${
                darkMode
                  ? "chat-input-container-dark"
                  : "chat-input-container-light"
              }`}
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
                  className={`flex-1 min-w-0 ${theme.inputBg} chat-textarea ${
                    darkMode
                      ? "dark-scrollbar chat-textarea-dark"
                      : "chat-textarea-light"
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
                  aria-label={ARIA_LABELS.CHAT.INPUT}
                  readOnly={isListening && listeningMode === "send"}
                  rows={1}
                  spellCheck={false}
                />

                <button
                  onClick={() =>
                    handleSendWithDictation(undefined, {
                      triggeredByVoice: false,
                    })
                  }
                  aria-label={ARIA_LABELS.CHAT.SEND}
                  disabled={
                    !input.trim() ||
                    (isListening && listeningMode !== "dictate")
                  }
                  className={`chat-send-btn flex-shrink-0 inline-flex items-center justify-center h-10 px-0 rounded-lg hover:brightness-110 transform transition-all active:scale-95 disabled:cursor-not-allowed ${
                    !input.trim() ||
                    (isListening && listeningMode !== "dictate")
                      ? "chat-send-btn-disabled"
                      : "chat-send-btn-active"
                  }`}
                >
                  <SendIcon className="w-4 h-4" />
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
            isOpen
              ? TOGGLE_TEXT.CHAT.CLOSE
              : unreadCount > 0
                ? `${TOGGLE_TEXT.CHAT.OPEN} (${unreadCount} unread ${
                    unreadCount === 1 ? "message" : "messages"
                  })`
                : TOGGLE_TEXT.CHAT.OPEN
          }
          aria-expanded={isOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative p-4 rounded-full shadow-lg hover:shadow-xl transition-all chat-fab ${
            darkMode ? "chat-fab-dark" : "chat-fab-light"
          }`}
        >
          <img
            src={sparkIcon}
            alt={ALT_TEXT.AIVA.OPEN_CHAT}
            className="w-8 h-8 chat-fab-logo"
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
