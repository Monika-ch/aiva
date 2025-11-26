/**
 * Reply Preview Component
 * Shows a preview of the message being replied to (WhatsApp-style)
 */

import React from "react";
import { CloseIcon } from "../constants/icons";
import {
  ARIA_LABELS,
  TITLES,
  ALT_TEXT,
} from "../constants/accessibilityLabels";
import sparkIcon from "../assets/logo-robo-face.svg";

interface ReplyPreviewProps {
  replyToContent: string;
  replyToRole: "user" | "assistant";
  darkMode: boolean;
  onClear: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  replyToContent,
  replyToRole,
  darkMode,
  onClear,
}) => {
  // Truncate long messages
  const truncatedContent =
    replyToContent.length > 100
      ? replyToContent.substring(0, 100) + "..."
      : replyToContent;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-1 rounded-full mb-2 border ${
        darkMode
          ? "bg-indigo-950/20 border-indigo-800/30 backdrop-blur-sm"
          : "bg-indigo-50/50 border-indigo-200/50"
      }`}
    >
      <div
        className={`w-1 h-10 rounded-full flex-shrink-0 ${
          replyToRole === "assistant"
            ? darkMode
              ? "bg-gradient-to-b from-indigo-500 to-purple-600"
              : "bg-gradient-to-b from-indigo-500 to-purple-600"
            : darkMode
              ? "bg-gradient-to-b from-blue-500 to-cyan-600"
              : "bg-gradient-to-b from-blue-500 to-cyan-600"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {replyToRole === "assistant" && (
            <img
              src={sparkIcon}
              alt={ALT_TEXT.AIVA.LOGO}
              className="w-3.5 h-3.5"
            />
          )}
          {replyToRole === "user" && <span className="text-xs">👤</span>}
          <p
            className={`text-xs font-semibold ${
              darkMode ? "text-indigo-300" : "text-indigo-700"
            }`}
          >
            {replyToRole === "assistant" ? "AIVA" : "You"}
          </p>
        </div>
        <p
          className={`text-[13px] truncate ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {truncatedContent}
        </p>
      </div>
      <button
        onClick={onClear}
        className={`hover:opacity-80 chat-header-btn transition-all ${
          darkMode
            ? "chat-header-btn-dark-transparent"
            : "chat-header-btn-light-transparent"
        }`}
        aria-label={ARIA_LABELS.REPLY.CLEAR}
        title={TITLES.REPLY.CLEAR}
      >
        <CloseIcon className="chat-header-btn-icon" />
      </button>
    </div>
  );
};
