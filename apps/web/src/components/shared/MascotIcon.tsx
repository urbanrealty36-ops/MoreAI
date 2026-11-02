import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'thinking' | 'excited' | 'wink';
}

export const MascotIcon: React.FC<MascotProps> = ({
  className = '',
  size = 40,
  mood = 'happy',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[2px_2px_0px_#171717]"
      >
        {/* Antenna */}
        <path
          d="M50 16 L50 2"
          stroke="#171717"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="3"
          r="4.5"
          fill="#FBE7B2"
          stroke="#171717"
          strokeWidth="2.5"
        />

        {/* Headphones / Ears */}
        <rect
          x="12"
          y="32"
          width="8"
          height="24"
          rx="4"
          fill="#D9D5FF"
          stroke="#171717"
          strokeWidth="2.5"
        />
        <rect
          x="80"
          y="32"
          width="8"
          height="24"
          rx="4"
          fill="#D9D5FF"
          stroke="#171717"
          strokeWidth="2.5"
        />

        {/* Head Shell */}
        <rect
          x="18"
          y="16"
          width="64"
          height="54"
          rx="14"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="3.5"
        />

        {/* Screen Face */}
        <rect
          x="26"
          y="25"
          width="48"
          height="36"
          rx="8"
          fill="#C9F2D5"
          stroke="#171717"
          strokeWidth="2.5"
        />

        {/* Eyes */}
        {mood === 'wink' ? (
          <>
            <path
              d="M34 42 Q39 37 44 42"
              stroke="#171717"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse cx="60" cy="41" rx="4" ry="5.5" fill="#171717" />
            <circle cx="61.5" cy="39" r="1.5" fill="#FFFFFF" />
          </>
        ) : (
          <>
            <ellipse cx="38" cy="41" rx="4" ry="5.5" fill="#171717" />
            <circle cx="39.5" cy="39" r="1.5" fill="#FFFFFF" />
            <ellipse cx="62" cy="41" rx="4" ry="5.5" fill="#171717" />
            <circle cx="63.5" cy="39" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {/* Cheeks */}
        <circle cx="32" cy="48" r="2.5" fill="#F9D8E5" />
        <circle cx="68" cy="48" r="2.5" fill="#F9D8E5" />

        {/* Mouth */}
        {mood === 'excited' ? (
          <path
            d="M45 47 Q50 54 55 47 Z"
            fill="#171717"
            stroke="#171717"
            strokeWidth="1.5"
          />
        ) : (
          <path
            d="M45 48 Q50 53 55 48"
            stroke="#171717"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Body Base */}
        <path
          d="M30 70 L34 84 L66 84 L70 70 Z"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Emblem on chest */}
        <text
          x="50"
          y="81"
          fontSize="9"
          fontWeight="900"
          textAnchor="middle"
          fill="#171717"
          fontFamily="system-ui"
        >
          M
        </text>
      </svg>
    </div>
  );
};
