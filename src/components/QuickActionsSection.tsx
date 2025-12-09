/**
 * Reusable Quick Actions Section Component
 * Shows "Quick actions:" header with ActionCards
 * Used in both mobile widget and desktop chat empty states
 */

import React from "react";
import { ActionCards } from "../utils";
import { UI_TEXT } from "../constants/chatConstants";

interface QuickActionsSectionProps {
  darkMode: boolean;
  clickedActions: Set<string>;
  onActionClick: (query: string) => void;
  variant?: "mobile" | "desktop";
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  darkMode,
  clickedActions,
  onActionClick,
  variant = "mobile",
}) => {
  const isMobile = variant === "mobile";

  return (
    <div
      className={`w-full ${isMobile ? "space-y-3 mt-4 mb-6" : "max-w-xl px-4 space-y-3"}`}
    >
      <p
        className={`font-bold uppercase tracking-[0.15em] ${
          isMobile ? "text-[11px] text-center" : "text-[11px]"
        } ${
          darkMode
            ? isMobile
              ? "text-yellow-300/90"
              : "text-gray-500"
            : "text-gray-500"
        }`}
      >
        <span className="opacity-80">⚡</span> {UI_TEXT.QUICK_ACTIONS_HEADER}
      </p>
      <ActionCards
        onActionClick={onActionClick}
        darkMode={darkMode}
        isMobile={isMobile}
        clickedActions={clickedActions}
      />
    </div>
  );
};
