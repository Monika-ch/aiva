import React from "react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  sender: "user" | "aiva";
  message: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, message }) => {
  const isUser = sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[72%] px-5 py-3 rounded-2xl text-sm shadow-sm leading-6 ${
          isUser
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-gray-50 text-gray-900 rounded-bl-none"
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
