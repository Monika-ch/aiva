/**
 * Language Settings
 * Manages speech recognition language preferences
 */

import { useState, useEffect, useMemo } from "react";

export const LANGUAGE_OPTIONS = [
  { code: "auto", label: "Auto (Browser language)" },
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "zh-CN", label: "Chinese (简体中文)" },
  { code: "hi-IN", label: "Hindi (हिन्दी)" },
  { code: "es-ES", label: "Spanish (España)" },
  { code: "es-MX", label: "Spanish (México)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "ar-SA", label: "Arabic (العربية)" },
  { code: "bn-BD", label: "Bengali (বাংলা)" },
  { code: "pt-BR", label: "Portuguese (Brasil)" },
  { code: "pt-PT", label: "Portuguese (Portugal)" },
  { code: "ru-RU", label: "Russian (Русский)" },
  { code: "ja-JP", label: "Japanese (日本語)" },
  { code: "de-DE", label: "German (Deutsch)" },
  { code: "ko-KR", label: "Korean (한국어)" },
  { code: "te-IN", label: "Telugu (తెలుగు)" },
  { code: "tr-TR", label: "Turkish (Türkçe)" },
  { code: "ta-IN", label: "Tamil (தமிழ்)" },
  { code: "vi-VN", label: "Vietnamese (Tiếng Việt)" },
  { code: "mr-IN", label: "Marathi (मराठी)" },
  { code: "it-IT", label: "Italian (Italiano)" },
  { code: "th-TH", label: "Thai (ไทย)" },
  { code: "pl-PL", label: "Polish (Polski)" },
  { code: "nl-NL", label: "Dutch (Nederlands)" },
  { code: "id-ID", label: "Indonesian (Bahasa Indonesia)" },
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
