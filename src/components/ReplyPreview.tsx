/**
 * Reply Preview Component
 * Shows a preview of the message being replied to (WhatsApp-style)
 */

import React from "react";

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
        className={`p-1 rounded-full transition-colors ${
          darkMode
            ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200"
            : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
        }`}
        aria-label="Clear reply"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};
