import { useState, useRef, useEffect } from "react";
import ChatContainer from "../components/ChatContainer";
import ChatHeader from "../components/ChatHeader";
import EnhancedChatInput from "../components/EnhancedChatInput";
import EnhancedMessageBubble from "../components/EnhancedMessageBubble";

interface Message {
  sender: "user" | "assistant";
  message: string;
  timestamp?: number;
  reaction?: "helpful" | "not-helpful" | null;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "assistant",
      message:
        "👋 Hey there! I'm AIVA — your AI-powered portfolio assistant. Ask me anything about Monika's work!",
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [darkMode] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Read aloud function
  const readAloud = (text: string, index: number) => {
    if (isSpeaking && speakingIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    setIsSpeaking(true);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Handle reactions
  const handleReaction = (
    index: number,
    reaction: "helpful" | "not-helpful"
  ) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index
          ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
          : msg
      )
    );
  };

  const handleSend = async (text: string) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", message: text, timestamp: Date.now() },
    ]);
    setIsTyping(true);

    // Mock AI delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          message:
            "That's a great question! Soon I'll pull real data from your portfolio.",
          timestamp: Date.now(),
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
            <EnhancedMessageBubble
              key={i}
              sender={msg.sender}
              message={msg.message}
              timestamp={msg.timestamp}
              reaction={msg.reaction}
              onReaction={(reaction) => handleReaction(i, reaction)}
              onCopy={() => copyToClipboard(msg.message)}
              onReadAloud={() => readAloud(msg.message, i)}
              isSpeaking={isSpeaking && speakingIndex === i}
              darkMode={darkMode}
              showActions={msg.sender === "assistant"}
            />
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
        <EnhancedChatInput onSend={handleSend} darkMode={darkMode} />
      </ChatContainer>
    </div>
  );
};

export default ChatPage;
