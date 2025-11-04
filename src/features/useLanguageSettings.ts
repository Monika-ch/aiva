/**
 * Language Settings
 * Manages speech recognition language preferences
 */

import { useState, useEffect, useMemo } from "react";

export const LANGUAGE_OPTIONS = [
  { code: "auto", label: "Auto (Browser language)" },
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "es-ES", label: "Spanish (España)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "de-DE", label: "German (Germany)" },
  { code: "hi-IN", label: "Hindi (India)" },
  { code: "ja-JP", label: "Japanese (日本語)" },
  { code: "ko-KR", label: "Korean (한국어)" },
  { code: "zh-CN", label: "Chinese (简体中文)" },
];

const SPEECH_LANGUAGE_KEY = "aiva-speech-language";
const CUSTOM_LANGUAGE_KEY = "aiva-speech-language-custom";
const LAST_VOICE_LANGUAGE_KEY = "aiva-last-voice-language";
const CURRENT_LANGUAGE_KEY = "aiva-current-language";

export const useLanguageSettings = () => {
  const [speechLanguage, setSpeechLanguage] = useState<string>(() => {
    return localStorage.getItem(SPEECH_LANGUAGE_KEY) || "auto";
  });

  const [customLanguage, setCustomLanguage] = useState<string>(() => {
    const saved = localStorage.getItem(CUSTOM_LANGUAGE_KEY);
    return saved || "";
  });

  // Resolve "auto" to browser language
  const resolvedSpeechLanguage =
    speechLanguage === "auto" ? navigator.language || "en-US" : speechLanguage;

  const effectiveSpeechLocale = useMemo(
    () => (speechLanguage === "auto" ? resolvedSpeechLanguage : speechLanguage),
    [speechLanguage, resolvedSpeechLanguage]
  );

  const isCustomSpeechLanguage =
    speechLanguage !== "auto" &&
    !LANGUAGE_OPTIONS.some((option) => option.code === speechLanguage);

  // Persist speech language
  useEffect(() => {
    localStorage.setItem(SPEECH_LANGUAGE_KEY, speechLanguage);
  }, [speechLanguage]);

  // Persist custom language
  useEffect(() => {
    if (customLanguage) {
      localStorage.setItem(CUSTOM_LANGUAGE_KEY, customLanguage);
    } else {
      localStorage.removeItem(CUSTOM_LANGUAGE_KEY);
    }
  }, [customLanguage]);

  // Update custom language state when switching
  useEffect(() => {
    if (isCustomSpeechLanguage && !customLanguage) {
      setCustomLanguage(speechLanguage);
    }
    if (
      !isCustomSpeechLanguage &&
      customLanguage &&
      LANGUAGE_OPTIONS.some((option) => option.code === speechLanguage)
    ) {
      setCustomLanguage("");
    }
  }, [customLanguage, isCustomSpeechLanguage, speechLanguage]);

  // Persist effective locale
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CURRENT_LANGUAGE_KEY, effectiveSpeechLocale);
    } catch (error) {
      // ignore persistence errors
    }
  }, [effectiveSpeechLocale]);

  const recordVoiceLanguagePreference = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LAST_VOICE_LANGUAGE_KEY, effectiveSpeechLocale);
      localStorage.setItem(CURRENT_LANGUAGE_KEY, effectiveSpeechLocale);
    } catch (error) {
      // ignore storage errors
    }
  };

  return {
    speechLanguage,
    setSpeechLanguage,
    customLanguage,
    setCustomLanguage,
    resolvedSpeechLanguage,
    effectiveSpeechLocale,
    isCustomSpeechLanguage,
    recordVoiceLanguagePreference,
  };
};

export const filterLanguageOptions = (searchTerm: string) => {
  if (!searchTerm.trim()) {
    return LANGUAGE_OPTIONS;
  }

  const search = searchTerm.trim().toLowerCase();
  return LANGUAGE_OPTIONS.filter(
    (option) =>
      option.code.toLowerCase().includes(search) ||
      option.label.toLowerCase().includes(search)
  );
};
