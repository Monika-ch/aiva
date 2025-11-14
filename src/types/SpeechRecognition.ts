export type SpeechRecognitionResultLike = {
  readonly 0: { transcript: string };
  readonly isFinal: boolean;
};

export interface SpeechRecognitionEventLike {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultLike[];
}

export interface SpeechRecognitionErrorEventLike {
  readonly error?: string;
}

export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionConstructorLike = new () => SpeechRecognitionLike;

export type WindowWithSpeechRecognition = Window &
  Partial<{
    webkitSpeechRecognition: SpeechRecognitionConstructorLike;
    SpeechRecognition: SpeechRecognitionConstructorLike;
  }>;
