/**
 * Desktop Chat Input Component
 * Enhanced input with voice controls matching mobile widget functionality
 */

import { useState, useEffect, useRef } from "react";
import { VoiceSendButton, DictateButton } from "../features/VoiceControls";
import { useVoiceRecognition } from "../features/useVoiceRecognition";
import { useDictation } from "../features/useDictation";
import { useLanguageSettings } from "../features/useLanguageSettings";

interface DesktopChatInputProps {
  onSend: (message: string) => void;
  darkMode?: boolean;
  placeholder?: string;
}

const DesktopChatInput: React.FC<DesktopChatInputProps> = ({
  onSend,
  darkMode = false,
  placeholder = "Ask AIVA...",
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
    onSendMessage: (message) => {
      const trimmedMessage = message.trim();
      if (trimmedMessage) {
        onSend(trimmedMessage);
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

  const inputClass = darkMode
    ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400";

  const getPlaceholderText = () => {
    if (isListening && listeningMode === "send") {
      return "Listening... (auto-send after 5s pause)";
    }
    if (isListening && listeningMode === "dictate") {
      return "Dictating... (say 'send' or 'enter' to submit)";
    }
    return placeholder;
  };

  return (
    <div
      className={`p-3 border-t ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <div className='flex items-end gap-1.5 mb-2'>
        {/* Voice Send Button */}
        <VoiceSendButton
          onClick={toggleVoiceSend}
          isActive={isListening && listeningMode === "send"}
          darkMode={darkMode}
        />

        {/* Dictate Button */}
        <DictateButton
          onClick={toggleDictation}
          isActive={isListening && listeningMode === "dictate"}
          darkMode={darkMode}
        />

        {/* Textarea Input */}
        <textarea
          ref={inputRef}
          placeholder={getPlaceholderText()}
          className={`flex-1 min-w-0 ${inputClass} ${
            darkMode ? "dark-scrollbar" : ""
          } overflow-auto rounded-xl px-4 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          aria-label='Type your question to AIVA'
          readOnly={isListening && listeningMode === "send"}
          rows={1}
          spellCheck={false}
          style={{
            caretColor: darkMode ? "#f9fafb" : "#4338ca",
            minHeight: "40px",
            maxHeight: "208px", // 8 rows * 24px (line-height) + 16px (padding)
            whiteSpace: "pre-wrap",
            border: darkMode ? "1px solid #4b5563" : "1px solid #d1d5db",
          }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          aria-label='Send message'
          disabled={
            !input.trim() || (isListening && listeningMode !== "dictate")
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
          className='flex-shrink-0 inline-flex items-center justify-center h-10 px-0 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all'
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

      {/* Help Text */}
      <div
        className={`text-xs ${
          darkMode ? "text-gray-300" : "text-gray-400"
        } text-center mt-2`}
      >
        Press Enter to send • Shift+Enter for new line
      </div>
    </div>
  );
};

export default DesktopChatInput;
