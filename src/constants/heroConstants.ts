/**
 * Hero Section Constants
 * Features, tech stack, and content for the hero section
 */

export const HERO_CONTENT = {
  TITLE: "AIVA — AI Portfolio Assistant",
  SUBTITLE: "AI-Powered Personal Portfolio Assistant",
  DESCRIPTION:
    "Create a professional narrative from your work history, tailor your portfolio, and get custom suggestions to impress recruiters and clients.",
} as const;

export const HERO_FEATURES = [
  {
    title: "Resume & Portfolio Review",
    desc: "Get concise suggestions to improve clarity and impact.",
    icon: "📝",
  },
  {
    title: "Project Storytelling",
    desc: "Transform technical projects into compelling case studies.",
    icon: "📖",
  },
  {
    title: "Tech Stack Optimization",
    desc: "Highlight your strongest tools and frameworks with clarity.",
    icon: "⚙️",
  },
] as const;

export const HERO_TECH_STACK = [
  "React",
  "TypeScript",
  "AWS",
  "Tailwind",
  "Framer Motion",
] as const;

export const HERO_CTA = "Start exploring" as const;
