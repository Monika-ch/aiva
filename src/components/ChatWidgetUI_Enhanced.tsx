import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";
// NOTE: Experimental intermediate build capturing enhancements before the final refactor.

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
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
}

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
}) => {
  // Track clicked suggestions
  const [clickedSuggestions, setClickedSuggestions] = useState<Set<string>>(
    new Set()
  );

  // Reference to message container for auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Initialize Speech Recognition (Web Speech API)
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
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [setInput]);

  // Toggle voice input
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

  // Clear chat history
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      // This would need to be passed from parent, but for now we'll just clear locally
      setClickedSuggestions(new Set());
      // You'll need to add a clearMessages function from the parent
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log("Copied to clipboard");
    });
  };

  // Helper to handle suggestion clicks - sends immediately
  const handleSuggestionClick = (suggestion: string) => {
    // Mark as clicked
    setClickedSuggestions((prev) => new Set(prev).add(suggestion));

    // Send the suggestion directly using the messageOverride parameter
    handleSend(suggestion);
  };

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
    if (!isAssistant || !content.includes("• ")) {
      return content;
    }

    // Split suggestions into lines
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("• ")) {
        // Make bullet points clickable
        const suggestion = line.substring(2).trim();
        const isClicked = clickedSuggestions.has(suggestion);

        return (
          <button
            key={i}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`block w-full text-left px-2 py-1.5 -mx-1 rounded-lg transition-all duration-200 mb-1.5 ${
              isClicked
                ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border border-indigo-300"
                : "text-gray-700 hover:bg-gray-100 border border-transparent"
            }`}
          >
            • {suggestion}
          </button>
        );
      }
      return <div key={i}>{line}</div>;
    });
  };

  // Typing indicator component
  const TypingIndicator = () => (
    <div className='flex items-end justify-start mb-4'>
      <div className='w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center bg-indigo-50 rounded-full'>
        <img src={sparkIcon} alt='AIVA' className='w-3 h-3' />
      </div>
      <div className='bg-white text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none shadow-sm'>
        <div className='flex gap-1'>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className='fixed bottom-6 right-6 z-50 flex flex-col items-end md:hidden'
      aria-live='polite'
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className='w-[340px] bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 mb-3'
            role='dialog'
            aria-label='AIVA chat'
          >
            {/* Header with logo and actions */}
            <div className='p-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <img src={sparkIcon} alt='AIVA' className='w-8 h-8' />
                <div>
                  <span className='text-sm font-semibold text-gray-800'>
                    AIVA Chat
                  </span>
                  <p className='text-xs text-gray-500'>
                    AI Portfolio Assistant
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                {/* Clear chat button */}
                <button
                  onClick={handleClearChat}
                  className='text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white/50 transition-colors'
                  aria-label='Clear chat'
                  title='Clear chat history'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-4 h-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                </button>

                {/* Minimize/Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className='text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white/50 transition-colors'
                  aria-label='Close chat'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-4 h-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages container */}
            <div
              ref={messageContainerRef}
              className='p-3 h-[380px] overflow-y-auto text-sm space-y-4 bg-gradient-to-b from-gray-50 to-white'
            >
              {/* Live region for screen readers */}
              <div className='sr-only' aria-live='polite'>
                {latestAssistantMessage || ""}
              </div>

              {messages.length === 0 ? (
                <div className='text-center py-8'>
                  <div className='mb-3'>
                    <img
                      src={sparkIcon}
                      alt='AIVA'
                      className='w-16 h-16 mx-auto opacity-50'
                    />
                  </div>
                  <p className='text-gray-500 italic'>
                    Start a conversation with AIVA!
                  </p>
                  <p className='text-xs text-gray-400 mt-2'>
                    Ask about projects, skills, or experience
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex items-end ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      } group`}
                    >
                      {m.role === "assistant" && (
                        <div className='w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center bg-indigo-50 rounded-full'>
                          <img src={sparkIcon} alt='AIVA' className='w-3 h-3' />
                        </div>
                      )}
                      <div className='flex flex-col max-w-[80%]'>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
                            m.role === "user"
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none"
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
                          className={`flex items-center gap-2 mt-1 px-1 ${
                            m.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {m.timestamp && (
                            <span className='text-xs text-gray-400'>
                              {formatTime(m.timestamp)}
                            </span>
                          )}
                          {m.role === "assistant" && (
                            <button
                              onClick={() => copyToClipboard(m.content)}
                              className='opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 p-1'
                              title='Copy message'
                            >
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='w-3 h-3'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                />
                              </svg>
                            </button>
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
            <div className='p-3 border-t bg-white'>
              <div className='flex items-center gap-2 mb-2'>
                {/* Voice input button */}
                <button
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label={
                    isListening ? "Stop listening" : "Start voice input"
                  }
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-4 h-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
                    />
                  </svg>
                </button>

                <input
                  type='text'
                  placeholder={isListening ? "Listening..." : "Ask AIVA..."}
                  className='flex-1 h-10 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-transparent transition-all'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && handleSend()
                  }
                  aria-label='Type your question to AIVA'
                  disabled={isListening}
                />

                <button
                  onClick={() => handleSend()}
                  aria-label='Send message'
                  disabled={!input.trim() || isListening}
                  className='inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
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

              {/* Quick action hints */}
              <div className='text-xs text-gray-400 text-center'>
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating action button */}
      <div className='relative'>
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
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
            alt='AIVA'
            className='w-8 h-8'
            style={{
              filter:
                "brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
            }}
          />
        </motion.button>

        {/* Unread badge */}
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
