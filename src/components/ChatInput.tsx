import { useState } from "react";

const ChatInput = ({ onSend }: { onSend: (message: string) => void }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className='flex items-center gap-3 p-4 border-t bg-white'>
      <input
        aria-label='Type your message'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className='flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring focus:ring-indigo-200'
        placeholder='Ask AIVA...'
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
  );
};

export default ChatInput;
