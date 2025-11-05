/**
 * Voice Recognition Hook
 * Manages Web Speech API voice recognition for both send and dictate modes
 */

import { useRef, useState, useCallback, useEffect } from "react";
import {
  isEnterCommand,
  isClearCommand,
  isDeleteCommand,
  countDeleteCommands,
  stripSendCommand,
  normalizeAivaName,
} from "./voiceCommands";

export type VoiceMode = "send" | "dictate" | null;

interface UseVoiceRecognitionProps {
  effectiveSpeechLocale: string;
  onSendMessage: (
    message: string,
    options?: { triggeredByVoice?: boolean; voiceMode?: "send" | "dictate" }
  ) => void;
  setInput: (s: string) => void;
  input: string;
  appendDictationChunk: (chunk: string) => void;
  buildDictationCombinedContent: () => string;
  clearDictationTranscript: (setInput: (s: string) => void) => void;
  deleteLastWordsFromDictation: (
    count: number,
    setInput: (s: string) => void
  ) => void;
  setDictationBase: (input: string) => void;
  clearDictationSession: () => void;
}

export const useVoiceRecognition = ({
  effectiveSpeechLocale,
  onSendMessage,
  setInput,
  input,
  appendDictationChunk,
  buildDictationCombinedContent,
  clearDictationTranscript,
  deleteLastWordsFromDictation,
  setDictationBase,
  clearDictationSession,
}: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [listeningMode, setListeningMode] = useState<VoiceMode>(null);

  const recognitionRef = useRef<any>(null);
  const listeningModeRef = useRef<VoiceMode>(null);
  const stopRequestedRef = useRef(false);
  const sendModeTranscriptRef = useRef("");
  const sendModeSilenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastProcessedResultIndexRef = useRef(0);

  const updateListeningMode = useCallback((mode: VoiceMode) => {
    listeningModeRef.current = mode;
    setListeningMode(mode);
  }, []);

  const clearSendModeTimer = useCallback(() => {
    if (sendModeSilenceTimerRef.current) {
      clearTimeout(sendModeSilenceTimerRef.current);
      sendModeSilenceTimerRef.current = null;
    }
  }, []);

  const resetListeningState = useCallback(() => {
    const lastMode = listeningModeRef.current;
    setIsListening(false);
    updateListeningMode(null);
    stopRequestedRef.current = false;
    lastProcessedResultIndexRef.current = 0;

    if (lastMode === "dictate") {
      clearDictationSession();
    }
    if (lastMode === "send") {
      clearSendModeTimer();
      sendModeTranscriptRef.current = "";
    }
  }, [clearDictationSession, clearSendModeTimer, updateListeningMode]);

  const finalizeSendModeMessage = useCallback(() => {
    const message = sendModeTranscriptRef.current.trim();
    clearSendModeTimer();
    sendModeTranscriptRef.current = "";

    if (message) {
      onSendMessage(message, { triggeredByVoice: true, voiceMode: "send" });
    }

    try {
      stopRequestedRef.current = true;
      recognitionRef.current?.stop();
    } catch (error) {
      // ignore stop errors
    } finally {
      resetListeningState();
    }
  }, [clearSendModeTimer, resetListeningState, onSendMessage]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }

      recognitionRef.current.lang = effectiveSpeechLocale;

      recognitionRef.current.onresult = (event: any) => {
        console.log("[DEBUG] Speech recognition onresult fired");

        if (stopRequestedRef.current) {
          return;
        }

        const mode = listeningModeRef.current;
        if (!mode) return;

        let collectedTranscript = "";
        const startIndex = Math.max(
          event.resultIndex,
          lastProcessedResultIndexRef.current
        );

        for (let i = startIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result.isFinal) {
            collectedTranscript += result[0].transcript;
            lastProcessedResultIndexRef.current = i + 1;
          }
        }

        const cleanedTranscript = normalizeAivaName(
          collectedTranscript.replace(/\s+/g, " ").trim()
        );

        if (!cleanedTranscript) return;

        // Handle "send" mode
        if (mode === "send") {
          const combinedTranscript = [
            sendModeTranscriptRef.current,
            cleanedTranscript,
          ]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

          sendModeTranscriptRef.current = combinedTranscript;

          if (sendModeSilenceTimerRef.current) {
            clearTimeout(sendModeSilenceTimerRef.current);
          }

          sendModeSilenceTimerRef.current = setTimeout(
            finalizeSendModeMessage,
            5000
          );
          return;
        }

        // Handle "dictate" mode
        if (mode === "dictate") {
          console.log('[Voice Command Debug] Transcript:', cleanedTranscript);
          
          // Handle "enter" command
          if (isEnterCommand(cleanedTranscript)) {
            console.log('[Voice Command] ENTER detected');
            appendDictationChunk("\n");
            const combined = buildDictationCombinedContent();
            setInput(combined);
            return;
          }

          // Handle "clear" command
          if (isClearCommand(cleanedTranscript)) {
            console.log('[Voice Command] CLEAR detected');
            clearDictationTranscript(setInput);
            return;
          }

          // Handle "delete" command
          if (isDeleteCommand(cleanedTranscript)) {
            const deleteCount = countDeleteCommands(cleanedTranscript);
            console.log('[Voice Command] DELETE detected, count:', deleteCount);
            deleteLastWordsFromDictation(deleteCount, setInput);
            return;
          }

          const { text: chunkWithoutCommand, triggered } =
            stripSendCommand(cleanedTranscript);
          const trimmedChunk = chunkWithoutCommand.trim();

          if (trimmedChunk) {
            appendDictationChunk(trimmedChunk);
            const combined = buildDictationCombinedContent();
            setInput(combined);
          } else if (!triggered) {
            return;
          }

          if (triggered) {
            const finalContent = buildDictationCombinedContent().trim();
            if (finalContent) {
              // Stop listening before sending
              stopRequestedRef.current = true;
              try {
                recognitionRef.current?.stop();
              } catch (error) {
                // ignore stop errors
              }
              
              onSendMessage(finalContent, {
                triggeredByVoice: true,
                voiceMode: "dictate",
              });
              
              // Reset state after sending
              resetListeningState();
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("[DEBUG] Speech recognition error:", event?.error);

        if (
          listeningModeRef.current === "dictate" &&
          !stopRequestedRef.current &&
          event?.error === "no-speech"
        ) {
          try {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = effectiveSpeechLocale;
            recognitionRef.current?.start();
            setIsListening(true);
            return;
          } catch (error) {
            // fall through to reset
          }
        }

        resetListeningState();
      };

      recognitionRef.current.onend = () => {
        const mode = listeningModeRef.current;

        if (stopRequestedRef.current) {
          resetListeningState();
          return;
        }

        if (mode === "dictate") {
          try {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = effectiveSpeechLocale;
            recognitionRef.current.start();
            setIsListening(true);
          } catch (error) {
            resetListeningState();
          }
        } else if (mode === "send") {
          if (sendModeSilenceTimerRef.current) {
            try {
              recognitionRef.current.continuous = false;
              recognitionRef.current.interimResults = false;
              recognitionRef.current.lang = effectiveSpeechLocale;
              recognitionRef.current.start();
              setIsListening(true);
            } catch (error) {
              // If restart fails, wait for silence timer
            }
            return;
          }
          resetListeningState();
        } else {
          resetListeningState();
        }
      };
    }
  }, [
    appendDictationChunk,
    buildDictationCombinedContent,
    finalizeSendModeMessage,
    onSendMessage,
    effectiveSpeechLocale,
    resetListeningState,
    setInput,
    clearDictationTranscript,
    deleteLastWordsFromDictation,
  ]);

  const startVoiceRecognition = useCallback(
    (mode: "send" | "dictate") => {
      if (!recognitionRef.current) {
        alert(
          "Voice recognition is not supported in this browser. Try Chrome or Edge."
        );
        return;
      }

      if (isListening) {
        if (listeningModeRef.current === "send") {
          if (sendModeTranscriptRef.current.trim()) {
            finalizeSendModeMessage();
            return;
          }
          clearSendModeTimer();
          sendModeTranscriptRef.current = "";
        }
        stopRequestedRef.current = true;
        recognitionRef.current.stop();
        return;
      }

      updateListeningMode(mode);
      stopRequestedRef.current = false;
      lastProcessedResultIndexRef.current = 0;

      if (mode === "dictate") {
        setDictationBase(input);
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      } else {
        clearDictationSession();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        clearSendModeTimer();
        sendModeTranscriptRef.current = "";
      }

      recognitionRef.current.lang = effectiveSpeechLocale;

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("[DEBUG] Error starting speech recognition:", error);
        setIsListening(false);
        updateListeningMode(null);
      }
    },
    [
      isListening,
      finalizeSendModeMessage,
      clearSendModeTimer,
      updateListeningMode,
      input,
      setDictationBase,
      clearDictationSession,
      effectiveSpeechLocale,
    ]
  );

  return {
    isListening,
    listeningMode,
    startVoiceRecognition,
    resetListeningState,
  };
};
