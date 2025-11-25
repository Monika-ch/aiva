import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const VoiceSendIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
    />
  </svg>
);

export const StopIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M6 6h12v12H6z" />
  </svg>
);

export const DictateIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 3.487l3.651 3.651-10.95 10.95a3 3 0 01-1.271.749l-4.106 1.23 1.23-4.106a3 3 0 01.749-1.271l10.95-10.95zM15 5l3.5 3.5"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 21h11" />
  </svg>
);
