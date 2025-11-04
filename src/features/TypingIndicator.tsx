/**
 * Typing Indicator Component
 * Shows animated dots when assistant is typing
 */

import React from "react";
import sparkIcon from "../assets/logo-robo-face.svg";

interface TypingIndicatorProps {
  darkMode: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ darkMode }) => {
  return (
    <div className="flex items-end justify-start mb-4">
      <div
        className={`w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center rounded-full ${
          darkMode ? "bg-indigo-900" : "bg-indigo-50"
        }`}
      >
        <img src={sparkIcon} alt="AIVA" className="w-3 h-3" />
      </div>
      <div
        className={`px-4 py-2 rounded-2xl rounded-bl-none shadow-sm ${
          darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex gap-1">
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`w-2 h-2 rounded-full animate-bounce ${
              darkMode ? "bg-gray-400" : "bg-gray-400"
            }`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};
