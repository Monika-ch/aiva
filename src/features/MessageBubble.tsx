/**
 * Message Bubble Component
 * Renders individual chat messages with actions
 */

import React from "react";
import sparkIcon from "../assets/logo-robo-face.svg";
import {
  ReadAloudButton,
  CopyButton,
  ReactionButtons,
  formatTime,
} from "./UIControls";
import { MessageContentRenderer } from "./ActionCards";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  id?: string;
  reaction?: "helpful" | "not-helpful" | null;
}

interface MessageBubbleProps {
  message: Message;
  messageIndex: number;
  darkMode: boolean;
  clickedSuggestions: Set<string>;
  isSpeaking: boolean;
  speakingMessageIndex: number | null;
  onReadAloud: (text: string, index: number) => void;
  onCopy: (text: string) => void;
  onReaction: (index: number, reaction: "helpful" | "not-helpful") => void;
  onSuggestionClick: (suggestion: string) => void;
  onActionClick: (query: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  messageIndex,
  darkMode,
  clickedSuggestions,
  isSpeaking,
  speakingMessageIndex,
  onReadAloud,
  onCopy,
  onReaction,
  onSuggestionClick,
  onActionClick,
}) => {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end ${
        isUser ? "justify-end" : "justify-start"
      } group`}
    >
      {isAssistant && (
        <div
          className={`w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
            darkMode ? "bg-indigo-900" : "bg-indigo-50"
          }`}
        >
          <img src={sparkIcon} alt="AIVA" className="w-3 h-3" />
        </div>
      )}

      <div className="flex flex-col max-w-[80%]">
        <div
          className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${
            isUser
              ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none"
              : darkMode
                ? "bg-gray-700 text-gray-100 rounded-bl-none border border-gray-600"
                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
          }`}
        >
          <MessageContentRenderer
            content={message.content}
            isAssistant={isAssistant}
            darkMode={darkMode}
            clickedSuggestions={clickedSuggestions}
            onSuggestionClick={onSuggestionClick}
            onActionClick={onActionClick}
          />
        </div>

        {/* Timestamp and actions - Always visible */}
        <div
          className={`flex items-center gap-1 mt-1 px-1 ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          {message.timestamp && (
            <span
              className={`text-[10px] whitespace-nowrap ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {formatTime(message.timestamp)}
            </span>
          )}
          {isAssistant && (
            <>
              <ReadAloudButton
                onClick={() => onReadAloud(message.content, messageIndex)}
                isSpeaking={isSpeaking && speakingMessageIndex === messageIndex}
                darkMode={darkMode}
              />
              <CopyButton
                onClick={() => onCopy(message.content)}
                darkMode={darkMode}
              />
              <ReactionButtons
                onReaction={(reaction) => onReaction(messageIndex, reaction)}
                currentReaction={message.reaction}
                darkMode={darkMode}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
