import React, { useEffect, useState, useCallback } from "react";
import ChatWidgetUI from "./ChatWidgetUI";
import { WELCOME_MESSAGES } from "../constants/chatConstants";
import useChatWidget from "../hooks/useChatWidget";
import type { Message, SendMessageOptions } from "../types/Message";

interface ChatWidgetProps {
  messages: Message[];
  onSend: (msg: string, options?: SendMessageOptions) => void;
  onAssistantMessage?: (msg: string, type?: "quick-actions" | "normal") => void;
  onClearMessages?: () => void;
  onReaction?: (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => void;
  darkMode?: boolean;
  isTyping?: boolean;
}

const STORAGE_KEY = "aiva.chat.widget";

const ChatWidget: React.FC<ChatWidgetProps> = ({
  messages,
  onSend,
  onAssistantMessage,
  onClearMessages,
  onReaction,
  darkMode = false,
  isTyping = false,
}) => {
  const { isOpen, setIsOpen, input, setInput, handleSend } =
    useChatWidget(onSend);
  const [lastSeenIndex, setLastSeenIndex] = useState(messages.length);
  const [autoOpened, setAutoOpened] = useState(false);
  const [isInternalTyping, setIsInternalTyping] = useState(false);

  // Clear storage on mount
  useEffect(() => {
    console.log("Resetting widget state on mount");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = messages
    .slice(lastSeenIndex)
    .filter((m) => m.role === "assistant").length;

  const sendWelcomeMessages = useCallback(() => {
    if (!onAssistantMessage) return;

    const greeting = WELCOME_MESSAGES.GREETING;
    const suggestions = WELCOME_MESSAGES.SUGGESTIONS;

    // Show typing indicator before greeting
    setIsInternalTyping(true);
    setTimeout(() => {
      setIsInternalTyping(false);
      onAssistantMessage(greeting);
      console.log("Greeting sent:", greeting);

      // Show typing for suggestions
      setTimeout(() => {
        setIsInternalTyping(true);
        setTimeout(() => {
          setIsInternalTyping(false);
          onAssistantMessage(suggestions);
          console.log("Suggestions sent:", suggestions);

          setTimeout(() => {
            setIsInternalTyping(true);
            setTimeout(() => {
              setIsInternalTyping(false);
              onAssistantMessage("Quick actions you can tap:", "quick-actions");
            }, 800);
          }, 500);
        }, 800);
      }, 500);
    }, 1000);
  }, [onAssistantMessage]);

  const handleWidgetOpen = useCallback(() => {
    setIsOpen(true);
    if (!autoOpened) {
      setAutoOpened(true);
      sendWelcomeMessages();
    }
  }, [autoOpened, sendWelcomeMessages, setIsOpen]);

  // Auto-open timer
  useEffect(() => {
    if (autoOpened) {
      console.log("Skip auto-open - widget was previously opened");
      return;
    }

    console.log("Setting auto-open timer");
    const timer = window.setTimeout(() => {
      console.log("OPENING THE CHAT WIDGET");
      handleWidgetOpen();
    }, 30000);

    return () => clearTimeout(timer);
  }, [autoOpened, handleWidgetOpen]);

  // Update lastSeenIndex when widget opens
  useEffect(() => {
    if (!isOpen) return;
    setLastSeenIndex(messages.length);
  }, [isOpen, messages.length]);

  return (
    <ChatWidgetUI
      messages={messages}
      isOpen={isOpen}
      setIsOpen={(value) => {
        if (value) {
          handleWidgetOpen();
        } else {
          setIsOpen(false);
        }
      }}
      input={input}
      setInput={setInput}
      handleSend={handleSend}
      unreadCount={unreadCount}
      isTyping={isTyping || isInternalTyping}
      onClearMessages={onClearMessages}
      onReaction={onReaction}
      darkMode={darkMode}
    />
  );
};

export default ChatWidget;
