/**
 * Dictation Hook
 * Manages dictation mode state and text manipulation
 */

import { useRef, useCallback } from "react";

export const useDictation = () => {
  const dictationTranscriptRef = useRef("");
  const dictationBaseInputRef = useRef("");

  const clearDictationSession = useCallback(() => {
    dictationTranscriptRef.current = "";
    dictationBaseInputRef.current = "";
  }, []);

  const clearDictationTranscript = useCallback(
    (setInput: (s: string) => void) => {
      // Clear only the current dictation transcript, not the base input
      dictationTranscriptRef.current = "";
      const base = dictationBaseInputRef.current || "";
      setInput(base);
    },
    []
  );

  const appendDictationChunk = useCallback((rawChunk: string) => {
    if (!rawChunk) return;

    if (rawChunk === "\n") {
      const current = dictationTranscriptRef.current || "";
      // Allow multiple consecutive newlines
      dictationTranscriptRef.current = `${current}\n`;
      return;
    }

    const chunk = rawChunk.trim();
    if (!chunk) return;

    const current = dictationTranscriptRef.current || "";
    if (!current) {
      dictationTranscriptRef.current = chunk;
      return;
    }

    const needsSpace = !current.endsWith("\n");
    dictationTranscriptRef.current = `${current}${
      needsSpace ? " " : ""
    }${chunk}`;
  }, []);

  const buildDictationCombinedContent = useCallback(() => {
    const base = dictationBaseInputRef.current || "";
    const transcript = dictationTranscriptRef.current || "";

    if (!base) return transcript;
    if (!transcript) return base;

    const baseEndsWithWhitespace = /\s$/.test(base);
    const transcriptStartsWithNewline = transcript.startsWith("\n");
    const separator =
      baseEndsWithWhitespace || transcriptStartsWithNewline ? "" : " ";
    return `${base}${separator}${transcript}`;
  }, []);

  const deleteLastWordsFromDictation = useCallback(
    (wordCount: number, setInput: (s: string) => void) => {
      const current = dictationTranscriptRef.current || "";
      if (!current) return;

      // Split by whitespace, preserving newlines as separate "words"
      const parts = current.split(/(\s+)/);

      // Filter out empty strings and count actual words (non-whitespace)
      const words: string[] = [];
      const separators: string[] = [];

      for (let i = 0; i < parts.length; i++) {
        if (parts[i].trim()) {
          words.push(parts[i]);
          if (i + 1 < parts.length) {
            separators.push(parts[i + 1] || "");
          }
        }
      }

      // Delete the specified number of words from the end
      const wordsToKeep = Math.max(0, words.length - wordCount);
      const separatorsToKeep = Math.max(0, separators.length - wordCount);

      let result = "";
      for (let i = 0; i < wordsToKeep; i++) {
        result += words[i];
        if (i < separatorsToKeep && separators[i]) {
          result += separators[i];
        }
      }

      dictationTranscriptRef.current = result.trimEnd();
      const combined = buildDictationCombinedContent();
      setInput(combined);
    },
    [buildDictationCombinedContent]
  );

  const setDictationBase = useCallback((input: string) => {
    dictationBaseInputRef.current = input;
    dictationTranscriptRef.current = "";
  }, []);

  return {
    dictationTranscriptRef,
    dictationBaseInputRef,
    clearDictationSession,
    clearDictationTranscript,
    appendDictationChunk,
    buildDictationCombinedContent,
    deleteLastWordsFromDictation,
    setDictationBase,
  };
};
