/**
 * Reusable Quick Actions Section Component
 * Shows "Quick actions:" header with ActionCards
 * Used in both mobile widget and desktop chat empty states
 */

import React from "react";
import { ActionCards } from "../utils";

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
      className={`w-full ${isMobile ? "space-y-2.5 mt-3 mb-5" : "max-w-xl px-4 space-y-3"}`}
    >
      <p
        className={`font-semibold uppercase tracking-wider ${
          isMobile ? "text-[11px] text-center" : "text-xs"
        } ${darkMode ? "text-gray-300" : "text-gray-500"}`}
      >
        ⚡ Quick actions:
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
