/**
 * Clear Chat Feature
 * Handles clearing chat history with confirmation
 */

import React from "react";

interface ClearChatButtonProps {
  onClear: () => void;
  darkMode: boolean;
}

export const ClearChatButton: React.FC<ClearChatButtonProps> = ({
  onClear,
  darkMode,
}) => {
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      onClear();
    }
  };

  return (
    <button
      onClick={handleClearChat}
      className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
      style={{
        color: darkMode ? "#9ca3af" : "#6b7280",
      }}
      aria-label="Clear chat history"
      title="Clear chat"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
};
