/**
 * UI Utility Components
 * Reusable buttons and controls for chat interface
 */

import React from "react";
import "../styles/UIControls.css";
import {
  VolumeIcon,
  CheckIcon,
  CopyIcon,
  ReplyIcon,
  ThumbUpIcon,
  ThumbDownIcon,
  CloseIcon,
  SendIcon,
} from "../constants/icons";

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
      <VolumeIcon className="control-icon" />
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
        <CheckIcon className="control-icon" />
      ) : (
        <CopyIcon className="control-icon" />
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
      <ReplyIcon className="control-icon" />
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
        <ThumbUpIcon
          className="control-icon"
          fill={currentReaction === "helpful" ? "currentColor" : "none"}
        />
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
        <ThumbDownIcon
          className="control-icon"
          fill={currentReaction === "not-helpful" ? "currentColor" : "none"}
        />
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
      <CloseIcon className="w-5 h-5" />
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
      <SendIcon className={sizeClass} />
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
