/**
 * Clear Chat Feature
 * Handles clearing chat history with confirmation
 */

import React from "react";
import { TrashIcon } from "../constants/icons";
import "../styles/ClearChat.css";

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
      className={`p-2 rounded-lg transition-colors hover:bg-opacity-80 ${
        darkMode ? "clear-chat-btn-dark" : "clear-chat-btn-light"
      }`}
      aria-label="Clear chat history"
      title="Clear chat"
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
};
