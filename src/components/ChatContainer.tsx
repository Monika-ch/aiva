import React from "react";

interface ChatContainerProps {
  children: React.ReactNode;
  darkMode?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  darkMode = false,
}) => {
  return (
    <div
      className={`flex flex-col w-full h-[calc(100vh-8rem)] max-h-[800px] rounded-[24px] overflow-hidden border ${
        darkMode
          ? "bg-gray-800/95 border-gray-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
          : "bg-white/95 border-indigo-100/40 shadow-[0_20px_50px_rgba(99,102,241,0.12)]"
      }`}
    >
      {children}
    </div>
  );
};

export default ChatContainer;
