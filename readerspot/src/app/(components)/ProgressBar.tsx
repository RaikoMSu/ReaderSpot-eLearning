'use client'

import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  progress: number;
  previousProgress?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, previousProgress = 0 }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = progressRef.current;
    if (!element) return;

    // Set initial width
    element.style.cssText = `width: ${previousProgress}%`;
    
    // Use animation frame for smoother animation
    const animFrame = setTimeout(() => {
      if (element) {
        element.style.cssText = `width: ${progress}%; transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`;
      }
    }, 50);
    
    return () => clearTimeout(animFrame);
  }, [progress, previousProgress]);

  return (
    <div className="fixed top-0 left-0 w-full h-1.5 bg-gray-900 z-50">
      <div
        ref={progressRef}
        className="h-full bg-amber-500"
        style={{ width: `${previousProgress}%` }}
      />
    </div>
  );
};

export default ProgressBar;