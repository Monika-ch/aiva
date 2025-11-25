import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import ChatContainer from "./components/ChatContainer";
import DesktopChatHeader from "./components/DesktopChatHeader";
import DesktopChatInput from "./components/DesktopChatInput";
import { ReplyPreview } from "./components/ReplyPreview";
import { SuggestionList } from "./components/SuggestionList";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { QuickActionsSection } from "./components/QuickActionsSection";
import Hero from "./components/Hero";
import sparkIcon from "./assets/logo-robo-face.svg";
import ChatWidget from "./components/ChatWidget";
import { useDarkMode } from "./utils/useDarkMode";
import { SunIcon, MoonIcon } from "./constants/icons";
import {
  MessageBubble,
  useTextToSpeech,
  TypingIndicator,
  useSmoothScroll,
} from "./utils";
import type { Message, SendMessageOptions } from "./types/Message";
import "./styles/App.css";

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
  const [isTyping, setIsTyping] = useState(false); // Desktop typing indicator
  const [isMobileTyping, setIsMobileTyping] = useState(false); // Mobile typing indicator
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { isSpeaking, speakingMessageIndex, readAloud } = useTextToSpeech();
  const [clickedSuggestions, setClickedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [clickedActions, setClickedActions] = useState<Set<string>>(new Set());

  // Enhanced scroll behavior for desktop chat
  const { scrollElementRef: messagesContainerRef } = useSmoothScroll({
    enabled: true,
    delay: 150,
    dependencies: [messages, isTyping],
  });

  // Legacy ref for compatibility
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<{
    message: Message;
    index: number;
  } | null>(null);

  const clearReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleSend = useCallback(
    (msg: string, options?: SendMessageOptions) => {
      const trimmed = msg.trim();
      if (!trimmed) return;

      const replyTargetId = replyingTo?.message.id;
      const userTimestamp = Date.now();
      const userMessage: Message = {
        role: "user",
        content: trimmed,
        timestamp: userTimestamp,
        id: `user-${userTimestamp}`,
        replyToId: replyTargetId,
      };

      setMessages((prev) => [...prev, userMessage]);

      if (replyingTo) {
        clearReply();
      }

      // Show typing indicator
      setIsTyping(true);

      // Mock AI response
      setTimeout(() => {
        const preferredLanguage =
          typeof window !== "undefined"
            ? localStorage.getItem("aiva-current-language")
            : "en";

        setMessages((prev) => {
          const aiTimestamp = Date.now();
          const aiContent = getResponseForLanguage(preferredLanguage);
          const aiMessage: Message = {
            role: "assistant",
            content: aiContent,
            timestamp: aiTimestamp,
            id: `assistant-${aiTimestamp}`,
            reaction: null,
          };

          const nextMessages = [...prev, aiMessage];

          if (options?.triggeredByVoice && options.voiceMode === "send") {
            const aiIndex = nextMessages.length - 1;
            readAloud(aiContent, aiIndex);
          }

          return nextMessages;
        });

        // Hide typing indicator
        setIsTyping(false);
      }, 1000);
    },
    [replyingTo, clearReply, readAloud]
  );

  // Mobile: allow adding assistant messages (for welcome/intro messages)
  const addMobileAssistantMessage = (
    text: string,
    type?: "quick-actions" | "normal"
  ) => {
    if (!text) return;
    const aiMessage: Message = {
      role: "assistant",
      content: text,
      timestamp: Date.now(),
      id: `mobile-assistant-${Date.now()}`,
      reaction: null,
      type: type || "normal",
    };
    setMobileMessages((prev) => [...prev, aiMessage]);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    clearReply();
  };

  // Clear mobile messages
  const clearMobileMessages = () => {
    setMobileMessages([]);
  };

  // Handle reply to message (desktop)
  const handleReply = useCallback((message: Message, index: number) => {
    setReplyingTo({ message, index });
  }, []);

  const handleMobileSend = useCallback(
    (msg: string, options?: SendMessageOptions) => {
      const trimmed = msg.trim();
      if (!trimmed) return;

      const userTimestamp = Date.now();
      const userMessage: Message = {
        role: "user",
        content: trimmed,
        timestamp: userTimestamp,
        id: `mobile-user-${userTimestamp}`,
        reaction: null,
        replyToId: options?.replyToId,
      };
      setMobileMessages((prev) => [...prev, userMessage]);

      // Show typing indicator for mobile
      setIsMobileTyping(true);

      // Mock AI response for mobile
      setTimeout(() => {
        const preferredLanguage =
          typeof window !== "undefined"
            ? localStorage.getItem("aiva-current-language")
            : "en";

        setMobileMessages((prev) => {
          const aiTimestamp = Date.now();
          const aiContent = getResponseForLanguage(preferredLanguage);
          const aiMessage: Message = {
            role: "assistant",
            content: aiContent,
            timestamp: aiTimestamp,
            id: `mobile-assistant-${aiTimestamp}`,
            reaction: null,
          };
          return [...prev, aiMessage];
        });

        // Hide typing indicator for mobile
        setIsMobileTyping(false);
      }, 1000);
    },
    []
  );

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
  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setClickedSuggestions((prev) => new Set(prev).add(suggestion));
      handleSend(suggestion);
    },
    [handleSend]
  );

  // Handle quick action click
  const handleQuickAction = useCallback(
    (query: string) => {
      setClickedActions((prev) => new Set(prev).add(query));
      handleSend(query);
    },
    [handleSend]
  );

  const messagesById = useMemo(() => {
    const map = new Map<string, Message>();
    for (const message of messages) {
      if (message.id) {
        map.set(message.id, message);
      }
    }
    return map;
  }, [messages]);

  // Focus input when replying (desktop)
  useEffect(() => {
    if (replyingTo) {
      // Small timeout to ensure the reply preview is rendered first
      setTimeout(() => {
        const textarea = document.querySelector<HTMLTextAreaElement>(
          ".desktop-chat-input textarea"
        );
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }, [replyingTo]);

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
            className={`hover:opacity-80 dark-mode-toggle ${
              darkMode ? "dark-mode-toggle-dark" : "dark-mode-toggle-light"
            }`}
            aria-label="Toggle dark mode"
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <SunIcon className="dark-mode-toggle-icon" />
            ) : (
              <MoonIcon className="dark-mode-toggle-icon" />
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
                ref={messagesContainerRef}
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
                    <WelcomeMessage darkMode={darkMode} variant="desktop" />

                    {/* Suggestion chips */}
                    <SuggestionList
                      darkMode={darkMode}
                      clickedSuggestions={clickedSuggestions}
                      onSuggestionClick={handleSuggestionClick}
                      variant="desktop"
                    />

                    {/* Quick action cards */}
                    <QuickActionsSection
                      darkMode={darkMode}
                      clickedActions={clickedActions}
                      onActionClick={handleQuickAction}
                      variant="desktop"
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
                        replyToMessage={
                          message.replyToId
                            ? messagesById.get(message.replyToId)
                            : undefined
                        }
                        onActionClick={handleQuickAction}
                        onReply={handleReply}
                      />
                    ))}
                    {isTyping && <TypingIndicator darkMode={darkMode} />}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Reply Preview for Desktop */}
              {replyingTo && (
                <div className="px-4 pt-3">
                  <ReplyPreview
                    replyToContent={replyingTo.message.content}
                    replyToRole={replyingTo.message.role}
                    darkMode={darkMode}
                    onClear={clearReply}
                  />
                </div>
              )}

              <div className="desktop-chat-input">
                <DesktopChatInput onSend={handleSend} darkMode={darkMode} />
              </div>
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
        isTyping={isMobileTyping}
      />
    </div>
  );
}

export default App;
