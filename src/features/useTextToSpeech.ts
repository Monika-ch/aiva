/**
 * Text-to-Speech Hook
 * Manages text-to-speech functionality for reading messages aloud
 */

import { useState, useCallback } from "react";

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<
    number | null
  >(null);

  const readAloud = useCallback(
    (text: string, messageIndex: number) => {
      // Stop any current speech
      window.speechSynthesis.cancel();

      if (isSpeaking && speakingMessageIndex === messageIndex) {
        // If already speaking this message, stop it
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMessageIndex(messageIndex);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking, speakingMessageIndex]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingMessageIndex(null);
  }, []);

  return {
    isSpeaking,
    speakingMessageIndex,
    readAloud,
    stopSpeaking,
  };
};
