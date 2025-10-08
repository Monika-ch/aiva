import React from "react";

const ChatContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className='flex flex-col w-full h-[90vh] max-w-2xl mx-auto mt-6 bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100'>
      {children}
    </div>
  );
};

export default ChatContainer;
