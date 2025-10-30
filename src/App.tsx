// import { useState } from "react";
// import ChatContainer from "./components/ChatContainer";
// import ChatHeader from "./components/ChatHeader";
// import ChatInput from "./components/ChatInput";
// import Hero from "./components/Hero";
// import sparkIcon from "./assets/logo-robo-face.svg"; // lightweight svg icon

// interface Message {
//   role: "user" | "assistant";
//   content: string;
// }

// function App() {
//   const [messages, setMessages] = useState<Message[]>([]);

//   const handleSend = (msg: string) => {
//     if (!msg.trim()) return;
//     const userMessage: Message = { role: "user", content: msg };
//     setMessages((prev) => [...prev, userMessage]);

//     // Temporary AI mock response (to be replaced in Phase 2 backend)
//     setTimeout(() => {
//       const aiMessage: Message = {
//         role: "assistant",
//         content: "That's interesting! Tell me more about your portfolio goals.",
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     }, 1000);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-10">
//       <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
//         {/* Left column: Product information */}
//         <div className="md:col-span-1 bg-white rounded-xl shadow p-6">
//           <div className="flex items-center gap-3 mb-4">
//             <img src={sparkIcon} alt="AIVA" className="w-20 h-20 text-indigo-600" />
//             <div>
//               <h2 className="text-lg font-semibold">AIVA</h2>
//               <p className="text-sm text-gray-500">AI-Powered Portfolio Assistant</p>
//             </div>
//           </div>
//           <Hero />
//         </div>

//         {/* Right column: Chat */}
//         <div className="md:col-span-2">
//           <ChatContainer>
//             <ChatHeader />
//             <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
//               {messages.map((msg, i) => (
//                 <div
//                   key={i}
//                   className={`flex items-end ${
//                     msg.role === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   {msg.role === "assistant" && (
//                     <div className="w-7 h-7 mr-3 flex items-center justify-center bg-indigo-50 rounded-full">
//                       <img src={sparkIcon} alt="spark" className="w-4 h-4 text-indigo-600" />
//                     </div>
//                   )}
//                   <div
//                     className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${
//                       msg.role === "user"
//                         ? "bg-indigo-600 text-white rounded-br-none"
//                         : "bg-gray-100 text-gray-900 rounded-bl-none"
//                     }`}
//                   >
//                     {msg.content}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <ChatInput onSend={handleSend} />
//           </ChatContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import { useState } from "react";
import { motion } from "framer-motion";

import ChatContainer from "./components/ChatContainer";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import Hero from "./components/Hero";
import sparkIcon from "./assets/logo-robo-face.svg";
import ChatWidget from "./components/ChatWidget";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
  id?: string;
  reaction?: "helpful" | "not-helpful" | null;
}

const DEFAULT_AI_RESPONSE =
  "That's interesting! Tell me more about your portfolio goals.";

const AI_RESPONSE_TRANSLATIONS: Record<string, string> = {
  en: DEFAULT_AI_RESPONSE,
  es: "¡Eso es interesante! Cuéntame más sobre tus objetivos de portafolio.",
  fr: "C'est intéressant ! Parle-moi davantage de tes objectifs de portfolio.",
  de: "Das ist interessant! Erzähl mir mehr über deine Portfolio-Ziele.",
  hi: "यह दिलचस्प है! कृपया अपने पोर्टफोलियो लक्ष्यों के बारे में और बताएं।",
  ja: "それは興味深いですね！ポートフォリオの目標についてもっと教えてください。",
  ko: "흥미로운데요! 포트폴리오 목표에 대해 더 이야기해 주세요.",
  zh: "这很有意思！请再多告诉我一些你的作品集目标。",
};

const getResponseForLanguage = (locale: string | null | undefined) => {
  if (!locale) return DEFAULT_AI_RESPONSE;
  const prefix = locale.toLowerCase().split("-")[0];
  return AI_RESPONSE_TRANSLATIONS[prefix] ?? DEFAULT_AI_RESPONSE;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (msg: string) => {
    if (!msg.trim()) return;
    const userMessage: Message = {
      role: "user",
      content: msg,
      timestamp: Date.now(),
      id: `user-${Date.now()}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Mock AI response
    setTimeout(() => {
      const preferredLanguage =
        typeof window !== "undefined"
          ? localStorage.getItem("aiva-current-language")
          : "en";

      const aiMessage: Message = {
        role: "assistant",
        content: getResponseForLanguage(preferredLanguage),
        timestamp: Date.now(),
        id: `assistant-${Date.now()}`,
        reaction: null,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  // allow adding assistant messages from widgets (greeting, suggestions)
  const addAssistantMessage = (text: string) => {
    if (!text) return;
    const aiMessage: Message = {
      role: "assistant",
      content: text,
      timestamp: Date.now(),
      id: `assistant-${Date.now()}`,
      reaction: null,
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Handle message reaction
  const handleReaction = (
    messageIndex: number,
    reaction: "helpful" | "not-helpful"
  ) => {
    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === messageIndex
          ? { ...msg, reaction: msg.reaction === reaction ? null : reaction }
          : msg
      )
    );
  };

  return (
    <div className='min-h-screen bg-gray-50 py-10 relative'>
      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4'>
        {/* Left column */}
        <div className='md:col-span-1 bg-white rounded-xl shadow p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <img src={sparkIcon} alt='AIVA' className='w-20 h-20' />
            <div>
              <h2 className='text-lg font-semibold'>AIVA</h2>
              <p className='text-sm text-gray-500'>
                AI-Powered Portfolio Assistant
              </p>
            </div>
          </div>
          <Hero />
        </div>

        {/* Right column (hidden on small screens — mobile uses only ChatWidget) */}
        <div className='hidden md:col-span-2 md:block'>
          <ChatContainer>
            <ChatHeader />
            <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-white rounded-xl shadow'>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-end ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className='w-7 h-7 mr-3 flex items-center justify-center bg-indigo-50 rounded-full'>
                      <img src={sparkIcon} alt='spark' className='w-4 h-4' />
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
                </motion.div>
              ))}
            </div>
            <ChatInput onSend={handleSend} />
          </ChatContainer>
        </div>
      </div>

      {/* Floating Chat Widget (mobile-only) */}
      <ChatWidget
        messages={messages}
        onSend={handleSend}
        onAssistantMessage={addAssistantMessage}
        onClearMessages={clearMessages}
        onReaction={handleReaction}
      />
    </div>
  );
}

export default App;
