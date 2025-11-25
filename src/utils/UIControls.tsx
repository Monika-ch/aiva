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
} from "../constants/icons";
import { UI_CONTROL_LABELS } from "../constants/uiControlLabels";

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
      title={
        isSpeaking
          ? UI_CONTROL_LABELS.READ_ALOUD.SPEAKING
          : UI_CONTROL_LABELS.READ_ALOUD.NOT_SPEAKING
      }
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
      title={
        copied
          ? UI_CONTROL_LABELS.COPY.COPIED
          : UI_CONTROL_LABELS.COPY.NOT_COPIED
      }
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
      title={UI_CONTROL_LABELS.REPLY.TITLE}
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
            ? `thumbs-up-active ${darkMode ? "thumbs-up-active-dark" : "thumbs-up-active-light"} btn-text-white`
            : darkMode
              ? "btn-inactive-dark"
              : "btn-inactive-light"
        } hover:opacity-80`}
        title={UI_CONTROL_LABELS.REACTIONS.HELPFUL}
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
            ? `thumbs-down-active ${darkMode ? "thumbs-down-active-dark" : "thumbs-down-active-light"} btn-text-white`
            : darkMode
              ? "btn-inactive-dark"
              : "btn-inactive-light"
        } hover:opacity-80`}
        title={UI_CONTROL_LABELS.REACTIONS.NOT_HELPFUL}
      >
        <ThumbDownIcon
          className="control-icon"
          fill={currentReaction === "not-helpful" ? "currentColor" : "none"}
        />
      </button>
    </>
  );
};
