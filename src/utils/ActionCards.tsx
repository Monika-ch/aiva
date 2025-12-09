/**
 * Action Cards and Suggestions
 * Interactive quick action buttons and suggestion chips
 */

import React from "react";
import { QUICK_ACTIONS } from "../constants/chatConstants";
import type { Message } from "../types/Message";
import "../styles/ActionCards.css";

interface ActionCardsProps {
  onActionClick: (query: string) => void;
  darkMode: boolean;
  isMobile?: boolean;
  clickedActions?: Set<string>;
}

/**
 * Unified Action Cards Component
 * Used for both desktop and mobile with responsive styling
 */
export const ActionCards: React.FC<ActionCardsProps> = ({
  onActionClick,
  darkMode,
  isMobile = false,
  clickedActions = new Set(),
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3.5">
        {QUICK_ACTIONS.map((action, idx) => {
          const isClicked = clickedActions.has(action.query);
          return (
            <button
              key={idx}
              onClick={() => onActionClick(action.query)}
              className={`group action-card-surface ${
                isMobile ? "p-4" : "p-4"
              } rounded-2xl text-center transition-all duration-300 border backdrop-blur-sm active:scale-95 ${
                isClicked
                  ? darkMode
                    ? "bg-gradient-to-br from-[#1a2744] to-[#0f1a2e] border-indigo-500/30 shadow-lg shadow-indigo-500/10 opacity-70"
                    : "bg-gradient-to-br from-indigo-50 to-white border-indigo-200 shadow-lg shadow-indigo-200/30 opacity-70"
                  : darkMode
                    ? isMobile
                      ? "bg-gradient-to-br from-[#1a2642] to-[#0f1628] hover:from-[#1f2b4a] hover:to-[#131a30] border-indigo-400/40 hover:border-indigo-300/60 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-indigo-500/20"
                      : "bg-gradient-to-br from-[#151d30] to-[#0c1322] hover:from-[#1a2540] hover:to-[#101828] border-[#2a3a55]/60 hover:border-indigo-500/40"
                    : "bg-gradient-to-br from-white to-gray-50/80 hover:from-white hover:to-white border-gray-200/80 hover:border-gray-300"
              } ${darkMode ? "action-card-dark" : "action-card-light"}`}
            >
              <div className="flex flex-col items-center gap-2.5">
                <div
                  className={`text-4xl transform transition-transform group-hover:scale-110 group-active:scale-105 ${
                    darkMode ? "drop-shadow-xl" : ""
                  }`}
                >
                  {action.icon}
                </div>
                <span
                  className={`font-bold ${isMobile ? "text-xs" : "text-sm"} ${
                    isClicked
                      ? darkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      : darkMode
                        ? "text-white"
                        : "text-gray-700"
                  }`}
                >
                  {action.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Legacy export for backwards compatibility - to be removed
export const QuickActionCards = ActionCards;

interface SuggestionChipProps {
  suggestion: string;
  onClick: () => void;
  isClicked: boolean;
  isFirstSuggestion: boolean;
  isLastSuggestion?: boolean;
  darkMode: boolean;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({
  suggestion,
  onClick,
  isClicked,
  isLastSuggestion = false,
  darkMode,
}) => {
  return (
    <button
      onClick={onClick}
      className={`suggestion-chip
        px-3 py-2 rounded-[14px] text-left cursor-pointer
        inline-block whitespace-pre-wrap transition-all duration-200
        hover:opacity-90 hover:shadow-md active:scale-[0.98] active:opacity-80
        focus:outline-none focus-visible:outline-none
        ${isLastSuggestion ? "mb-0" : "mb-2"}
        ${
          isClicked
            ? darkMode
              ? "bg-gradient-to-br from-indigo-900 to-indigo-800 text-indigo-200 border-0 shadow-lg shadow-indigo-500/20"
              : "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700 border-0 shadow-lg shadow-indigo-400/20"
            : darkMode
              ? "bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 border border-gray-700 shadow-sm"
              : "bg-gradient-to-br from-white to-gray-50 text-gray-500 border border-gray-200 shadow-sm"
        }
      `}
      onMouseEnter={(e) => {
        if (!isClicked) {
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
    </button>
  );
};

interface MessageContentRendererProps {
  content: string;
  isAssistant: boolean;
  darkMode: boolean;
  clickedSuggestions: Set<string>;
  clickedActions?: Set<string>;
  onSuggestionClick: (suggestion: string) => void;
  onActionClick: (query: string) => void;
  message?: Message;
}

export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  content,
  isAssistant,
  darkMode,
  clickedSuggestions,
  clickedActions = new Set(),
  onSuggestionClick,
  onActionClick,
  message,
}) => {
  // Render quick action cards if message type is quick-actions
  if (isAssistant && message?.type === "quick-actions") {
    return (
      <div className="w-full">
        <div
          className={`text-[14px] font-medium leading-relaxed mb-3 ${
            darkMode ? "text-gray-200" : "text-gray-500"
          }`}
        >
          {content}
        </div>
        <ActionCards
          onActionClick={onActionClick}
          darkMode={darkMode}
          isMobile
          clickedActions={clickedActions}
        />
      </div>
    );
  }

  // Render suggestions if present
  if (isAssistant && content.includes("• ")) {
    const lines = content.split("\n");
    let firstSuggestionFound = false;

    // Find the last suggestion index
    const suggestionIndices = lines
      .map((line, i) => (line.startsWith("• ") ? i : -1))
      .filter((i) => i !== -1);
    const lastSuggestionIndex = suggestionIndices[suggestionIndices.length - 1];

    return (
      <div className="space-y-2">
        {lines.map((line, i) => {
          if (line.startsWith("• ")) {
            const suggestion = line.substring(2).trim();
            const isClicked = clickedSuggestions.has(suggestion);
            const isFirstSuggestion = !firstSuggestionFound;
            const isLastSuggestion = i === lastSuggestionIndex;
            if (isFirstSuggestion) firstSuggestionFound = true;

            return (
              <SuggestionChip
                key={i}
                suggestion={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                isClicked={isClicked}
                isFirstSuggestion={isFirstSuggestion}
                isLastSuggestion={isLastSuggestion}
                darkMode={darkMode}
              />
            );
          }
          return (
            <div
              key={i}
              className={`message-content-prewrap text-[14px] font-medium mb-3 ${
                darkMode ? "text-gray-200" : "text-gray-500"
              }`}
            >
              {line}
            </div>
          );
        })}
      </div>
    );
  }

  // Plain text rendering
  return <div className="message-content-prewrap">{content}</div>;
};
