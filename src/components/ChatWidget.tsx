import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  messages: Message[];
  onSend: (msg: string) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ messages, onSend }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-end'>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key='chat-popup'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.25 }}
            className='w-[320px] bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 mb-3'
          >
            <div className='p-3 border-b text-sm font-semibold text-gray-700 flex items-center justify-between'>
              <span>AIVA Chat</span>
              <button
                onClick={() => setIsOpen(false)}
                className='text-gray-400 hover:text-gray-600 font-bold'
              >
                ✕
              </button>
            </div>

            <div className='p-3 h-[280px] overflow-y-auto text-sm space-y-3'>
              {messages.length === 0 ? (
                <p className='text-gray-500 italic'>Start a conversation...</p>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`${
                      m.role === "user"
                        ? "text-right text-indigo-700"
                        : "text-left text-gray-700"
                    }`}
                  >
                    {m.content}
                  </div>
                ))
              )}
            </div>

            <div className='p-3 border-t flex'>
              <input
                type='text'
                placeholder='Ask AIVA...'
                className='flex-1 border rounded-lg p-2 text-sm focus:outline-none'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                aria-label='Send message'
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
                className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-500 text-white shadow hover:scale-[1.02] transform transition-transform focus:outline-none focus:ring-2 focus:ring-gray-400 border-0'
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
                <span className='font-medium'>Send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating icon */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='p-4 rounded-full shadow-lg hover:scale-105 transition-transform bg-white'
      >
        <img src={sparkIcon} alt='AIVA' className='w-8 h-8' />
      </button>
    </div>
  );
};

export default ChatWidget;
