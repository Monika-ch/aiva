/**
 * Dark Mode Hook
 * Manages dark mode state with localStorage persistence
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "aiva-dark-mode";

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return { darkMode, setDarkMode, toggleDarkMode };
};

/**
 * Get theme-specific CSS classes
 */
export const getThemeClasses = (darkMode: boolean) => ({
  bg: darkMode ? "bg-gray-900" : "bg-white",
  text: darkMode ? "text-gray-100" : "text-gray-800",
  border: darkMode ? "border-gray-700" : "border-gray-200",
  inputBg: darkMode ? "bg-gray-800" : "bg-gray-50",
  headerBg: darkMode
    ? "bg-gradient-to-r from-gray-800 to-gray-900"
    : "bg-gradient-to-r from-indigo-50 to-purple-50",
});
