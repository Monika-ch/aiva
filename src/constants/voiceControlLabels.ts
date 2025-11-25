import { VoiceSendIcon, StopIcon, DictateIcon } from "./icons";

export const VOICE_CONTROL_LABELS = {
  VOICE_SEND: {
    ACTIVE: "Stop voice input",
    INACTIVE: "Voice input and send",
    TITLE_ACTIVE: "Stop",
    TITLE_INACTIVE: "Voice Send",
  },
  DICTATE: {
    ACTIVE: "Stop dictation",
    INACTIVE: "Dictate message",
    TITLE_ACTIVE: "Stop dictation",
    TITLE_INACTIVE: "Dictate",
  },
} as const;

export const VOICE_BUTTON_CONFIG = {
  "voice-send": {
    icons: {
      active: VoiceSendIcon,
      inactive: VoiceSendIcon,
    },
    labels: VOICE_CONTROL_LABELS.VOICE_SEND,
  },
  dictate: {
    icons: {
      active: StopIcon,
      inactive: DictateIcon,
    },
    labels: VOICE_CONTROL_LABELS.DICTATE,
  },
} as const;
