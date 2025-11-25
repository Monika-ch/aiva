/**
 * UI Utility Components
 * Reusable buttons and controls for chat interface
 */

import React from "react";
import "../styles/UIControls.css";

interface ReadAloudButtonProps {
  onClick: () => void;
  isSpeaking: boolean;
  darkMode: boolean;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  onClick,
  isSpeaking,
  darkMode,
}) => {
  return (
    <button
      onClick={onClick}
      className={`control-btn ${
        isSpeaking
          ? `read-aloud-btn-speaking ${darkMode ? "read-aloud-btn-speaking-dark" : "read-aloud-btn-speaking-light"} btn-text-white`
          : darkMode
            ? "btn-inactive-dark"
            : "btn-inactive-light"
      } hover:opacity-80`}
      title={isSpeaking ? "Stop reading" : "Read aloud"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="control-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
        />
      </svg>
    </button>
  );
};

interface CopyButtonProps {
  onClick: () => void;
  darkMode: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  onClick,
  darkMode,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleClick = () => {
    onClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      className={`control-btn ${
        copied
          ? `copy-btn-copied ${darkMode ? "copy-btn-copied-dark" : "copy-btn-copied-light"} btn-text-white`
          : darkMode
            ? "btn-inactive-dark"
            : "btn-inactive-light"
      } hover:opacity-80`}
      title={copied ? "Copied!" : "Copy message"}
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="control-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="control-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
};

interface ReplyButtonProps {
  onClick: () => void;
  darkMode: boolean;
}

export const ReplyButton: React.FC<ReplyButtonProps> = ({
  onClick,
  darkMode,
}) => {
  return (
    <button
      onClick={onClick}
      className={`control-btn ${darkMode ? "btn-inactive-dark" : "btn-inactive-light"} hover:opacity-80`}
      title="Reply to message"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="control-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
        />
      </svg>
    </button>
  );
};

interface ReactionButtonsProps {
  onReaction: (reaction: "helpful" | "not-helpful") => void;
  currentReaction: "helpful" | "not-helpful" | null | undefined;
  darkMode: boolean;
}

export const ReactionButtons: React.FC<ReactionButtonsProps> = ({
  onReaction,
  currentReaction,
  darkMode,
}) => {
  const isHelpful = currentReaction === "helpful";
  const isNotHelpful = currentReaction === "not-helpful";

  return (
    <>
      <button
        onClick={() => onReaction("helpful")}
        className={`control-btn ${
          isHelpful
            ? `reaction-helpful-active ${darkMode ? "reaction-helpful-active-dark" : "reaction-helpful-active-light"} btn-text-white`
            : darkMode
              ? "btn-inactive-dark"
              : "btn-inactive-light"
        } hover:opacity-80`}
        title="Helpful"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="control-icon"
          fill={currentReaction === "helpful" ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
          />
        </svg>
      </button>
      <button
        onClick={() => onReaction("not-helpful")}
        className={`control-btn ${
          isNotHelpful
            ? `reaction-not-helpful-active ${darkMode ? "reaction-not-helpful-active-dark" : "reaction-not-helpful-active-light"} btn-text-white`
            : darkMode
              ? "btn-inactive-dark"
              : "btn-inactive-light"
        } hover:opacity-80`}
        title="Not helpful"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="control-icon"
          fill={currentReaction === "not-helpful" ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
          />
        </svg>
      </button>
    </>
  );
};

interface CloseButtonProps {
  onClick: () => void;
  darkMode: boolean;
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  darkMode,
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors hover:bg-opacity-80 ${darkMode ? "close-button-dark" : "close-button-light"}`}
      aria-label="Close chat"
      title="Close"
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
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  darkMode: boolean;
  size?: "small" | "large";
}

export const SendButton: React.FC<SendButtonProps> = ({
  onClick,
  disabled = false,
  darkMode,
  size = "small",
}) => {
  const sizeClass = size === "large" ? "w-6 h-6" : "w-5 h-5";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110"
      } ${disabled ? `control-btn ${darkMode ? "send-btn-disabled-dark" : "send-btn-disabled-light"}` : `control-btn ${darkMode ? "send-btn-dark" : "send-btn-light"}`} btn-text-white`}
      aria-label="Send message"
      title="Send"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClass}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    </button>
  );
};

interface CopyNotificationProps {
  show: boolean;
}

export const CopyNotification: React.FC<CopyNotificationProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="mb-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg">
      ✓ Copied to clipboard
    </div>
  );
};
