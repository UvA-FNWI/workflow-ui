import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '../../utils/cn';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  skew: number;
}

export interface ConfettiProps {
  /** Number of confetti pieces to generate */
  count?: number;
  /** Whether the confetti animation is active */
  isActive: boolean;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Additional CSS class names */
  className?: string;
}

const COLORS = [
  '#BD0032', // --color-red-brand
  '#1f1d21', // --color-black
  '#CFCBC9', // --color-grey-400
];

const generateConfettiPieces = (count: number): ConfettiPiece[] => {
  return Array.from({ length: count }, (_, i) => {
    const width = Math.random() * 6 + 4; // 4-10px width
    const height = Math.random() * 12 + 10; // 10-22px height (rectangular banner)
    const skew = Math.random() * 30 - 15; // -15 to 15 degrees skew for bent banner effect

    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50 - 10, // Start between -10% and -60% of viewport height (off-screen)
      width,
      height,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      duration: Math.random() * 2 + 2, // 2-4s
      rotation: Math.random() * 360,
      skew,
    };
  });
};

export const Confetti = ({
  count = 200,
  isActive,
  onComplete,
  className,
}: ConfettiProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startAnimation = useCallback(() => {
    setPieces(generateConfettiPieces(count));

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Calculate max duration (longest animation + delay)
    const maxDuration = 4.5 * 1000; // 4s max duration + 0.5s max delay
    timeoutRef.current = setTimeout(() => {
      setPieces([]);
      onComplete?.();
    }, maxDuration);
  }, [count, onComplete]);

  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      setPieces([]);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, startAnimation]);

  if (pieces.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'ui:pointer-events-none ui:fixed ui:inset-0 ui:overflow-hidden ui:z-50',
        className
      )}
      aria-hidden="true"
    >
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="ui:absolute ui:animate-confetti-fall"
          style={
            {
              left: `${piece.x}%`,
              top: `${piece.y}vh`,
              width: piece.width,
              height: piece.height,
              backgroundColor: piece.color,
              transform: `skewX(${piece.skew}deg)`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              '--initial-rotation': `${piece.rotation}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};
