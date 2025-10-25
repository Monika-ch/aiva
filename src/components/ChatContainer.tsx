import React from "react";

const ChatContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col w-full min-h-[70vh] bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
      {children}
    </div>
  );
};

export default ChatContainer;
