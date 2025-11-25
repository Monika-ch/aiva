/**
 * Reply Preview Component
 * Shows a preview of the message being replied to (WhatsApp-style)
 */

import React from "react";
import { CloseIcon } from "../constants/icons";

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
      className={`flex items-center gap-2 px-3 py-2.5 border-l-4 ${
        replyToRole === "assistant"
          ? darkMode
            ? "border-gray-500"
            : "border-gray-400"
          : darkMode
            ? "border-gray-500"
            : "border-gray-400"
      } ${
        darkMode ? "bg-gray-800/60 text-gray-200" : "bg-gray-50 text-gray-800"
      } rounded-lg mb-2`}
    >
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-semibold ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {replyToRole === "assistant" ? "AIVA" : "You"}
        </p>
        <p
          className={`text-sm truncate ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {truncatedContent}
        </p>
      </div>
      <button
        onClick={onClear}
        className={`hover:opacity-80 chat-header-btn ${
          darkMode
            ? "chat-header-btn-dark-transparent"
            : "chat-header-btn-light-transparent"
        }`}
        aria-label="Clear reply"
        title="Clear reply"
      >
        <CloseIcon className="chat-header-btn-icon" />
      </button>
    </div>
  );
};
