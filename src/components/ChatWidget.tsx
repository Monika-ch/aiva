import React, { useEffect, useState, useCallback } from "react";
import ChatWidgetUI from "./ChatWidgetUI";
import { QUICK_ACTIONS_MARKER } from "../features";
import useChatWidget from "../hooks/useChatWidget";
import type { Message, SendMessageOptions } from "../types/Message";

interface ChatWidgetProps {
  messages: Message[];
  onSend: (msg: string, options?: SendMessageOptions) => void;
  onAssistantMessage?: (msg: string) => void;
  onClearMessages?: () => void;
  onReaction?: (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => void;
  darkMode?: boolean;
}

const STORAGE_KEY = "aiva.chat.widget";

const ChatWidget: React.FC<ChatWidgetProps> = ({
  messages,
  onSend,
  onAssistantMessage,
  onClearMessages,
  onReaction,
  darkMode = false,
}) => {
  const { isOpen, setIsOpen, input, setInput, handleSend } =
    useChatWidget(onSend);
  const [lastSeenIndex, setLastSeenIndex] = useState(messages.length);
  const [autoOpened, setAutoOpened] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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

    const greeting =
      "Hi, I'm AIVA your personal AI Virtual Assistant to help you navigate the portfolio";
    const suggestions = `You can ask me things like:
• learn top tech skills
• explore experience
• tell me more about their journey
• do a storytelling on Monika`;
    const quickActionsPrompt = `${QUICK_ACTIONS_MARKER}Here are a few quick actions you can tap to jump in:`;

    // Show typing indicator before greeting
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      onAssistantMessage(greeting);
      console.log("Greeting sent:", greeting);

      // Show typing for suggestions
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          onAssistantMessage(suggestions);
          console.log("Suggestions sent:", suggestions);

          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setIsTyping(false);
              onAssistantMessage(quickActionsPrompt);
              console.log("Quick actions prompt sent:", quickActionsPrompt);
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
      isTyping={isTyping}
      onClearMessages={onClearMessages}
      onReaction={onReaction}
      darkMode={darkMode}
    />
  );
};

export default ChatWidget;
