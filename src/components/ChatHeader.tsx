import { Avatar } from "@heroui/react";

const ChatHeader = () => {
  return (
    <div className='flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-blue-100'>
      <div className='flex items-center gap-3'>
        <Avatar
          src='https://cdn-icons-png.flaticon.com/512/4712/4712109.png'
          alt='AI Assistant'
          size='sm'
        />
        <h2 className='font-semibold text-gray-700'>Portfolio AI Assistant</h2>
      </div>
    </div>
  );
};

export default ChatHeader;
