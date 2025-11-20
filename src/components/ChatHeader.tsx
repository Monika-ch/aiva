import { motion } from "framer-motion";
import sparkIcon from "../assets/logo-robo-face.svg";

const ChatHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-6 py-4 border-b bg-white"
    >
      <div className="flex items-center gap-4">
        <img src={sparkIcon} alt="AIVA logo" className="w-16 h-16" />
        <div>
          <h2 className="font-semibold text-lg tracking-wide text-gray-900">
            AIVA
          </h2>
          <p className="text-xs text-gray-500">
            AI-Powered Portfolio Assistant
          </p>
        </div>
      </div>

      <p className="text-xs italic text-gray-500">
        “An AI co-pilot for your professional story.”
      </p>
    </motion.div>
  );
};

export default ChatHeader;
