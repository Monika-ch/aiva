/**
 * Desktop Chat Input Component
 * Enhanced input with voice controls matching mobile widget functionality
 */

import React, { useEffect, useRef, useState } from "react";
import { SendIcon } from "../constants/icons";
import { VoiceSendButton, DictateButton } from "../utils/VoiceControls";
import { useVoiceRecognition } from "../utils/useVoiceRecognition";
import { useDictation } from "../utils/useDictation";
import { useLanguageSettings } from "../utils/useLanguageSettings";
import {
  DICTATION_MESSAGES,
  LISTENING_MESSAGES,
  QUICK_PROMPTS,
} from "../constants/chatConstants";
import { ARIA_LABELS, PLACEHOLDERS } from "../constants/accessibilityLabels";
import type { SendMessageOptions } from "../types/Message";
import "../styles/DesktopChatInput.css";

interface DesktopChatInputProps {
  onSend: (message: string, options?: SendMessageOptions) => void;
  darkMode?: boolean;
  placeholder?: string;
}

const DesktopChatInput: React.FC<DesktopChatInputProps> = ({
  onSend,
  darkMode = false,
  placeholder = PLACEHOLDERS.CHAT.ASK_AIVA,
}) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const { effectiveSpeechLocale } = useLanguageSettings();

  // Dictation management
  const {
    appendDictationChunk,
    buildDictationCombinedContent,
    clearDictationTranscript,
    deleteLastWordsFromDictation,
    setDictationBase,
    clearDictationSession,
  } = useDictation();

  // Voice recognition
  const {
    isListening,
    listeningMode,
    startVoiceRecognition,
    resetListeningState,
  } = useVoiceRecognition({
    effectiveSpeechLocale,
    onSendMessage: (message, options) => {
      const trimmedMessage = message.trim();
      if (trimmedMessage) {
        onSend(trimmedMessage, options);
        setInput("");
        clearDictationSession();
      }
    },
    setInput,
    input,
    appendDictationChunk,
    buildDictationCombinedContent,
    clearDictationTranscript,
    deleteLastWordsFromDictation,
    setDictationBase,
    clearDictationSession,
  });

  // Toggle functions for voice buttons
  const toggleVoiceSend = () => {
    startVoiceRecognition("send");
  };

  const toggleDictation = () => {
    startVoiceRecognition("dictate");
  };

  // Update dictation base when input changes manually
  useEffect(() => {
    if (listeningMode === "dictate") {
      setDictationBase(input);
    }
  }, [input, listeningMode, setDictationBase]);

  // Auto-resize textarea and scroll to cursor
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate new height based on content (max 8 rows)
    const lineHeight = 24; // leading-6 = 1.5rem = 24px
    const maxHeight = lineHeight * 8 + 16; // 8 rows + padding
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;

    // Scroll to bottom to keep cursor visible
    textarea.scrollTop = textarea.scrollHeight;
  }, [input]);

  // Keep textarea focused during dictation to show blinking cursor
  useEffect(() => {
    if (isListening && listeningMode === "dictate" && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end of text
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }, [isListening, listeningMode, input]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      onSend(trimmedInput);
      setInput("");
      clearDictationSession();
      if (isListening) {
        resetListeningState();
      }
    }
  };

  const getPlaceholderText = () => {
    if (isListening && listeningMode === "send") {
      return `${PLACEHOLDERS.CHAT.LISTENING} ${PLACEHOLDERS.CHAT.AUTO_SEND_HINT}`;
    }
    if (isListening && listeningMode === "dictate") {
      return PLACEHOLDERS.CHAT.DICTATION;
    }
    return placeholder;
  };

  const inputSurfaceClass = darkMode
    ? "border-slate-700/60 bg-slate-900/55 text-slate-100 placeholder:text-slate-500"
    : "border-slate-200/60 bg-white/80 text-slate-900 placeholder:text-slate-400";

  const statusLabel = isListening
    ? listeningMode === "send"
      ? LISTENING_MESSAGES.STATUS_LABEL
      : DICTATION_MESSAGES.STATUS_LABEL
    : LISTENING_MESSAGES.READY_STATUS;

  const statusTone = isListening ? "bg-rose-400" : "bg-emerald-400";

  const applyQuickPrompt = (value: string) => {
    if (isListening) {
      resetListeningState();
      clearDictationSession();
    }
    setInput(value);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <div>
      <div
        className={`group relative overflow-hidden rounded-2xl border ${
          darkMode
            ? "border-slate-800/70 bg-slate-950/70"
            : "border-indigo-100/60 bg-gradient-to-br from-white via-[#faf8ff] to-[#f5f0ff]/80"
        } shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] backdrop-blur-xl transition-colors`}
      >
        <div className="pointer-events-none absolute -top-20 right-8 h-40 w-40 rounded-full bg-indigo-200/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-purple-200/8 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-1.5 w-1.5 rounded-full ${statusTone}`}
            />
            <span
              className={`text-[11px] font-medium ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {statusLabel}
            </span>
            {isListening && listeningMode === "dictate" && (
              <span className="flex items-center gap-0.5 ml-1">
                <span className="inline-block h-1 w-1 rounded-full bg-slate-400 animate-pulse dictation-dot-delay-1" />
                <span className="inline-block h-1 w-1 rounded-full bg-slate-400 animate-pulse dictation-dot-delay-2" />
                <span className="inline-block h-1 w-1 rounded-full bg-slate-400 animate-pulse dictation-dot-delay-3" />
              </span>
            )}
          </div>

          <div className="relative">
            <div
              className={`group/input relative flex flex-col overflow-hidden rounded-xl border ${inputSurfaceClass} shadow-sm transition-all duration-200 focus-within:border-indigo-400 focus-within:shadow-md focus-within:shadow-indigo-500/20`}
            >
              <textarea
                ref={inputRef}
                placeholder={getPlaceholderText()}
                className={`w-full resize-none bg-transparent px-3 py-3 pr-14 text-sm leading-relaxed text-inherit focus:outline-none focus:ring-0 placeholder:text-sm desktop-chat-textarea ${
                  darkMode
                    ? "dark-scrollbar desktop-chat-textarea-dark"
                    : "desktop-chat-textarea-light"
                }`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                aria-label={ARIA_LABELS.CHAT.INPUT}
                readOnly={isListening && listeningMode === "send"}
                rows={1}
                spellCheck={false}
              />

              <div className="pointer-events-none absolute right-1.5 bottom-1.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSend}
                  aria-label={ARIA_LABELS.CHAT.SEND}
                  disabled={
                    !input.trim() ||
                    (isListening && listeningMode !== "dictate")
                  }
                  className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed desktop-send-btn ${
                    !input.trim() ||
                    (isListening && listeningMode !== "dictate")
                      ? darkMode
                        ? "desktop-send-btn-opacity-disabled-dark"
                        : "desktop-send-btn-opacity-disabled-light"
                      : "desktop-send-btn-opacity-enabled"
                  }`}
                >
                  <SendIcon className="h-4 w-4 desktop-send-btn-icon" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <VoiceSendButton
                onClick={toggleVoiceSend}
                isActive={isListening && listeningMode === "send"}
                darkMode={darkMode}
              />
              <DictateButton
                onClick={toggleDictation}
                isActive={isListening && listeningMode === "dictate"}
                darkMode={darkMode}
              />
            </div>

            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.label}
                type="button"
                onClick={() => applyQuickPrompt(prompt.value)}
                className={`rounded-full font-medium transition-all hover:brightness-110 quick-prompt-btn ${
                  darkMode ? "quick-prompt-btn-dark" : "quick-prompt-btn-light"
                }`}
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopChatInput;
