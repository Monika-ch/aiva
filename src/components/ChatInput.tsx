import { Input, Button } from "@heroui/react";
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
    <div className='flex items-center gap-2 p-3 border-t bg-gray-50'>
      <Input
        fullWidth
        variant='bordered'
        placeholder='Type a message...'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
      />
      <Button color='primary' onPress={handleSend}>
        Send
      </Button>
    </div>
  );
};

export default ChatInput;
