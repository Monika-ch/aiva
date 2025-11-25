export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: number;
  reaction?: "helpful" | "not-helpful" | null;
  replyToId?: string;
  type?: "quick-actions" | "normal";
}

export interface SendMessageOptions {
  triggeredByVoice?: boolean;
  voiceMode?: "send" | "dictate";
  replyToId?: string;
}
