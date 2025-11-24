/**
 * Voice Controls Component
 * Voice send and dictate buttons with animations
 */

import React from "react";
import "../styles/VoiceControls.css";

interface VoiceButtonStyleProps {
  active: boolean;
  darkMode: boolean;
}

const getVoiceButtonStyle = ({
  active,
  darkMode,
}: VoiceButtonStyleProps): string => {
  const baseClasses = "voice-btn";
  let specificClass = "";

  if (active) {
    specificClass = "voice-btn-active";
  } else {
    specificClass = darkMode
      ? "voice-btn-inactive-dark"
      : "voice-btn-inactive-light";
  }

  return `${baseClasses} ${specificClass}`;
};

interface VoiceSendButtonProps {
  onClick: () => void;
  isActive: boolean;
  darkMode: boolean;
}

export const VoiceSendButton: React.FC<VoiceSendButtonProps> = ({
  onClick,
  isActive,
  darkMode,
}) => {
  const buttonClass = "hover:opacity-90";

  return (
    <button
      onClick={onClick}
      className={`${getVoiceButtonStyle({ active: isActive, darkMode })} ${buttonClass}`}
      aria-label={isActive ? "Stop voice input" : "Voice input and send"}
      title={isActive ? "Stop" : "Voice Send"}
    >
      {isActive && (
        <>
          <span className="voice-pulse" />
          <span className="voice-glow" />
        </>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="voice-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  );
};

interface DictateButtonProps {
  onClick: () => void;
  isActive: boolean;
  darkMode: boolean;
}

export const DictateButton: React.FC<DictateButtonProps> = ({
  onClick,
  isActive,
  darkMode,
}) => {
  const buttonClass = "hover:opacity-90";

  return (
    <button
      onClick={onClick}
      className={`${getVoiceButtonStyle({ active: isActive, darkMode })} ${buttonClass}`}
      aria-label={isActive ? "Stop dictation" : "Dictate message"}
      title={isActive ? "Stop dictation" : "Dictate"}
    >
      {isActive && (
        <>
          <span className="voice-pulse" />
          <span className="voice-glow" />
        </>
      )}
      {isActive ? (
        // Stop icon when dictation is active
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="voice-icon"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 6h12v12H6z" />
        </svg>
      ) : (
        // Pen icon when dictation is not active
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="voice-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 3.487l3.651 3.651-10.95 10.95a3 3 0 01-1.271.749l-4.106 1.23 1.23-4.106a3 3 0 01.749-1.271l10.95-10.95zM15 5l3.5 3.5"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h11" />
        </svg>
      )}
    </button>
  );
};
