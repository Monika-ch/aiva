import React, { useState } from "react";

export interface UseChatWidgetResult {
  isOpen: boolean;
  // allow functional updates from the UI component
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSend: () => void;
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

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
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
