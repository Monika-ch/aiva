// import { useState } from "react";
// import ChatContainer from "./components/ChatContainer";
// import ChatHeader from "./components/ChatHeader";
// import ChatInput from "./components/ChatInput";
// import Hero from "./components/Hero";
// import sparkIcon from "./assets/logo-robo-face.svg"; // lightweight svg icon

// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }

// function App() {
//   const [messages, setMessages] = useState<Message[]>([]);

//   const handleSend = (msg: string) => {
//     if (!msg.trim()) return;
//     const userMessage: Message = { role: "user", content: msg };
//     setMessages((prev) => [...prev, userMessage]);

//     // Temporary AI mock response (to be replaced in Phase 2 backend)
//     setTimeout(() => {
//       const aiMessage: Message = {
//         role: "assistant",
//         content: "That's interesting! Tell me more about your portfolio goals.",
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     }, 1000);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-10">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
//         {/* Left column: Product information */}
//         <div className="md:col-span-1 bg-white rounded-xl shadow p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <img src={sparkIcon} alt="AIVA" className="w-20 h-20 text-indigo-600" />
//             <div>
//               <h2 className="text-lg font-semibold">AIVA</h2>
//               <p className="text-sm text-gray-500">AI-Powered Portfolio Assistant</p>
//             </div>
//           </div>
//           <Hero />
//         </div>

//         {/* Right column: Chat */}
//         <div className="md:col-span-2">
//           <ChatContainer>
//             <ChatHeader />
//             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
//               {messages.map((msg, i) => (
//                 <div
//                   key={i}
//                   className={`flex items-end ${
//                     msg.role === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   {msg.role === "assistant" && (
//                     <div className="w-7 h-7 mr-3 flex items-center justify-center bg-indigo-50 rounded-full">
//                       <img src={sparkIcon} alt="spark" className="w-4 h-4 text-indigo-600" />
//                     </div>
//                   )}
//                   <div
//                     className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${
//                       msg.role === "user"
//                         ? "bg-indigo-600 text-white rounded-br-none"
//                         : "bg-gray-100 text-gray-900 rounded-bl-none"
//                     }`}
//                   >
//                     {msg.content}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <ChatInput onSend={handleSend} />
//           </ChatContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import { useState, useCallback, useEffect, useRef } from "react";

import ChatContainer from "./components/ChatContainer";
import DesktopChatHeader from "./components/DesktopChatHeader";
import DesktopChatInput from "./components/DesktopChatInput";
import Hero from "./components/Hero";
import sparkIcon from "./assets/logo-robo-face.svg";
import ChatWidget from "./components/ChatWidget";
import { useDarkMode } from "./features/useDarkMode";
import {
  MessageBubble,
  useTextToSpeech,
  type Message as FeatureMessage,
} from "./features";
import {
  INTRO_SUGGESTIONS,
  QUICK_ACTIONS,
  CHAT_PLACEHOLDERS,
} from "./constants/chatConstants";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  id?: string;
  reaction?: "helpful" | "not-helpful" | null;
}

const DEFAULT_AI_RESPONSE =
  "That's interesting! Tell me more about your portfolio goals.";

const AI_RESPONSE_TRANSLATIONS: Record<string, string> = {
  en: DEFAULT_AI_RESPONSE,
  es: "¡Eso es interesante! Cuéntame más sobre tus objetivos de portafolio.",
  fr: "C'est intéressant ! Parle-moi davantage de tes objectifs de portfolio.",
  de: "Das ist interessant! Erzähl mir mehr über deine Portfolio-Ziele.",
  hi: "यह दिलचस्प है! कृपया अपने पोर्टफोलियो लक्ष्यों के बारे में और बताएं।",
  ja: "それは興味深いですね！ポートフォリオの目標についてもっと教えてください。",
  ko: "흥미로운데요! 포트폴리오 목표에 대해 더 이야기해 주세요.",
  zh: "这很有意思！请再多告诉我一些你的作品集目标。",
};

