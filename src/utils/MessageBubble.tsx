/**
 * Message Bubble Component
 * Renders individual chat messages with actions
 * Supports swipe-to-reply on mobile
 */

import React, { useRef, useState } from "react";
import sparkIcon from "../assets/logo-robo-face.svg";
import { ALT_TEXT } from "../constants/accessibilityLabels";
import { UI_TEXT, SWIPE_CONFIG } from "../constants/chatConstants";
import { ReplyIcon } from "../constants/icons";
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
  clickedActions?: Set<string>;
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
  clickedActions = new Set(),
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
      ? UI_TEXT.ROLE_LABELS.AIVA
      : UI_TEXT.ROLE_LABELS.YOU
    : null;
  const repliedContentSnippet = replyToMessage
    ? replyToMessage.content.length > 160
      ? `${replyToMessage.content.slice(0, 160)}...`
      : replyToMessage.content
    : null;

  // Swipe-to-reply state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [showReplyIcon, setShowReplyIcon] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onReply) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!onReply) return;

    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX.current;
    const deltaY = touchY - touchStartY.current;

    // Only allow right swipe, and ensure horizontal movement is primary
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      deltaX > SWIPE_CONFIG.MIN_HORIZONTAL_DELTA
    ) {
      isSwiping.current = true;
      // Apply resistance for smoother feel
      const offset = Math.min(
        deltaX / SWIPE_CONFIG.RESISTANCE,
        SWIPE_CONFIG.THRESHOLD
      );
      setSwipeOffset(offset);
      setShowReplyIcon(offset > SWIPE_CONFIG.ICON_SHOW_OFFSET);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!onReply) return;

    if (isSwiping.current && swipeOffset >= SWIPE_CONFIG.THRESHOLD) {
      // Trigger reply action
      onReply(message, messageIndex);
    }

    // Reset swipe state with animation
    setSwipeOffset(0);
    setShowReplyIcon(false);
    isSwiping.current = false;
  };

  // Reset on touch cancel
  const handleTouchCancel = () => {
    setSwipeOffset(0);
    setShowReplyIcon(false);
    isSwiping.current = false;
  };

  return (
    <div
      className={`flex items-end ${
        isUser ? "justify-end" : "justify-start"
      } group relative`}
    >
      {/* Reply icon shown during swipe */}
      {showReplyIcon && onReply && (
        <div
          className="absolute left-2 top-1/2 -translate-y-1/2 z-0 transition-opacity"
          style={{
            opacity: Math.min(swipeOffset / SWIPE_CONFIG.THRESHOLD, 1),
          }}
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              darkMode ? "bg-indigo-600" : "bg-indigo-500"
            }`}
          >
            <ReplyIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {isAssistant && (
        <div
          className={`w-8 h-8 mr-1.5 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
            darkMode ? "bg-indigo-900" : "bg-indigo-50"
          }`}
        >
          <img src={sparkIcon} alt={ALT_TEXT.AIVA.LOGO} className="w-5 h-5" />
        </div>
      )}

      <div
        ref={bubbleRef}
        className="inline-flex flex-col max-w-[88%] md:max-w-[85%] relative z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping.current ? "none" : "transform 0.3s ease-out",
          touchAction: "pan-y", // Allow vertical scroll, enable horizontal swipe
        }}
      >
        <div
          className={`px-3.5 py-2.5 rounded-xl text-[14px] font-medium leading-relaxed shadow-sm break-words overflow-wrap-anywhere ${
            isUser
              ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none"
              : darkMode
                ? "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"
                : "bg-white text-gray-500 rounded-bl-none border border-gray-100"
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
                      : "text-gray-600"
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
            clickedActions={clickedActions}
            onSuggestionClick={onSuggestionClick}
            onActionClick={onActionClick}
            message={message}
          />
        </div>

        {/* Timestamp & Actions */}
        <div
          className={`flex items-center gap-1.5 mt-1.5 ${
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
