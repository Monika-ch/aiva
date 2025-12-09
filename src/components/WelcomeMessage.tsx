/**
 * Reusable Welcome Message Component
 * Shows greeting header and description text
 * Used in both mobile widget and desktop chat empty states
 */

import React from "react";
import { PLACEHOLDERS } from "../constants/accessibilityLabels";
import { UI_TEXT } from "../constants/chatConstants";

interface WelcomeMessageProps {
  darkMode: boolean;
  variant?: "mobile" | "desktop";
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({
  darkMode,
  variant = "mobile",
}) => {
  const isMobile = variant === "mobile";

  return (
    <div
      className={`text-center ${isMobile ? "space-y-3 mb-6 mt-2" : "space-y-3 max-w-xl px-4"}`}
    >
      <h2
        className={`font-extrabold tracking-tight ${isMobile ? "text-xl" : "text-2xl"} ${
          darkMode
            ? isMobile
              ? "text-white drop-shadow-lg"
              : "bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
            : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
        }`}
      >
        {PLACEHOLDERS.CHAT.ASK_AIVA}
      </h2>
      <p
        className={`leading-relaxed ${isMobile ? "text-sm leading-[1.65] px-4" : "text-sm"} ${
          darkMode
            ? isMobile
              ? "text-gray-300"
              : "text-gray-400"
            : "text-gray-600"
        }`}
      >
        {UI_TEXT.WELCOME_DESCRIPTION}
      </p>
    </div>
  );
};
