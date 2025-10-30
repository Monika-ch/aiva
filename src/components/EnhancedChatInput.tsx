import { useState, useEffect, useRef } from "react";

interface EnhancedChatInputProps {
  onSend: (message: string) => void;
  darkMode?: boolean;
  placeholder?: string;
}

const EnhancedChatInput: React.FC<EnhancedChatInputProps> = ({
  onSend,
  darkMode = false,
  placeholder = "Ask AIVA...",
}) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(
        "Voice recognition is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
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
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        title={isListening ? "Stop listening" : "Voice input"}
      >
        {isListening && (
          <>
            <span className='absolute inset-0 rounded-lg bg-red-400 animate-ping opacity-40'></span>
            <span className='absolute -inset-0.5 rounded-lg bg-red-500/30 blur-sm'></span>
          </>
        )}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-4 h-4 relative z-10'
          fill={isListening ? "currentColor" : "none"}
          viewBox='0 0 24 24'
          stroke='currentColor'
          strokeWidth={2}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
          />
        </svg>
      </button>

      {/* Text Input */}
      <input
        aria-label='Type your message'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all ${inputClass}`}
        placeholder={isListening ? "Listening..." : placeholder}
        disabled={isListening}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || isListening}
        aria-label='Send message'
        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
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
        <span className='font-medium'>Send</span>
      </button>
    </div>
  );
};

export default EnhancedChatInput;
