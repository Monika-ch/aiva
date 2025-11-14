/**
 * Desktop Chat Input Component
 * Enhanced input with voice controls matching mobile widget functionality
 */

import { useState, useEffect, useRef } from "react";
import { VoiceSendButton, DictateButton } from "../features/VoiceControls";
import { useVoiceRecognition } from "../features/useVoiceRecognition";
import { useDictation } from "../features/useDictation";
import { useLanguageSettings } from "../features/useLanguageSettings";
import { CHAT_PLACEHOLDERS } from "../constants/chatConstants";
import type { SendMessageOptions } from "../types/Message";

const QUICK_PROMPTS = [
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

interface DesktopChatInputProps {
  onSend: (message: string, options?: SendMessageOptions) => void;
  darkMode?: boolean;
  placeholder?: string;
}

const DesktopChatInput: React.FC<DesktopChatInputProps> = ({
  onSend,
  darkMode = false,
  placeholder = CHAT_PLACEHOLDERS.ASK_AIVA,
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

    // Show scrollbar only when content overflows
    if (textarea.scrollHeight > maxHeight) {
      textarea.classList.add("has-overflow");
    } else {
      textarea.classList.remove("has-overflow");
    }

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
      return `${CHAT_PLACEHOLDERS.LISTENING} (auto-send after 5s pause)`;
    }
    if (isListening && listeningMode === "dictate") {
      return "Dictating... (say 'send' or 'enter' to submit)";
    }
    return placeholder;
  };

  const inputSurfaceClass = darkMode
    ? "border-slate-700/60 bg-slate-900/55 text-slate-100 placeholder:text-slate-500"
    : "border-slate-200/60 bg-white/80 text-slate-900 placeholder:text-slate-400";

  const statusLabel = isListening
    ? listeningMode === "send"
      ? "Listening to send"
      : "Dictation in progress"
    : "AIVA is ready";

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
            : "border-slate-200 bg-white/80"
        } shadow-[0_8px_24px_-8px_rgba(79,70,229,0.3)] backdrop-blur-xl transition-colors`}
      >
        <div className="pointer-events-none absolute -top-20 right-8 h-40 w-40 rounded-full bg-indigo-400/8 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-8 h-40 w-40 rounded-full bg-purple-400/8 blur-3xl" />
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
                <span
                  className="inline-block h-1 w-1 rounded-full bg-slate-400 animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="inline-block h-1 w-1 rounded-full bg-slate-400 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="inline-block h-1 w-1 rounded-full bg-slate-400 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
            )}
          </div>

          <div className="relative">
            <div
              className={`group/input relative flex flex-col overflow-hidden rounded-xl border ${inputSurfaceClass} shadow-sm transition-all duration-200 focus-within:border-indigo-400 focus-within:shadow-md focus-within:shadow-indigo-500/20`}
            >
              <style>{`
                .dark-textarea-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .dark-textarea-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .dark-textarea-scrollbar::-webkit-scrollbar-thumb {
                  background: #475569;
                  border-radius: 4px;
                }
                .dark-textarea-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #64748b;
                }
                .light-textarea-scrollbar::-webkit-scrollbar {
                  width: 8px;
                }
                .light-textarea-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .light-textarea-scrollbar::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 4px;
                }
                .light-textarea-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
              `}</style>
              <textarea
                ref={inputRef}
                placeholder={getPlaceholderText()}
                className={`w-full resize-none bg-transparent px-3 py-3 pr-14 text-sm leading-relaxed text-inherit focus:outline-none focus:ring-0 placeholder:text-sm ${
                  darkMode
                    ? "dark-textarea-scrollbar"
                    : "light-textarea-scrollbar"
                }`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                aria-label="Type your question to AIVA"
                readOnly={isListening && listeningMode === "send"}
                rows={1}
                spellCheck={false}
                style={{
                  caretColor: darkMode ? "#f9fafb" : "#4338ca",
                  minHeight: "40px",
                  maxHeight: "160px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: darkMode
                    ? "#475569 transparent"
                    : "#cbd5e1 transparent",
                }}
              />

              <div className="pointer-events-none absolute right-1.5 bottom-1.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSend}
                  aria-label="Send message"
                  disabled={
                    !input.trim() ||
                    (isListening && listeningMode !== "dictate")
                  }
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "#ffffff",
                    padding: "0",
                    margin: "0",
                    border: "none",
                    outline: "none",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                    opacity:
                      !input.trim() ||
                      (isListening && listeningMode !== "dictate")
                        ? darkMode
                          ? "0.6"
                          : "0.4"
                        : "1",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    style={{ strokeWidth: "2.5" }}
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
                className="rounded-full font-medium transition-all hover:brightness-110"
                style={{
                  padding: "10px 14px",
                  fontSize: "12px",
                  backgroundColor: darkMode ? "#1e293b" : "#eef2ff",
                  color: darkMode ? "#cbd5e1" : "#4338ca",
                  border: "none",
                  outline: "none",
                  minHeight: "36px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#6366f1";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = darkMode
                    ? "#1e293b"
                    : "#eef2ff";
                  e.currentTarget.style.color = darkMode
                    ? "#cbd5e1"
                    : "#4338ca";
                }}
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
