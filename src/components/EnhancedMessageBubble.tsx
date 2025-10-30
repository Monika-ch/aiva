import React from "react";
import { motion } from "framer-motion";

interface EnhancedMessageBubbleProps {
  sender: "user" | "assistant";
  message: string;
  timestamp?: number;
  reaction?: "helpful" | "not-helpful" | null;
  onReaction?: (reaction: "helpful" | "not-helpful") => void;
  onCopy?: () => void;
  onReadAloud?: () => void;
  isSpeaking?: boolean;
  darkMode?: boolean;
  showActions?: boolean; // Control whether to show action buttons
}

const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  sender,
  message,
  timestamp,
  reaction,
  onReaction,
  onCopy,
  onReadAloud,
  isSpeaking = false,
  darkMode = false,
  showActions = true,
}) => {
  const isUser = sender === "user";

  // Format timestamp
  const formatTime = (ts?: number) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Theme classes
  const bubbleClass = isUser
    ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-none"
    : darkMode
    ? "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
    : "bg-gray-50 text-gray-900 rounded-bl-none border border-gray-200";

  const timeClass = isUser
    ? "text-gray-300"
    : darkMode
    ? "text-gray-500"
    : "text-gray-400";

  const actionButtonClass = darkMode
    ? "text-gray-200 hover:text-white hover:bg-gray-800"
    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 group`}
    >
      <div className='flex flex-col max-w-[85%] md:max-w-[75%]'>
        {/* Message bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${bubbleClass}`}
        >
          {message}
        </div>

        {/* Timestamp and Actions in Single Line */}
        {(timestamp || showActions) && !isUser && (
          <div className='flex items-center gap-1 mt-1 px-1'>
            {/* Timestamp */}
            {timestamp && (
              <span className={`text-[10px] ${timeClass} whitespace-nowrap`}>
                {formatTime(timestamp)}
              </span>
            )}

            {/* Action Buttons */}
            {showActions && (
              <>
                {/* Copy Button */}
                {onCopy && (
                  <button
                    onClick={onCopy}
                    className={`p-1 rounded transition-all relative ${actionButtonClass}`}
                    aria-label='Copy message'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-3 h-3'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                      />
                    </svg>
                  </button>
                )}

                {/* Read Aloud Button */}
                {onReadAloud && (
                  <button
                    onClick={onReadAloud}
                    className={`p-1 rounded transition-all relative ${
                      isSpeaking
                        ? darkMode
                          ? "text-indigo-300 bg-indigo-950/50"
                          : "text-indigo-500"
                        : actionButtonClass
                    }`}
                    aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-3 h-3'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                      />
                    </svg>
                  </button>
                )}

                {/* Reaction Buttons */}
                {onReaction && (
                  <>
                    <button
                      onClick={() => onReaction("helpful")}
                      className={`p-1 rounded transition-all ${
                        reaction === "helpful"
                          ? darkMode
                            ? "text-green-300 bg-green-950/50"
                            : "text-green-500"
                          : actionButtonClass
                      }`}
                      aria-label='Mark as helpful'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-3 h-3'
                        fill={reaction === "helpful" ? "currentColor" : "none"}
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => onReaction("not-helpful")}
                      className={`p-1 rounded transition-all ${
                        reaction === "not-helpful"
                          ? darkMode
                            ? "text-red-300 bg-red-950/50"
                            : "text-red-500"
                          : actionButtonClass
                      }`}
                      aria-label='Mark as not helpful'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-3 h-3'
                        fill={
                          reaction === "not-helpful" ? "currentColor" : "none"
                        }
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5'
                        />
                      </svg>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* User message timestamp (right aligned) */}
        {timestamp && isUser && (
          <div className='flex justify-end mt-1 px-1'>
            <span className={`text-[10px] ${timeClass} whitespace-nowrap`}>
              {formatTime(timestamp)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedMessageBubble;
