'use client'

import React, { useEffect, useRef } from 'react';

interface ProgressBarProps {
  progress: number;
  previousProgress?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, previousProgress = 0 }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (progressRef.current) {
      // Start with the previous progress value
      progressRef.current.style.width = `${previousProgress}%`;
      
      // Use requestAnimationFrame to trigger the animation after a small delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (progressRef.current) {
            progressRef.current.style.transition = 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
            progressRef.current.style.width = `${progress}%`;
          }
        }, 50);
      });
    }
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