import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";
// NOTE: Historical snapshot with every chat widget feature enabled for reference.

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

  // Voice recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  // Quick actions visibility
  const [showQuickActions, setShowQuickActions] = useState(true);

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
    handleSend(suggestion);
  };

  // Handle quick action click
  const handleQuickAction = (query: string) => {
    handleSend(query);
    setShowQuickActions(false); // Hide after use
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

    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("• ")) {
        const suggestion = line.substring(2).trim();
        const isClicked = clickedSuggestions.has(suggestion);

        return (
          <button
            key={i}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`block w-full text-left px-2 py-1.5 -mx-1 rounded-lg transition-all duration-200 mb-1.5 ${
              isClicked
                ? darkMode
                  ? "bg-indigo-900 text-indigo-200 hover:bg-indigo-800 border border-indigo-700"
                  : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border border-indigo-300"
                : darkMode
                ? "text-gray-300 hover:bg-gray-700 border border-transparent"
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
      <div
        className={`w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
          darkMode ? "bg-indigo-900" : "bg-indigo-50"
        }`}
      >
        <img src={sparkIcon} alt='AIVA' className='w-3 h-3' />
      </div>
      <div
        className={`px-4 py-2 rounded-2xl rounded-bl-none shadow-sm ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <div className='flex gap-1'>
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
  const bgClass = darkMode ? "!bg-gray-900" : "bg-white";
  const textClass = darkMode ? "text-gray-100" : "text-gray-800";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBgClass = darkMode ? "bg-gray-800" : "bg-gray-50";
  const headerBgClass = darkMode
    ? "bg-gradient-to-r from-gray-800 to-gray-900"
    : "bg-gradient-to-r from-indigo-50 to-purple-50";

  return (
    <div
      className='fixed bottom-6 right-6 z-50 flex flex-col items-end'
      aria-live='polite'
    >
      {/* Copy Notification */}
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='mb-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg'
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
            role='dialog'
            aria-label='AIVA chat'
          >
            {/* Header with logo and actions */}
            <div
              className={`p-3 border-b ${borderClass} ${headerBgClass} flex items-center justify-between`}
            >
              <div className='flex items-center gap-2'>
                <img src={sparkIcon} alt='AIVA' className='w-8 h-8' />
                <div>
                  <span className={`text-sm font-semibold ${textClass}`}>
                    AIVA Chat
                  </span>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    AI Portfolio Assistant
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-1'>
                {/* Dark mode toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  } p-1.5 rounded-lg hover:bg-white/10 transition-colors`}
                  aria-label='Toggle dark mode'
                  title={darkMode ? "Light mode" : "Dark mode"}
                >
                  {darkMode ? (
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
                        d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                      />
                    </svg>
                  ) : (
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
                        d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                      />
                    </svg>
                  )}
                </button>

                {/* Clear chat button */}
                <button
                  onClick={handleClearChat}
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  } p-1.5 rounded-lg hover:bg-white/10 transition-colors`}
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
                  className={`${
                    darkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-400 hover:text-gray-600"
                  } p-1.5 rounded-lg hover:bg-white/10 transition-colors`}
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
              className={`p-3 h-[380px] overflow-y-auto text-sm space-y-4 ${
                darkMode
                  ? "bg-gradient-to-b from-gray-800 to-gray-900"
                  : "bg-gradient-to-b from-gray-50 to-white"
              }`}
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

                  {/* Quick Actions for new conversation */}
                  {showQuickActions && (
                    <div className='mt-6 grid grid-cols-2 gap-2'>
                      {QUICK_ACTIONS.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action.query)}
                          className={`p-3 rounded-lg transition-all ${
                            darkMode
                              ? "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
                              : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                          } shadow-sm hover:shadow-md`}
                        >
                          <div className='text-2xl mb-1'>{action.icon}</div>
                          <div className='text-xs font-medium'>
                            {action.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
                        <div
                          className={`w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
                            darkMode ? "bg-indigo-900" : "bg-indigo-50"
                          }`}
                        >
                          <img src={sparkIcon} alt='AIVA' className='w-3 h-3' />
                        </div>
                      )}
                      <div className='flex flex-col max-w-[80%]'>
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
                                darkMode ? "text-gray-400" : "text-gray-500"
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
                                  color:
                                    isSpeaking && speakingMessageIndex === i
                                      ? darkMode
                                        ? "#a5b4fc"
                                        : "#4f46e5"
                                      : darkMode
                                      ? "#d1d5db"
                                      : "#6b7280",
                                  backgroundColor:
                                    isSpeaking && speakingMessageIndex === i
                                      ? darkMode
                                        ? "rgba(49, 46, 129, 0.5)"
                                        : "rgba(238, 242, 255, 1)"
                                      : "transparent",
                                  borderColor: darkMode ? "#4b5563" : "#9ca3af",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                }}
                                className='p-1.5 rounded-md transition-all hover:bg-opacity-80'
                                title={
                                  isSpeaking && speakingMessageIndex === i
                                    ? "Stop reading"
                                    : "Read aloud"
                                }
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='w-3.5 h-3.5'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                                  />
                                </svg>
                              </button>

                              {/* Copy Button */}
                              <button
                                onClick={() => copyToClipboard(m.content)}
                                style={{
                                  color: darkMode ? "#d1d5db" : "#6b7280",
                                  backgroundColor: "transparent",
                                  borderColor: darkMode ? "#4b5563" : "#9ca3af",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                }}
                                className='p-1.5 rounded-md transition-all hover:bg-opacity-80'
                                title='Copy message'
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='w-3.5 h-3.5'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                                  />
                                </svg>
                              </button>

                              {/* Message Reactions */}
                              <button
                                onClick={() => handleReaction(i, "helpful")}
                                style={{
                                  color:
                                    m.reaction === "helpful"
                                      ? darkMode
                                        ? "#86efac"
                                        : "#16a34a"
                                      : darkMode
                                      ? "#d1d5db"
                                      : "#6b7280",
                                  backgroundColor:
                                    m.reaction === "helpful"
                                      ? darkMode
                                        ? "rgba(20, 83, 45, 0.5)"
                                        : "rgba(240, 253, 244, 1)"
                                      : "transparent",
                                  borderColor: darkMode ? "#4b5563" : "#9ca3af",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                }}
                                className='p-1.5 rounded-md transition-all hover:bg-opacity-80'
                                title='Helpful'
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='w-3.5 h-3.5'
                                  fill={
                                    m.reaction === "helpful"
                                      ? "currentColor"
                                      : "none"
                                  }
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleReaction(i, "not-helpful")}
                                style={{
                                  color:
                                    m.reaction === "not-helpful"
                                      ? darkMode
                                        ? "#fca5a5"
                                        : "#dc2626"
                                      : darkMode
                                      ? "#d1d5db"
                                      : "#6b7280",
                                  backgroundColor:
                                    m.reaction === "not-helpful"
                                      ? darkMode
                                        ? "rgba(127, 29, 29, 0.5)"
                                        : "rgba(254, 242, 242, 1)"
                                      : "transparent",
                                  borderColor: darkMode ? "#4b5563" : "#9ca3af",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                }}
                                className='p-1.5 rounded-md transition-all hover:bg-opacity-80'
                                title='Not helpful'
                              >
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  className='w-3.5 h-3.5'
                                  fill={
                                    m.reaction === "not-helpful"
                                      ? "currentColor"
                                      : "none"
                                  }
                                  viewBox='0 0 24 24'
                                  stroke='currentColor'
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5'
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
              <div className='flex items-center gap-2'>
                {/* Voice input button */}
                <button
                  onClick={toggleVoiceInput}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
                  className={`flex-1 h-10 ${inputBgClass} border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${textClass}`}
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
                  className='flex-shrink-0 inline-flex items-center justify-center h-10 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-5 h-5'
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
              <div
                className={`text-xs ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                } text-center mt-2`}
              >
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
