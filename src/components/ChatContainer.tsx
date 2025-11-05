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
    <div className={`flex flex-col w-full h-[calc(100vh-8rem)] max-h-[800px] shadow-xl rounded-xl overflow-hidden border ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-100'
    }`}>
      {children}
    </div>
  );
};

export default ChatContainer;
