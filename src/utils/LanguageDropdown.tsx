/**
 * Reusable Language Dropdown Component
 * Used in both Desktop and Mobile chat interfaces
 */

import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { filterLanguageOptions } from "../utils/useLanguageSettings";
import "../styles/LanguageDropdown.css";

interface LanguageDropdownProps {
  darkMode: boolean;
  speechLanguage: string;
  languageSearch: string;
  onLanguageSearchChange: (search: string) => void;
  onLanguageSelect: (code: string) => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  usePortal?: boolean;
  onClose?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  darkMode,
  speechLanguage,
  languageSearch,
  onLanguageSearchChange,
  onLanguageSelect,
  buttonRef,
  usePortal = false,
  onClose,
  containerRef,
}) => {
  const filteredOptions = filterLanguageOptions(languageSearch);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideContainer =
        containerRef?.current && !containerRef.current.contains(target);

      if (clickedOutsideDropdown && clickedOutsideContainer) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, containerRef]);

  useEffect(() => {
    if (usePortal && buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [usePortal, buttonRef]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`rounded-lg shadow-2xl border lang-dropdown-z ${
        darkMode ? "lang-dropdown-dark" : "lang-dropdown-light"
      } ${usePortal ? "lang-dropdown-portal-pos" : "lang-dropdown-inline-pos"}`}
      style={
        usePortal
          ? {
              top: `${position.top}px`,
              right: `${position.right}px`,
            }
          : undefined
      }
    >
      <div
        className={`p-2.5 border-b ${
          darkMode ? "lang-dropdown-dark" : "lang-dropdown-light"
        }`}
      >
        <input
          type="text"
          placeholder="Search..."
          value={languageSearch}
          onChange={(e) => onLanguageSearchChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 rounded-md border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
            darkMode ? "lang-search-input-dark" : "lang-search-input-light"
          }`}
        />
      </div>

      <div
        className={`overflow-y-auto lang-options-scrollbar ${
          darkMode
            ? "lang-options-scrollbar-dark dark-scrollbar"
            : "lang-options-scrollbar-light light-scrollbar"
        } ${
          usePortal
            ? "lang-options-maxheight-portal"
            : "lang-options-maxheight-inline"
        }`}
      >
        {filteredOptions.map((option) => (
          <button
            key={option.code}
            onClick={() => onLanguageSelect(option.code)}
            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
              speechLanguage === option.code
                ? darkMode
                  ? "lang-option-selected-dark"
                  : "lang-option-selected-light"
                : darkMode
                  ? "lang-option-unselected lang-option-unselected-dark"
                  : "lang-option-unselected lang-option-unselected-light"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex-1 min-w-0">{option.label}</span>
              {speechLanguage === option.code && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (usePortal) {
    return createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
};
