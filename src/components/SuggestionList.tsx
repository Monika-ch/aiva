/**
 * Reusable Suggestion List Component
 * Shows intro suggestions with clickable chips
 * Used in both mobile widget and desktop chat empty states
 */

import React from "react";
import { INTRO_SUGGESTIONS, UI_TEXT } from "../constants/chatConstants";
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
        isMobile ? "space-y-3 mt-4 mb-6" : "space-y-3 max-w-xl px-4"
      }`}
    >
      <p
        className={`font-bold uppercase tracking-[0.15em] ${
          isMobile ? "text-[11px] text-center" : "text-[11px]"
        } ${
          darkMode
            ? isMobile
              ? "text-indigo-300/90"
              : "text-gray-500"
            : "text-gray-500"
        }`}
      >
        <span className="opacity-90">💡</span> {UI_TEXT.SUGGESTIONS_HEADER}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {INTRO_SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            disabled={clickedSuggestions.has(suggestion)}
            className={`suggestion-chip ${chipVariantClass} font-semibold transition-all duration-200 border backdrop-blur-sm ${
              isMobile ? "text-xs" : "px-4 py-2.5 text-sm"
            } ${
              clickedSuggestions.has(suggestion)
                ? darkMode
                  ? "bg-gradient-to-br from-[#1a2744] to-[#0f1a2e] text-gray-500 cursor-not-allowed border-indigo-500/20 opacity-60"
                  : "bg-gradient-to-br from-indigo-50 to-gray-100 text-gray-500 cursor-not-allowed border-indigo-200/50 opacity-60"
                : darkMode
                  ? isMobile
                    ? "bg-gradient-to-br from-[#1a2540] to-[#0f1828] text-gray-100 hover:from-[#1f2d48] hover:to-[#141f30] border-indigo-500/40 hover:border-indigo-400/60 shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-indigo-900/30 active:scale-95"
                    : "bg-gradient-to-br from-[#151d30] to-[#0c1322] text-gray-200 hover:from-[#1a2540] hover:to-[#101828] border-[#2a3a55]/60 hover:border-indigo-400/40 shadow-md shadow-black/20 hover:shadow-lg hover:shadow-indigo-500/10"
                  : "bg-gradient-to-br from-white to-gray-50 text-gray-700 hover:from-white hover:to-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
            }`}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
