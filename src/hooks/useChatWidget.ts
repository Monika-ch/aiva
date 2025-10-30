import React, { useState } from "react";

export interface UseChatWidgetResult {
  isOpen: boolean;
  // allow functional updates from the UI component
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSend: (messageOverride?: string) => void;
}

/**
 * Encapsulates chat widget logic (open state, input state, send handler).
 * Keeps UI and logic separated so the UI component stays purely presentational.
 */
export default function useChatWidget(
  onSend: (msg: string) => void
): UseChatWidgetResult {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSend = (messageOverride?: string) => {
    const messageToSend =
      messageOverride !== undefined ? messageOverride : input;
    if (!messageToSend.trim()) return;
    onSend(messageToSend);
    setInput("");
  };

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    handleSend,
  };
}
