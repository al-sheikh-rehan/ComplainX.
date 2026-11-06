import React, { useState } from 'react';

interface ComplainXLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  showSlogan?: boolean;
  textColor?: 'dark' | 'light';
  className?: string;
  imgOnly?: boolean;
}

export const ComplainXLogo: React.FC<ComplainXLogoProps> = ({
  size = 'sm',
  showText = true,
  showTagline = false,
  showSlogan = false,
  textColor = 'dark',
  className = '',
  imgOnly = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Dimension mapping
  const sizeConfig = {
    xs: { icon: 'w-6 h-6', text: 'text-base', sub: 'text-[9px]', slogan: 'text-[8px]' },
    sm: { icon: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]', slogan: 'text-[9px]' },
    md: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs', slogan: 'text-[11px]' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-xs', slogan: 'text-xs' },
    xl: { icon: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-4xl sm:text-5xl', sub: 'text-sm', slogan: 'text-xs sm:text-sm' },
  };

  const currentSize = sizeConfig[size];

  // SVG Fallback Emblem if local image is unavailable
  const renderSvgEmblem = () => (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="complainxSwoosh" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00b4d8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#034078" />
        </linearGradient>
        <linearGradient id="complainxXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06d6a0" />
          <stop offset="100%" stopColor="#0077b6" />
        </linearGradient>
      </defs>

      {/* Dynamic C Swoosh */}
      <path
        d="M 68 20 C 58 12, 38 12, 24 24 C 10 38, 10 62, 24 76 C 38 88, 60 88, 72 78 C 76 74, 68 70, 62 73 C 50 81, 32 80, 22 70 C 12 58, 12 42, 22 30 C 32 20, 50 18, 62 25 C 67 28, 71 22, 68 20 Z"
        fill="url(#complainxSwoosh)"
      />

      {/* Internal Document Ticket */}
      <rect
        x="36"
        y="26"
        width="28"
        height="36"
        rx="4"
        fill="white"
        stroke="#1e3a8a"
        strokeWidth="3.5"
      />
      <line x1="42" y1="34" x2="58" y2="34" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="41" x2="54" y2="41" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="48" x2="50" y2="48" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />

      {/* User Avatar Silhouette */}
      <circle cx="34" cy="46" r="4.5" fill="#1e3a8a" />
      <path
        d="M 28 58 C 28 52, 32 50, 37 50 C 40 50, 41 51, 41 53 L 41 58 Z"
        fill="#1e3a8a"
      />

      {/* Speech Bubble with Exclamation Mark */}
      <circle cx="68" cy="40" r="10" fill="#10b981" />
      <path d="M 62 46 L 58 50 L 64 48 Z" fill="#10b981" />
      <rect x="66.5" y="34.5" width="3" height="6.5" rx="1.5" fill="white" />
      <circle cx="68" cy="44.5" r="1.5" fill="white" />
    </svg>
  );

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Emblem Icon / Image */}
      <div className={`relative shrink-0 ${currentSize.icon} flex items-center justify-center`}>
        {!imgError ? (
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="ComplainX Logo"
            className="w-full h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
          />
        ) : (
          renderSvgEmblem()
        )}
      </div>

      {/* Brand Typography & Optional Taglines */}
      {showText && !imgOnly && (
        <div className="flex flex-col">
          <div className="flex items-center leading-none">
            <span
              className={`font-black tracking-tight ${
                textColor === 'light' ? 'text-white' : 'text-slate-950'
              } ${currentSize.text}`}
            >
              Complain
            </span>
            <span
              className={`font-black tracking-tight bg-gradient-to-tr from-cyan-600 via-blue-600 to-teal-500 bg-clip-text text-transparent ${currentSize.text}`}
            >
              X
            </span>
          </div>

          {showTagline && (
            <span
              className={`font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 mt-1 leading-tight ${currentSize.sub}`}
            >
              Report • Track • Resolve
            </span>
          )}

          {showSlogan && (
            <span
              className={`font-medium ${
                textColor === 'light' ? 'text-slate-400' : 'text-slate-500'
              } mt-0.5 ${currentSize.slogan}`}
            >
              A Better Community Starts with You
            </span>
          )}
        </div>
      )}
    </div>
  );
};
