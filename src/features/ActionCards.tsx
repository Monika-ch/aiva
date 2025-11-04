/**
 * Action Cards and Suggestions
 * Interactive quick action buttons and suggestion chips
 */

import React from "react";
import {
  QUICK_ACTIONS,
  QUICK_ACTIONS_MARKER,
} from "../constants/chatConstants";

interface QuickActionsProps {
  onActionClick: (query: string) => void;
  darkMode: boolean;
}

export const QuickActionCards: React.FC<QuickActionsProps> = ({
  onActionClick,
  darkMode,
}) => {
  return (
    <div className='grid grid-cols-2 gap-2 mt-2' style={{ maxWidth: "260px" }}>
      {QUICK_ACTIONS.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.query)}
          className='p-3 rounded-lg transition-transform duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 focus:outline-none cursor-pointer'
          style={{
            backgroundColor: darkMode ? "#1f2937" : "#eef2ff",
            border: `1px solid ${darkMode ? "#4338ca" : "#c7d2fe"}`,
            color: darkMode ? "#e0e7ff" : "#6366f1",
            fontWeight: 600,
            boxShadow: darkMode
              ? "0 8px 18px rgba(76, 106, 255, 0.18)"
              : "0 10px 18px rgba(79, 70, 229, 0.14)",
          }}
        >
          <div className='text-2xl mb-1'>{action.icon}</div>
          <div className='text-xs tracking-wide'>{action.label}</div>
        </button>
      ))}
    </div>
  );
};

interface SuggestionChipProps {
  suggestion: string;
  onClick: () => void;
  isClicked: boolean;
  isFirstSuggestion: boolean;
  darkMode: boolean;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  suggestion,
  onClick,
  isClicked,
  isFirstSuggestion,
  darkMode,
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: isClicked
          ? darkMode
            ? "#1e293b"
            : "#dbeafe"
          : darkMode
          ? "#1e293b"
          : "#f1f5f9",
        color: isClicked
          ? darkMode
            ? "#38bdf8"
            : "#0369a1"
          : darkMode
          ? "#cbd5e1"
          : "#334155",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: darkMode ? "#334155" : "#cbd5e1",
        padding: "6px 10px",
        marginBottom: "8px",
        marginTop: isFirstSuggestion ? "12px" : "0",
        borderRadius: "10px",
        transition: "all 0.2s ease",
        display: "inline-block",
        textAlign: "left",
        cursor: "pointer",
        fontWeight: isClicked ? "500" : "400",
        border: "none",
        outline: "none",
        whiteSpace: "pre-wrap",
      }}
      className='hover:opacity-80'
    >
      • {suggestion}
    </button>
  );
};

interface MessageContentRendererProps {
  content: string;
  isAssistant: boolean;
  darkMode: boolean;
  clickedSuggestions: Set<string>;
  onSuggestionClick: (suggestion: string) => void;
  onActionClick: (query: string) => void;
}

export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  content,
  isAssistant,
  darkMode,
  clickedSuggestions,
  onSuggestionClick,
  onActionClick,
}) => {
  // Render quick action cards if marker is present
  if (isAssistant && content.startsWith(QUICK_ACTIONS_MARKER)) {
    const description = content.substring(QUICK_ACTIONS_MARKER.length).trim();
    return (
      <div style={{ whiteSpace: "pre-wrap" }}>
        {description && (
          <div className='mb-3 text-sm leading-relaxed'>{description}</div>
        )}
        <QuickActionCards onActionClick={onActionClick} darkMode={darkMode} />
      </div>
    );
  }

  // Render suggestions if present
  if (isAssistant && content.includes("• ")) {
    const lines = content.split("\n");
    let firstSuggestionFound = false;

    return (
      <>
        {lines.map((line, i) => {
          if (line.startsWith("• ")) {
            const suggestion = line.substring(2).trim();
            const isClicked = clickedSuggestions.has(suggestion);
            const isFirstSuggestion = !firstSuggestionFound;
            if (isFirstSuggestion) firstSuggestionFound = true;

            return (
              <SuggestionChip
                key={i}
                suggestion={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                isClicked={isClicked}
                isFirstSuggestion={isFirstSuggestion}
                darkMode={darkMode}
              />
            );
          }
          return (
            <div key={i} style={{ whiteSpace: "pre-wrap" }}>
              {line}
            </div>
          );
        })}
      </>
    );
  }

  // Plain text rendering
  return <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>;
};
