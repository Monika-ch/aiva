/**
 * Reusable Welcome Message Component
 * Shows greeting header and description text
 * Used in both mobile widget and desktop chat empty states
 */

import React from "react";
import { PLACEHOLDERS } from "../constants/accessibilityLabels";

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
      className={`text-center space-y-${isMobile ? "1.5" : "3"} ${isMobile ? "mb-5" : "max-w-xl px-4"}`}
    >
      <h2
        className={`font-semibold ${isMobile ? "text-base" : "text-2xl"} ${
          darkMode ? "text-gray-100" : "text-gray-800"
        }`}
      >
        {PLACEHOLDERS.CHAT.ASK_AIVA}
      </h2>
      <p
        className={`leading-relaxed ${isMobile ? "text-[12px]" : "text-sm"} ${
          darkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        I'm your AI-Powered Portfolio Assistant. I can help you explore
        projects, discuss technical skills, and answer questions about
        experience.
      </p>
    </div>
  );
};
