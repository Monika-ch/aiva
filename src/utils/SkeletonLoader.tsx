/**
 * Skeleton Loader Components
 * Loading states for action cards and suggestions
 */

import React from "react";
import "../styles/SkeletonLoader.css";

interface SkeletonActionCardsProps {
  darkMode: boolean;
  isMobile?: boolean;
}

export const SkeletonActionCards: React.FC<SkeletonActionCardsProps> = ({
  darkMode,
  isMobile = false,
}) => {
  return (
    <div className={`w-full ${isMobile ? "" : "max-w-2xl px-4 space-y-3"}`}>
      {!isMobile && (
        <div
          className={`h-3 w-32 rounded ${
            darkMode ? "bg-gray-600" : "bg-gray-200"
          } animate-pulse`}
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className={`${
              isMobile ? "p-3" : "p-4"
            } rounded-[14px] border animate-pulse ${
              darkMode
                ? "bg-gray-700 border-gray-600"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div
              className={`flex ${
                isMobile
                  ? "flex-col items-center gap-1.5"
                  : "items-center gap-3"
              }`}
            >
              {/* Icon skeleton */}
              <div
                className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} rounded-full ${
                  darkMode ? "bg-gray-600" : "bg-gray-300"
                } animate-pulse`}
              />
              {/* Text skeleton */}
              <div
                className={`h-3 ${isMobile ? "w-16" : "w-20"} rounded ${
                  darkMode ? "bg-gray-600" : "bg-gray-300"
                } animate-pulse`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SkeletonSuggestionsProps {
  darkMode: boolean;
  count?: number;
}

export const SkeletonSuggestions: React.FC<SkeletonSuggestionsProps> = ({
  darkMode,
  count = 3,
}) => {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className={`px-3 py-2 rounded-[14px] border animate-pulse ${
            darkMode
              ? "bg-gray-700 border-gray-600"
              : "bg-gray-50 border-gray-200"
          } ${idx === count - 1 ? "mb-0" : "mb-2"}`}
        >
          <div
            className={`h-3 rounded skeleton-random-width ${
              darkMode ? "bg-gray-600" : "bg-gray-300"
            }`}
            style={{
              ["--skeleton-width" as string]: `${60 + Math.random() * 40}%`,
            }}
          />
        </div>
      ))}
    </div>
  );
};

interface SkeletonMessageProps {
  darkMode: boolean;
  isUser?: boolean;
}

export const SkeletonMessage: React.FC<SkeletonMessageProps> = ({
  darkMode,
  isUser = false,
}) => {
  return (
    <div
      className={`flex items-end ${
        isUser ? "justify-end" : "justify-start"
      } group relative`}
    >
      {/* Assistant avatar skeleton */}
      {!isUser && (
        <div
          className={`w-8 h-8 mr-1.5 flex-shrink-0 self-start mt-1 rounded-full animate-pulse ${
            darkMode ? "bg-gray-600" : "bg-gray-200"
          }`}
        />
      )}

      <div className="flex flex-col max-w-[75%] sm:max-w-[80%] md:max-w-[85%]">
        <div
          className={`px-3 py-2 rounded-2xl shadow-sm animate-pulse ${
            isUser
              ? darkMode
                ? "bg-gray-600 rounded-br-none"
                : "bg-gray-200 rounded-br-none"
              : darkMode
                ? "bg-gray-700 rounded-bl-none border border-gray-600"
                : "bg-gray-50 rounded-bl-none border border-gray-200"
          }`}
        >
          {/* Skeleton lines */}
          <div className="space-y-2">
            <div
              className={`h-3 rounded skeleton-width-85 ${
                darkMode ? "bg-gray-500" : "bg-gray-300"
              }`}
            />
            <div
              className={`h-3 rounded skeleton-width-60 ${
                darkMode ? "bg-gray-500" : "bg-gray-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
