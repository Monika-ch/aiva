import { useState, useEffect, useRef } from "react";
import { VoiceSendIcon, SendIcon } from "../constants/icons";
import { ARIA_LABELS, PLACEHOLDERS } from "../constants/accessibilityLabels";
import type {
  SpeechRecognitionConstructorLike,
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
  WindowWithSpeechRecognition,
} from "../types/SpeechRecognition";

interface EnhancedChatInputProps {
  onSend: (message: string) => void;
  darkMode?: boolean;
  placeholder?: string;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  onSend,
  darkMode = false,
  placeholder = PLACEHOLDERS.CHAT.ASK_AIVA,
}) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { webkitSpeechRecognition, SpeechRecognition } =
      window as WindowWithSpeechRecognition;
    const RecognitionCtor: SpeechRecognitionConstructorLike | undefined =
      webkitSpeechRecognition ?? SpeechRecognition;

    if (!RecognitionCtor) {
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const firstResult = event.results[0]?.[0];
      if (!firstResult) {
        return;
      }

      setMessage(firstResult.transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // ignore cleanup errors
      }
      recognitionRef.current = null;
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(
        "Voice recognition is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors
      }
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        alert(
          "Voice recognition could not be started. Please check your browser settings."
        );
      }
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const inputClass = darkMode
    ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400";

  const voiceButtonClass = isListening
    ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
    : darkMode
      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200";

  return (
    <div
      className={`flex items-center gap-3 p-4 border-t ${
        darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      {/* Voice Input Button */}
      <button
        onClick={toggleVoiceInput}
        className={`relative flex-shrink-0 p-2.5 rounded-lg transition-all focus:outline-none ${voiceButtonClass}`}
        aria-label={
          isListening
            ? ARIA_LABELS.VOICE.STOP_LISTENING
            : ARIA_LABELS.VOICE.START_VOICE
        }
        title={
          isListening
            ? ARIA_LABELS.VOICE.STOP_LISTENING
            : ARIA_LABELS.VOICE.VOICE_INPUT
        }
      >
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-40"></span>
            <span className="absolute -inset-0.5 rounded-lg bg-red-500/30 blur-sm"></span>
          </>
        )}
        <VoiceSendIcon
          className="w-4 h-4 relative z-10"
          fill={isListening ? "currentColor" : "none"}
          strokeWidth={2}
        />
      </button>

      {/* Text Input */}
      <input
        aria-label={ARIA_LABELS.MESSAGE_INPUT.TYPE_MESSAGE}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${inputClass}`}
        placeholder={isListening ? PLACEHOLDERS.CHAT.LISTENING : placeholder}
        disabled={isListening}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || isListening}
        aria-label={ARIA_LABELS.CHAT.SEND}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        <SendIcon className="w-4 h-4" />
        <span className="font-medium">Send</span>
      </button>
    </div>
  );
};

export default EnhancedChatInput;
