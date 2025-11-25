/**
 * Voice Controls Component
 * Voice send and dictate buttons with animations
 */

import React from "react";
import "../styles/VoiceControls.css";
import { VOICE_BUTTON_CONFIG } from "../constants/voiceControlLabels";
type VoiceButtonType = keyof typeof VOICE_BUTTON_CONFIG;

interface VoiceButtonStyleProps {
  active: boolean;
  darkMode: boolean;
}

const getVoiceButtonStyle = ({
  active,
  darkMode,
}: VoiceButtonStyleProps): string =>
  `voice-btn ${
    active
      ? "voice-btn-active"
      : darkMode
        ? "voice-btn-inactive-dark"
        : "voice-btn-inactive-light"
  }`;

interface VoiceButtonProps {
  type: VoiceButtonType;
  isActive: boolean;
  darkMode: boolean;
  onClick: () => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onClick,
  isActive,
  darkMode,
  type,
}) => {
  const config = VOICE_BUTTON_CONFIG[type];
  const IconComponent = isActive ? config.icons.active : config.icons.inactive;
  const label = isActive ? config.labels.ACTIVE : config.labels.INACTIVE;
  const title = isActive
    ? config.labels.TITLE_ACTIVE
    : config.labels.TITLE_INACTIVE;

  return (
    <button
      onClick={onClick}
      className={`${getVoiceButtonStyle({ active: isActive, darkMode })} hover:opacity-90`}
      aria-label={label}
      title={title}
    >
      {isActive && (
        <>
          <span className="voice-pulse" />
          <span className="voice-glow" />
        </>
      )}
      <IconComponent className="voice-icon" />
    </button>
  );
};

interface VoiceSendButtonProps {
  onClick: () => void;
  isActive: boolean;
  darkMode: boolean;
}

export const VoiceSendButton: React.FC<VoiceSendButtonProps> = (props) => (
  <VoiceButton {...props} type="voice-send" />
);

interface DictateButtonProps {
  onClick: () => void;
  isActive: boolean;
  darkMode: boolean;
}

export const DictateButton: React.FC<DictateButtonProps> = (props) => (
  <VoiceButton {...props} type="dictate" />
);
