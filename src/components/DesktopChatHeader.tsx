/**
 * Desktop Chat Header Component
 * Header with language selector and clear chat button
 * Matches mobile widget styling EXACTLY
 */

import React, { useState } from "react";
import {
  useLanguageSettings,
  filterLanguageOptions,
} from "../features/useLanguageSettings";
import { clearConversationStorage } from "../features/ClearChat";
import sparkIcon from "../assets/logo-robo-face.svg";

interface DesktopChatHeaderProps {
  onClearMessages?: () => void;
  darkMode?: boolean;
}

const DesktopChatHeader: React.FC<DesktopChatHeaderProps> = ({
  onClearMessages,
  darkMode = false,
}) => {
  const {
    speechLanguage,
    setSpeechLanguage,
    customLanguage,
    setCustomLanguage,
    isCustomSpeechLanguage,
  } = useLanguageSettings();

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [languageSearch, setLanguageSearch] = useState("");

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      clearConversationStorage();
      if (onClearMessages) {
        onClearMessages();
      }
    }
  };

  const handleLanguageSelect = (code: string) => {
    setSpeechLanguage(code);
    setShowLanguageMenu(false);
    setLanguageSearch("");
  };

  const handleCustomLanguageSubmit = () => {
    const trimmed = customLanguage.trim();
    if (trimmed && /^[a-z]{2}(-[A-Z]{2})?$/.test(trimmed)) {
      setSpeechLanguage(trimmed);
      setShowLanguageMenu(false);
      setLanguageSearch("");
    } else {
      alert(
        "Please enter a valid language code (e.g., en-US, fr-FR, or just en, fr)"
      );
    }
  };

  const filteredOptions = filterLanguageOptions(languageSearch);

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
    <div
      className={`p-3 border-b flex items-center justify-between ${
        darkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-2">
        <img src={sparkIcon} alt="AIVA" className="w-8 h-8" />
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
        <div className="relative">
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
            <div
              className={`absolute right-0 mt-2 w-72 rounded-lg shadow-2xl border z-50 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-3 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}">
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filteredOptions.map((option) => (
                  <button
                    key={option.code}
                    onClick={() => handleLanguageSelect(option.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      speechLanguage === option.code
                        ? darkMode
                          ? "bg-indigo-900 text-indigo-200"
                          : "bg-indigo-50 text-indigo-700"
                        : darkMode
                        ? "hover:bg-gray-700 text-gray-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {speechLanguage === option.code && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Language Input */}
              <div className={`p-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <label
                  className={`block text-xs font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Custom Language Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., en-US"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                  <button
                    onClick={handleCustomLanguageSubmit}
                    disabled={!customLanguage.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Set
                  </button>
                </div>
                {isCustomSpeechLanguage && (
                  <p className="text-xs text-indigo-500 mt-2">
                    Using custom: {speechLanguage}
                  </p>
                )}
              </div>
            </div>
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
  );
};

export default DesktopChatHeader;
