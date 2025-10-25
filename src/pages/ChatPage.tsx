import { useState, useRef, useEffect } from "react";
import ChatContainer from "../components/ChatContainer";
import ChatHeader from "../components/ChatHeader";
import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";

interface Message {
  sender: "user" | "aiva";
  message: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "aiva",
      message:
        "👋 Hey there! I’m AIVA — your AI-powered portfolio assistant. Ask me anything about Monika’s work!",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    setMessages((prev) => [...prev, { sender: "user", message: text }]);
    setIsTyping(true);

    // Mock AI delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "aiva",
          message:
            "That’s a great question! Soon I’ll pull real data from your portfolio.",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4'>
      <ChatContainer>
        <ChatHeader />
        <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
          {messages.map((msg, i) => (
            <MessageBubble key={i} sender={msg.sender} message={msg.message} />
          ))}

          {isTyping && (
            <div className='flex justify-start mb-3'>
              <div className='bg-gray-100 text-gray-600 px-4 py-2 rounded-2xl rounded-bl-none shadow text-sm animate-pulse'>
                AIVA is thinking...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <ChatInput onSend={handleSend} />
      </ChatContainer>
    </div>
  );
};

export default ChatPage;
