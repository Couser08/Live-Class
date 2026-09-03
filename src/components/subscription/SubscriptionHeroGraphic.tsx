import React from 'react';

export const SubscriptionHeroGraphic: React.FC = () => {
  return (
    <div className="w-full max-w-[340px] aspect-4/3 relative flex items-center justify-center select-none">
      <svg viewBox="0 0 360 280" className="w-full h-full" fill="none">
        <defs>
          {/* Subtle Dot Grid */}
          <pattern id="subHeroDotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#818CF8" fillOpacity="0.25" />
          </pattern>

          {/* Gradient Glow */}
          <radialGradient id="subHeroPlatformGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>

          {/* 3D Cube Gradients */}
          <linearGradient id="subHeroCubeTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C7D2FE" />
            <stop offset="100%" stopColor="#A5B4FC" />
          </linearGradient>
          <linearGradient id="subHeroCubeLeft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="subHeroCubeRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          {/* Stepped Pedestal Gradients */}
          <linearGradient id="subHeroPedestalTop" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EEF2FF" />
            <stop offset="100%" stopColor="#E0E7FF" />
          </linearGradient>
          <linearGradient id="subHeroPedestalSide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </linearGradient>
        </defs>

        {/* Dot Matrix Pattern in Upper Right */}
        <rect x="220" y="10" width="130" height="120" fill="url(#subHeroDotPattern)" />

        {/* Outer Glow Halo */}
        <ellipse cx="180" cy="205" rx="140" ry="45" fill="url(#subHeroPlatformGlow)" />

        {/* Platform Base - Outer Tier */}
        <ellipse cx="180" cy="216" rx="120" ry="36" fill="#E2E8F0" fillOpacity="0.5" />
        <path
          d="M60 196 C60 216, 300 216, 300 196 L300 206 C300 226, 60 226, 60 206 Z"
          fill="url(#subHeroPedestalSide)"
        />
        <ellipse cx="180" cy="196" rx="120" ry="34" fill="url(#subHeroPedestalTop)" />

        {/* Platform Base - Inner Stepped Tier */}
        <path
          d="M85 178 C85 194, 275 194, 275 178 L275 186 C275 202, 85 202, 85 186 Z"
          fill="#CBD5E1"
          fillOpacity="0.7"
        />
        <ellipse cx="180" cy="178" rx="95" ry="26" fill="#F8FAFC" />

        {/* Isometric Cube Shadow */}
        <ellipse cx="180" cy="168" rx="55" ry="16" fill="#475569" fillOpacity="0.2" />

        {/* 3D Floating Rounded Cube with Code Icon */}
        <g transform="translate(180, 115)">
          {/* Left Face */}
          <path
            d="M-52 -5 L0 25 L0 75 L-52 45 Z"
            fill="url(#subHeroCubeLeft)"
          />
          {/* Right Face */}
          <path
            d="M0 25 L52 -5 L52 45 L0 75 Z"
            fill="url(#subHeroCubeRight)"
          />
          {/* Top Face */}
          <path
            d="M0 -35 L52 -5 L0 25 L-52 -5 Z"
            fill="url(#subHeroCubeTop)"
          />

          {/* Soft specular highlights and rounded edges */}
          <path
            d="M-52 -5 Q-54 -10 -46 -15 L-6 -33 Q0 -36 6 -33 L46 -15 Q54 -10 52 -5 L0 25 Z"
            fill="white"
            fillOpacity="0.3"
          />

          {/* Glowing </> Code Symbol on Front Facing Plane */}
          <g transform="translate(0, 10)">
            {/* Left bracket < */}
            <path
              d="M-22 8 L-30 18 L-22 28"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Slash / */}
            <path
              d="M-4 32 L4 4"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Right bracket > */}
            <path
              d="M22 8 L30 18 L22 28"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
