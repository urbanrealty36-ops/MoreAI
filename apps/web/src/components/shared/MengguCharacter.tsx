'use client';

import React from 'react';
import { motion } from 'motion/react';

interface MengguProps {
  size?: number;
  mood?: 'happy' | 'thinking' | 'excited' | 'waving' | 'working' | 'coffee';
  className?: string;
}

export const MengguCharacter: React.FC<MengguProps> = ({
  size = 140,
  mood = 'happy',
  className = '',
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative select-none shrink-0 ${className}`}
    >
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[4px_4px_0px_#171717]"
        animate={
          mood === 'waving' || mood === 'excited'
            ? { y: [0, -6, 0] }
            : mood === 'thinking'
            ? { rotate: [-1, 2, -1] }
            : { y: [0, -3, 0] }
        }
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
      >
        {/* Soft Aura Glow Ring */}
        <circle cx="100" cy="100" r="92" fill="#FBE7B2" opacity="0.45" />

        {/* Antenna Stem */}
        <path
          d="M100 36 L100 12"
          stroke="#171717"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Antenna Sparkle Bulb */}
        <motion.circle
          cx="100"
          cy="12"
          r="9"
          fill="#FBE7B2"
          stroke="#171717"
          strokeWidth="4"
          animate={{ scale: [1, 1.25, 1], fill: ['#FBE7B2', '#FFDCCB', '#FBE7B2'] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />

        {/* Antenna Rays */}
        <path d="M100 0 L100 -3 M112 5 L116 3 M88 5 L84 3" stroke="#171717" strokeWidth="3" strokeLinecap="round" />

        {/* Left Ear / Headphone Cup */}
        <rect
          x="22"
          y="68"
          width="18"
          height="52"
          rx="9"
          fill="#D9D5FF"
          stroke="#171717"
          strokeWidth="5"
        />
        {/* Right Ear / Headphone Cup */}
        <rect
          x="160"
          y="68"
          width="18"
          height="52"
          rx="9"
          fill="#D9D5FF"
          stroke="#171717"
          strokeWidth="5"
        />

        {/* Headphone Arch */}
        <path
          d="M32 72 Q100 28 168 72"
          stroke="#171717"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />

        {/* Main Head Base Shell */}
        <rect
          x="34"
          y="38"
          width="132"
          height="112"
          rx="32"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="6"
        />

        {/* Screen / Visor Area */}
        <rect
          x="48"
          y="54"
          width="104"
          height="76"
          rx="18"
          fill="#C9F2D5"
          stroke="#171717"
          strokeWidth="5"
        />

        {/* EYES & EXPRESSION */}
        {mood === 'thinking' ? (
          <>
            {/* Thinking / Curious Eyes looking up */}
            <ellipse cx="76" cy="84" rx="8" ry="11" fill="#171717" />
            <circle cx="78" cy="80" r="3.5" fill="#FFFFFF" />
            <ellipse cx="124" cy="84" rx="8" ry="11" fill="#171717" />
            <circle cx="126" cy="80" r="3.5" fill="#FFFFFF" />
          </>
        ) : mood === 'excited' ? (
          <>
            {/* Happy Crescent Star Eyes */}
            <path
              d="M68 90 Q76 74 84 90"
              stroke="#171717"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M116 90 Q124 74 132 90"
              stroke="#171717"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        ) : (
          <>
            {/* Standard Big Cheerful Eyes */}
            <ellipse cx="74" cy="90" rx="9" ry="13" fill="#171717" />
            <circle cx="78" cy="86" r="4" fill="#FFFFFF" />
            <circle cx="71" cy="94" r="2" fill="#FFFFFF" />
            <ellipse cx="126" cy="90" rx="9" ry="13" fill="#171717" />
            <circle cx="130" cy="86" r="4" fill="#FFFFFF" />
            <circle cx="123" cy="94" r="2" fill="#FFFFFF" />
          </>
        )}

        {/* Pink Blush Cheeks */}
        <circle cx="62" cy="106" r="6" fill="#F9D8E5" stroke="#171717" strokeWidth="2" />
        <circle cx="138" cy="106" r="6" fill="#F9D8E5" stroke="#171717" strokeWidth="2" />

        {/* Mouth */}
        {mood === 'excited' ? (
          <path
            d="M90 102 Q100 120 110 102 Z"
            fill="#FF8080"
            stroke="#171717"
            strokeWidth="3.5"
          />
        ) : mood === 'thinking' ? (
          <ellipse cx="100" cy="108" rx="4" ry="5" fill="#171717" />
        ) : (
          <path
            d="M90 104 Q100 114 110 104"
            stroke="#171717"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Cute Torso / Neck */}
        <path
          d="M62 150 L68 184 L132 184 L138 150 Z"
          fill="#FFFFFF"
          stroke="#171717"
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Chest Badge "M" */}
        <rect x="85" y="158" width="30" height="20" rx="6" fill="#FBE7B2" stroke="#171717" strokeWidth="3" />
        <text
          x="100"
          y="173"
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
          fill="#171717"
          fontFamily="system-ui"
        >
          M
        </text>

        {/* Small Hands */}
        {mood === 'waving' ? (
          <motion.g
            animate={{ rotate: [-10, 20, -10] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
            style={{ transformOrigin: '40px 165px' }}
          >
            <circle cx="36" cy="165" r="12" fill="#D9D5FF" stroke="#171717" strokeWidth="4" />
          </motion.g>
        ) : (
          <circle cx="48" cy="168" r="10" fill="#D9D5FF" stroke="#171717" strokeWidth="4" />
        )}
        <circle cx="152" cy="168" r="10" fill="#D9D5FF" stroke="#171717" strokeWidth="4" />

        {/* Accessories for mood */}
        {mood === 'coffee' && (
          <g transform="translate(142, 140)">
            <rect x="0" y="8" width="18" height="22" rx="4" fill="#FFDCCB" stroke="#171717" strokeWidth="3" />
            <path d="M18 13 Q24 16 18 22" stroke="#171717" strokeWidth="3" fill="none" />
            <path d="M5 4 Q7 0 9 4" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </motion.svg>
    </div>
  );
};
