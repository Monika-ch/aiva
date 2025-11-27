/**
 * Reusable Suggestion List Component
 * Shows intro suggestions with clickable chips
 * Used in both mobile widget and desktop chat empty states
 */

import React from "react";
import { INTRO_SUGGESTIONS } from "../constants/chatConstants";
import "../styles/ActionCards.css";

interface SuggestionListProps {
  darkMode: boolean;
  clickedSuggestions: Set<string>;
  onSuggestionClick: (suggestion: string) => void;
  variant?: "mobile" | "desktop";
}

export const SuggestionList: React.FC<SuggestionListProps> = ({
  darkMode,
  clickedSuggestions,
  onSuggestionClick,
  variant = "mobile",
}) => {
  const isMobile = variant === "mobile";
  const chipVariantClass = isMobile
    ? "suggestion-chip-mobile"
    : "suggestion-chip-desktop";

  return (
    <div
      className={`w-full ${
        isMobile ? "space-y-2.5 mt-3 mb-5" : "space-y-3 max-w-xl px-4"
      }`}
    >
      <p
        className={`font-semibold uppercase tracking-wider ${
          isMobile ? "text-[11px] text-center" : "text-xs"
        } ${darkMode ? "text-gray-300" : "text-gray-500"}`}
      >
        💡 Try asking about:
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {INTRO_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={clickedSuggestions.has(suggestion)}
            className={`suggestion-chip ${chipVariantClass} font-medium transition-all ${
              isMobile ? "text-[11px]" : "px-4 py-2.5 text-sm"
            } ${
              clickedSuggestions.has(suggestion)
                ? darkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : darkMode
                  ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 hover:from-gray-700 hover:to-gray-600 border border-gray-600 hover:border-gray-500"
                  : "bg-gradient-to-r from-white to-gray-50 text-gray-500 hover:from-gray-50 hover:to-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
