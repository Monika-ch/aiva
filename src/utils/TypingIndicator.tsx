/**
 * Typing Indicator Component
 * Shows animated dots when assistant is typing
 */

import React from "react";
import sparkIcon from "../assets/logo-robo-face.svg";
import { ALT_TEXT } from "../constants/accessibilityLabels";
import "../styles/TypingIndicator.css";

interface TypingIndicatorProps {
  darkMode: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  darkMode,
}) => {
  return (
    <div className="flex items-end justify-start mb-4">
      <div
        className={`w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
          darkMode ? "bg-indigo-900" : "bg-indigo-50"
        }`}
      >
        <img src={sparkIcon} alt={ALT_TEXT.AIVA.LOGO} className="w-3 h-3" />
      </div>
      <div
        className={`px-4 py-2 rounded-2xl rounded-bl-none shadow-sm ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex gap-1">
          <div
            className={`w-2 h-2 rounded-full animate-bounce typing-dot-1 ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce typing-dot-2 ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce typing-dot-3 ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};
