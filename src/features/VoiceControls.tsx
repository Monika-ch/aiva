/**
 * Voice Controls Component
 * Voice send and dictate buttons with animations
 */

import React from "react";

interface VoiceButtonStyleProps {
  active: boolean;
  darkMode: boolean;
}

const getVoiceButtonStyle = ({ active, darkMode }: VoiceButtonStyleProps): React.CSSProperties => ({
  backgroundColor: active ? "#ef4444" : darkMode ? "#374151" : "#f3f4f6",
  color: active ? "#ffffff" : darkMode ? "#d1d5db" : "#6b7280",
  padding: "10px",
  borderRadius: "8px",
  position: "relative",
  flexShrink: 0,
  transition: "all 0.3s ease",
  boxShadow: active
    ? "0 10px 15px -3px rgba(239, 68, 68, 0.5), 0 4px 6px -2px rgba(239, 68, 68, 0.25)"
    : "none",
  border: "none",
  outline: "none",
});

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
  return (
    <button
      onClick={onClick}
      style={getVoiceButtonStyle({ active: isActive, darkMode })}
      className="hover:opacity-90"
      aria-label={isActive ? "Stop voice input" : "Voice input and send"}
      title={isActive ? "Stop" : "Voice Send"}
    >
      {isActive && (
        <>
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "8px",
              backgroundColor: "#f87171",
              animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
              opacity: 0.4,
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: "-2px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.3)",
              filter: "blur(4px)",
            }}
          />
        </>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: "16px",
          height: "16px",
          position: "relative",
          zIndex: 10,
        }}
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
  return (
    <button
      onClick={onClick}
      style={getVoiceButtonStyle({ active: isActive, darkMode })}
      className="hover:opacity-90"
      aria-label={isActive ? "Stop dictation" : "Dictate message"}
      title={isActive ? "Stop dictation" : "Dictate"}
    >
      {isActive && (
        <>
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "8px",
              backgroundColor: "#f87171",
              animation: "ping 1s cubic-bezier(0, 0, 0.2, 1) infinite",
              opacity: 0.4,
            }}
          />
          <span
            style={{
              position: "absolute",
              inset: "-2px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.3)",
              filter: "blur(4px)",
            }}
          />
        </>
      )}
      {isActive ? (
        // Stop icon when dictation is active
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: "16px",
            height: "16px",
            position: "relative",
            zIndex: 10,
          }}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 6h12v12H6z" />
        </svg>
      ) : (
        // Pen icon when dictation is not active
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: "16px",
            height: "16px",
            position: "relative",
            zIndex: 10,
          }}
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
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 21h11"
          />
        </svg>
      )}
    </button>
  );
};
