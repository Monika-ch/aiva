import { useState } from "react";
import ChatContainer from "./components/ChatContainer";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import Hero from "./components/Hero";
import sparkIcon from "./assets/logo-robo-face.svg"; // lightweight svg icon

interface Message {
  role: "user" | "assistant";
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;
    const userMessage: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMessage]);

    // Temporary AI mock response (to be replaced in Phase 2 backend)
    setTimeout(() => {
      const aiMessage: Message = {
        role: "assistant",
        content: "That's interesting! Tell me more about your portfolio goals.",
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {/* Left column: Product information */}
        <div className="md:col-span-1 bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <img src={sparkIcon} alt="AIVA" className="w-20 h-20 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold">AIVA</h2>
              <p className="text-sm text-gray-500">AI-Powered Portfolio Assistant</p>
            </div>
          </div>
          <Hero />
        </div>

        {/* Right column: Chat */}
        <div className="md:col-span-2">
          <ChatContainer>
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 mr-3 flex items-center justify-center bg-indigo-50 rounded-full">
                      <img src={sparkIcon} alt="spark" className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <ChatInput onSend={handleSend} />
          </ChatContainer>
        </div>
      </div>
    </div>
  );
}

export default App;
