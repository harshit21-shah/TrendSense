interface TrendSenseLogoProps {
  size?: number;
  className?: string;
}

/** SVG mark — signal line rising into an arrowhead on violet background */
export function TrendSenseLogo({ size = 28, className }: TrendSenseLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="TrendSense"
      role="img"
    >
      <rect width="32" height="32" rx="7.5" fill="#6d28d9" />
      {/* Rising signal path — dip then strong upward curve */}
      <path
        d="M5 22 Q7.5 24.5 9.5 21 Q11.5 17.5 14 22 C16.5 26.5 20 13 27 6"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead */}
      <path
        d="M22.5 5.5 L27 6 L26.5 10.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