const getResponseForLanguage = (locale: string | null | undefined) => {
  if (!locale) return DEFAULT_AI_RESPONSE;
  const prefix = locale.toLowerCase().split("-")[0];
  return AI_RESPONSE_TRANSLATIONS[prefix] ?? DEFAULT_AI_RESPONSE;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]); // Desktop messages
  const [mobileMessages, setMobileMessages] = useState<Message[]>([]); // Mobile widget messages
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isSpeaking, speakingMessageIndex, readAloud } = useTextToSpeech();
  const [clickedSuggestions, setClickedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (
    msg: string,
    options?: { triggeredByVoice?: boolean; voiceMode?: "send" | "dictate" }
  ) => {
    if (!msg.trim()) return;
    const userMessage: Message = {
      role: "user",
      content: msg,
      timestamp: Date.now(),
      id: `user-${Date.now()}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Mock AI response
    setTimeout(() => {
      const preferredLanguage =
        typeof window !== "undefined"
          ? localStorage.getItem("aiva-current-language")
          : "en";

      const aiMessage: Message = {
        role: "assistant",
        content: getResponseForLanguage(preferredLanguage),
        timestamp: Date.now(),
        id: `assistant-${Date.now()}`,
        reaction: null,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Read aloud the response if triggered by voice send mode
      if (options?.triggeredByVoice && options?.voiceMode === "send") {
        setTimeout(() => {
          // Use the new message index (current length after adding AI message)
          readAloud(
            getResponseForLanguage(preferredLanguage),
            messages.length + 1
          );
        }, 100);
      }
    }, 1000);
  };

  // Mobile: allow adding assistant messages (for welcome/intro messages)
  const addMobileAssistantMessage = (text: string) => {
    if (!text) return;
    const aiMessage: Message = {
      role: "assistant",
      content: text,
      timestamp: Date.now(),
      id: `mobile-assistant-${Date.now()}`,
      reaction: null,
    };
    setMobileMessages((prev) => [...prev, aiMessage]);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Clear mobile messages
  const clearMobileMessages = () => {
    setMobileMessages([]);
  };

  // Mobile: Handle send (separate from desktop)
  const handleMobileSend = (msg: string) => {
    if (!msg.trim()) return;
    const userMessage: Message = {
      role: "user",
      content: msg,
      timestamp: Date.now(),
      id: `mobile-user-${Date.now()}`,
      reaction: null,
    };
    setMobileMessages((prev) => [...prev, userMessage]);

    // Mock AI response for mobile
    setTimeout(() => {
      const preferredLanguage =
        typeof window !== "undefined"
          ? localStorage.getItem("aiva-current-language")
          : "en";

      const aiMessage: Message = {
        role: "assistant",
        content: getResponseForLanguage(preferredLanguage),
        timestamp: Date.now(),
        id: `mobile-assistant-${Date.now()}`,
        reaction: null,
      };
      setMobileMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  // Handle message reaction (desktop)
  const handleReaction = (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageIndex
          ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
          : msg
      )
    );
  };

  // Handle message reaction (mobile)
  const handleMobileReaction = (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => {
    setMobileMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageIndex
          ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
          : msg
      )
    );
  };

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setClickedSuggestions((prev) => new Set(prev).add(suggestion));
    handleSend(suggestion);
  }, []);

  // Handle quick action click
  const handleQuickAction = useCallback((query: string) => {
    handleSend(query);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      className={`min-h-screen w-full py-8 relative ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Dark Mode Toggle - Top Right, Outside Chat Area */}
        <div className="fixed top-6 right-6 z-50">
          <button
            onClick={toggleDarkMode}
            style={{
              backgroundColor: darkMode ? "#374151" : "#ffffff",
              color: darkMode ? "#d1d5db" : "#6b7280",
              padding: "10px",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              border: darkMode ? "1px solid #4b5563" : "1px solid #e5e7eb",
              outline: "none",
              boxShadow: darkMode
                ? "0 4px 6px rgba(0, 0, 0, 0.3)"
                : "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
            className="hover:opacity-80"
            aria-label="Toggle dark mode"
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "24px", height: "24px" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "24px", height: "24px" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-10">
          {/* Left column - Hero Section */}
          <div
            className={`lg:col-span-4 rounded-xl shadow-lg p-5 ${
              darkMode ? "bg-gray-800 border border-gray-700" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src={sparkIcon}
                alt="AIVA"
                className="w-14 h-14 hero-logo cursor-pointer"
              />
              <div>
                <h2
                  className={`text-lg font-bold ${
                    darkMode ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  AIVA
                </h2>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  AI-Powered Portfolio Assistant
                </p>
              </div>
            </div>
            <Hero darkMode={darkMode} />
          </div>

          {/* Right column - Chat Section (hidden on small screens — mobile uses only ChatWidget) */}
          <div className="hidden lg:col-span-8 lg:block">
            <ChatContainer darkMode={darkMode}>
              <DesktopChatHeader
                onClearMessages={clearMessages}
                darkMode={darkMode}
              />
              <div
                className={`flex-1 overflow-y-auto p-3 text-sm space-y-4 ${
                  darkMode
                    ? "bg-gradient-to-b from-gray-800 to-gray-900 chat-messages-dark"
                    : "bg-gradient-to-b from-gray-50 to-white chat-messages-light"
                }`}
              >
                {messages.length === 0 ? (
                  // Empty state with welcome message, suggestions, and actions
                  <div className="flex flex-col items-center justify-center h-full space-y-8 py-8">
                    {/* Welcome greeting */}
                    <div className="text-center space-y-3 max-w-xl px-4">
                      <h2
                        className={`text-2xl font-semibold ${
                          darkMode ? "text-gray-100" : "text-gray-800"
                        }`}
                      >
                        {CHAT_PLACEHOLDERS.ASK_AIVA}
                      </h2>
                      <p
                        className={`text-sm leading-relaxed ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        I'm your AI-Powered Portfolio Assistant. I can help you
                        explore projects, discuss technical skills, and answer
                        questions about experience.
                      </p>
                    </div>

                    {/* Suggestion chips */}
                    <div className="space-y-3 w-full max-w-xl px-4">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
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
                            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
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
                    <div className="space-y-3 w-full max-w-xl px-4">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        ⚡ Quick actions:
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {QUICK_ACTIONS.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickAction(action.query)}
                            className={`group p-4 rounded-xl text-left transition-all transform hover:scale-105 ${
                              darkMode
                                ? "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-indigo-600"
                                : "bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white border border-gray-200 hover:border-indigo-400 shadow-md hover:shadow-lg"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`text-3xl transform transition-transform group-hover:scale-110 ${
                                  darkMode ? "drop-shadow-lg" : ""
                                }`}
                              >
                                {action.icon}
                              </div>
                              <span
                                className={`font-semibold text-sm ${
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
                        message={
                          {
                            sender:
                              message.role === "user" ? "user" : "assistant",
                            role: message.role,
                            content: message.content,
                            timestamp: message.timestamp,
                            reaction: message.reaction,
                            id: message.id,
                          } as FeatureMessage
                        }
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
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              <DesktopChatInput onSend={handleSend} darkMode={darkMode} />
            </ChatContainer>
          </div>
        </div>
      </div>

      {/* Floating Chat Widget (mobile-only) */}
      <ChatWidget
        messages={mobileMessages}
        onSend={handleMobileSend}
        onAssistantMessage={addMobileAssistantMessage}
        onClearMessages={clearMobileMessages}
        onReaction={handleMobileReaction}
        darkMode={darkMode}
      />
    </div>
  );
}

export default App;
