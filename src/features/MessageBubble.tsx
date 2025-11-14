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
  ReplyButton,
} from "./UIControls";
import { MessageContentRenderer } from "./ActionCards";
import type { Message } from "../types/Message";
import { formatTime } from "../lib/formatTime";

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
  onReply?: (message: Message, index: number) => void;
  replyToMessage?: Message;
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
  onReply,
  replyToMessage,
}) => {
  const isAssistant = message.role === "assistant";
  const isUser = message.role === "user";
  const repliedRoleLabel = replyToMessage
    ? replyToMessage.role === "assistant"
      ? "AIVA"
      : "You"
    : null;
  const repliedContentSnippet = replyToMessage
    ? replyToMessage.content.length > 160
      ? `${replyToMessage.content.slice(0, 160)}...`
      : replyToMessage.content
    : null;

  return (
    <div
      className={`flex items-end ${
        isUser ? "justify-end" : "justify-start"
      } group`}
    >
      {isAssistant && (
        <div
          className={`w-8 h-8 mr-1.5 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
            darkMode ? "bg-indigo-900" : "bg-indigo-50"
          }`}
        >
          <img src={sparkIcon} alt="AIVA" className="w-5 h-5" />
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
          {/* Reply Quote */}
          {replyToMessage && repliedRoleLabel && repliedContentSnippet && (
            <div
              className={`mb-2 pb-2 border-l-4 pl-2 ${
                isUser
                  ? "border-white/40 bg-white/10"
                  : darkMode
                    ? "border-gray-500 bg-gray-800/60"
                    : "border-gray-300 bg-gray-100/90"
              } rounded`}
            >
              <p
                className={`text-xs font-semibold mb-0.5 ${
                  isUser
                    ? "text-white/90"
                    : darkMode
                      ? "text-gray-300"
                      : "text-gray-700"
                }`}
              >
                {repliedRoleLabel}
              </p>
              <p
                className={`text-xs italic ${
                  isUser
                    ? "text-white/70"
                    : darkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {repliedContentSnippet}
              </p>
            </div>
          )}

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
              {onReply && (
                <ReplyButton
                  onClick={() => onReply(message, messageIndex)}
                  darkMode={darkMode}
                />
              )}
              <ReactionButtons
                onReaction={(reaction) => onReaction(messageIndex, reaction)}
                currentReaction={message.reaction}
                darkMode={darkMode}
              />
            </>
          )}
          {isUser && onReply && (
            <ReplyButton
              onClick={() => onReply(message, messageIndex)}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};
