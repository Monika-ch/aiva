import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";
// NOTE: Safety backup captured before major widget edits; not imported by the app.

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: Message[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  input: string;
  setInput: (s: string) => void;
  handleSend: (messageOverride?: string) => void;
  unreadCount?: number;
  latestAssistantMessage?: string | null;
}

const ChatWidgetUI: React.FC<Props> = ({
  messages,
  isOpen,
  setIsOpen,
  input,
  setInput,
  handleSend,
  unreadCount = 0,
  latestAssistantMessage = null,
}) => {
  // Track clicked suggestions
  const [clickedSuggestions, setClickedSuggestions] = React.useState<
    Set<string>
  >(new Set());

  // Helper to handle suggestion clicks - now sends immediately
  const handleSuggestionClick = (suggestion: string) => {
    // Mark as clicked
    setClickedSuggestions((prev) => new Set(prev).add(suggestion));

    // Set input and trigger send with the suggestion text directly
    setInput(suggestion);

    // We need to call handleSend after state updates, so we use the functional form
    // But since handleSend reads from input state, we need to ensure it's updated
    // React batches state updates, so we use a small delay
    requestAnimationFrame(() => {
      // Manually trigger the send with the suggestion
      if (suggestion.trim()) {
        // Instead of relying on the input state, we'll set it and immediately clear after
        handleSend();
      }
    });
  };

  // Helper to render message content with clickable suggestions
  const renderMessageContent = (content: string, isAssistant: boolean) => {
    if (!isAssistant || !content.includes("• ")) {
      return content;
    }

    // Split suggestions into lines
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("• ")) {
        // Make bullet points clickable
        const suggestion = line.substring(2).trim();
        const isClicked = clickedSuggestions.has(suggestion);

        return (
          <button
            key={i}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`block text-left px-1 py-0.5 -mx-1 rounded transition-colors mb-1.5 ${
              isClicked
                ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            • {suggestion}
          </button>
        );
      }
      return <div key={i}>{line}</div>;
    });
  };
  return (
    <div
      className='fixed bottom-6 right-6 z-50 flex flex-col items-end md:hidden'
      aria-live='polite'
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className='w-[320px] bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 mb-3'
            role='dialog'
            aria-label='AIVA chat'
          >
            {/* Header with logo */}
            <div className='p-3 border-b bg-white flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <img src={sparkIcon} alt='AIVA' className='w-8 h-8' />
                <div>
                  <span className='text-sm font-semibold text-gray-800'>
                    AIVA Chat
                  </span>
                  <p className='text-xs text-gray-500'>
                    AI Portfolio Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors'
                aria-label='Close chat'
              >
                ✕
              </button>
            </div>

            <div className='p-3 h-[320px] overflow-y-auto text-sm space-y-4 bg-gray-50'>
              {/* Live region for screen readers */}
              <div className='sr-only' aria-live='polite'>
                {latestAssistantMessage || ""}
              </div>

              {messages.length === 0 ? (
                <p className='text-gray-500 italic text-center'>
                  Start a conversation...
                </p>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-end ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "assistant" && (
                      <div className='w-6 h-6 mr-2 flex-shrink-0 self-start mt-1 flex items-center justify-center bg-indigo-50 rounded-full'>
                        <img src={sparkIcon} alt='AIVA' className='w-3 h-3' />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-2.5 py-1.5 rounded-2xl text-sm shadow-sm mb-1 ${
                        m.role === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {renderMessageContent(m.content, m.role === "assistant")}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className='p-3 border-t bg-white flex items-center gap-2'>
              <input
                type='text'
                placeholder='Ask AIVA...'
                className='flex-1 h-9 bg-gray-50 border-0 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                aria-label='Type your question to AIVA'
              />
              <button
                onClick={() => handleSend()}
                aria-label='Send message'
                className='inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white shadow-md hover:shadow-lg hover:scale-[1.02] transform transition-all focus:outline-none focus:ring-2 focus:ring-gray-400'
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='w-4 h-4'
                  viewBox='0 0 24 24'
                  fill='#06b5d460'
                  stroke='currentColor'
                >
                  <path
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M22 2L11 13'
                  />
                  <path
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M22 2l-7 20-4-9-9-4 20-7z'
                  />
                </svg>
                <span className='text-sm font-medium whitespace-nowrap'>
                  Send
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='relative'>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={
            unreadCount
              ? `Open chat, ${unreadCount} unread messages`
              : "Open chat"
          }
          aria-expanded={isOpen}
          className='relative !p-1.5 !rounded-full !bg-white/90 !border !border-gray-100 !m-0 !font-normal !text-base hover:!border-gray-100 transition-all'
          style={{
            all: "unset",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease",
          }}
        >
          <div className='relative' style={{ transform: "scale(1.15)" }}>
            <img
              src={sparkIcon}
              alt='AIVA'
              className='w-10 h-10 text-indigo-600'
              style={{
                filter: "drop-shadow(0 3px 2px rgba(0, 0, 0, 0.1))",
              }}
            />
          </div>
        </button>

        {/** show badge when widget closed and unreadCount > 0 */}
        {!isOpen && typeof unreadCount === "number" && unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-red-600 rounded-full'>
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatWidgetUI;
