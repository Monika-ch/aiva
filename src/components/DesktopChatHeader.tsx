/**
 * Desktop Chat Header Component
 * Header with language selector and clear chat button
 * Matches mobile widget styling EXACTLY
 */

import React, { useState, useRef } from "react";
import { useLanguageSettings } from "../utils/useLanguageSettings";
import { clearConversationStorage } from "../utils/clearConversationStorage";
import { ConfirmDialog } from "./ConfirmDialog";
import { DIALOG_MESSAGES } from "../constants/dialogMessages";
import { LanguageDropdown } from "../utils/LanguageDropdown";
import sparkIcon from "../assets/logo-robo-face.svg";
import "../styles/DesktopChatHeader.css";

interface DesktopChatHeaderProps {
  onClearMessages?: () => void;
  darkMode?: boolean;
}

const DesktopChatHeader: React.FC<DesktopChatHeaderProps> = ({
  onClearMessages,
  darkMode = false,
}) => {
  const { speechLanguage, setSpeechLanguage } = useLanguageSettings();

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    clearConversationStorage();
    if (onClearMessages) {
      onClearMessages();
    }
    setShowClearConfirm(false);
  };

  const handleLanguageSelect = (code: string) => {
    setSpeechLanguage(code);
    setShowLanguageMenu(false);
    setLanguageSearch("");
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: darkMode ? "#374151" : "#e5e7eb",
    color: darkMode ? "#d1d5db" : "#6b7280",
    padding: "8px",
    borderRadius: "8px",
    transition: "all 0.2s ease",
    border: "none",
    outline: "none",
  };

  return (
    <>
      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title={DIALOG_MESSAGES.CLEAR_CHAT.title}
        message={DIALOG_MESSAGES.CLEAR_CHAT.message}
        confirmText={DIALOG_MESSAGES.CLEAR_CHAT.confirmText}
        cancelText={DIALOG_MESSAGES.CLEAR_CHAT.cancelText}
        onConfirm={confirmClearChat}
        onCancel={() => setShowClearConfirm(false)}
        darkMode={darkMode}
      />

      <div
        className={`p-3 border-b flex items-center justify-between ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <img
            src={sparkIcon}
            alt="AIVA"
            className="w-8 h-8 logo-animate cursor-pointer"
          />
          <div>
            <span
              className={`text-sm font-semibold ${
                darkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              AIVA Chat
            </span>
            <p
              className={`text-xs ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              AI-Powered Portfolio Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Language Button */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              style={buttonStyle}
              className="hover:opacity-80"
              aria-label="Language settings"
              title="Language settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "16px", height: "16px" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </button>

            {/* Language Dropdown Menu */}
            {showLanguageMenu && (
              <LanguageDropdown
                darkMode={darkMode}
                speechLanguage={speechLanguage}
                languageSearch={languageSearch}
                onLanguageSearchChange={setLanguageSearch}
                onLanguageSelect={handleLanguageSelect}
                onClose={() => setShowLanguageMenu(false)}
                containerRef={languageMenuRef}
              />
            )}
          </div>

          {/* Clear Chat Button */}
          <button
            onClick={handleClearChat}
            style={buttonStyle}
            className="hover:opacity-80"
            aria-label="Clear chat history"
            title="Clear chat"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "16px", height: "16px" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default DesktopChatHeader;
