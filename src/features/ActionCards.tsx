/**
 * Action Cards and Suggestions
 * Interactive quick action buttons and suggestion chips
 */

import React from "react";
import {
  QUICK_ACTIONS,
  QUICK_ACTIONS_MARKER,
} from "../constants/chatConstants";

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
    <div className={`w-full ${isMobile ? "" : "max-w-xl px-4 space-y-3"}`}>
      {!isMobile && (
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          ⚡ Quick actions:
        </p>
      )}
      <div className="grid grid-cols-2 gap-3.5">
        {QUICK_ACTIONS.map((action, idx) => {
          const isClicked = clickedActions.has(action.query);
          return (
            <button
              key={idx}
              onClick={() => onActionClick(action.query)}
              className={`group ${isMobile ? "p-3" : "p-4"} rounded-[14px] text-${isMobile ? "center" : "left"} transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                isClicked
                  ? darkMode
                    ? "bg-gradient-to-br from-indigo-900 to-indigo-800 border border-indigo-600 shadow-lg shadow-indigo-500/20"
                    : "bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-300 shadow-lg shadow-indigo-400/20"
                  : darkMode
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 hover:border-indigo-600 active:border-indigo-500"
                    : "bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white border border-gray-200 hover:border-indigo-400 active:border-indigo-500 shadow-md hover:shadow-lg"
              }`}
            >
              <div
                className={`flex ${isMobile ? "flex-col items-center gap-1.5" : "items-center gap-3"}`}
              >
                <div
                  className={`${isMobile ? "text-2xl" : "text-3xl"} transform transition-transform group-hover:scale-110 ${
                    darkMode ? "drop-shadow-lg" : ""
                  }`}
                >
                  {action.icon}
                </div>
                <span
                  className={`font-semibold ${isMobile ? "text-xs" : "text-sm"} ${
                    isClicked
                      ? darkMode
                        ? "text-indigo-200"
                        : "text-indigo-700"
                      : darkMode
                        ? "text-gray-200"
                        : isMobile
                          ? "text-gray-600"
                          : "text-gray-800"
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
      className={`
        px-3 py-2 rounded-[14px] text-left cursor-pointer font-medium text-[13px] 
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
              : "bg-gradient-to-br from-white to-gray-50 text-gray-600 border border-gray-200 shadow-sm"
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
}

export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  content,
  isAssistant,
  darkMode,
  clickedSuggestions,
  clickedActions = new Set(),
  onSuggestionClick,
  onActionClick,
}) => {
  // Render quick action cards if marker is present
  if (isAssistant && content.startsWith(QUICK_ACTIONS_MARKER)) {
    const description = content.substring(QUICK_ACTIONS_MARKER.length).trim();
    return (
      <div className="w-full">
        {!description && (
          <div
            className={`text-[14px] font-medium leading-relaxed mb-2 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            A few quick actions you can tap:
          </div>
        )}
        {description && (
          <div className="text-[14px] font-medium leading-relaxed mb-2">
            {description}
          </div>
        )}
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
              style={{ whiteSpace: "pre-wrap" }}
              className={`text-[14px] font-medium mb-3 ${
                darkMode ? "text-gray-400" : "text-gray-600"
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
  return <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>;
};
