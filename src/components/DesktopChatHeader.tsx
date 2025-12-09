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
import { LanguageIcon, TrashIcon } from "../constants/icons";
import {
  ARIA_LABELS,
  TITLES,
  ALT_TEXT,
} from "../constants/accessibilityLabels";
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
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-r from-white via-[#faf8ff] to-[#f5f0ff] border-indigo-100/50"
        }`}
      >
        <div className="flex items-center gap-2">
          <img
            src={sparkIcon}
            alt={ALT_TEXT.AIVA.LOGO}
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
              className={`hover:opacity-80 desktop-header-btn ${
                darkMode
                  ? "desktop-header-btn-dark"
                  : "desktop-header-btn-light"
              }`}
              aria-label={ARIA_LABELS.LANGUAGE.SETTINGS}
              title={TITLES.LANGUAGE.SETTINGS}
            >
              <LanguageIcon className="desktop-header-btn-icon" />
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
            className={`hover:opacity-80 desktop-header-btn ${
              darkMode ? "desktop-header-btn-dark" : "desktop-header-btn-light"
            }`}
            aria-label={ARIA_LABELS.CLEAR_CHAT.BUTTON}
            title={TITLES.CLEAR_CHAT.BUTTON}
          >
            <TrashIcon className="desktop-header-btn-icon" />
          </button>
        </div>
      </div>
    </>
  );
};

export default DesktopChatHeader;
