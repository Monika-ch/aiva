/**
 * Clear Chat Feature
 * Handles clearing chat history with confirmation
 */

import React from "react";
import { TrashIcon } from "../constants/icons";
import { ARIA_LABELS, TITLES } from "../constants/accessibilityLabels";
import { DIALOG_MESSAGES } from "../constants/dialogMessages";
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
    const confirmMessage = DIALOG_MESSAGES.CLEAR_CHAT.message;
    if (window.confirm(confirmMessage)) {
      onClear();
    }
  };

  return (
    <button
      onClick={handleClearChat}
      className={`p-2 rounded-lg transition-colors hover:bg-opacity-80 ${
        darkMode ? "clear-chat-btn-dark" : "clear-chat-btn-light"
      }`}
      aria-label={ARIA_LABELS.CLEAR_CHAT.BUTTON}
      title={TITLES.CLEAR_CHAT.BUTTON}
    >
      <TrashIcon className="w-5 h-5" />
    </button>
  );
};
