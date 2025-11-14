
import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, colorClass }) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className="w-full bg-[var(--bg-primary)] rounded-full h-2.5">
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${clampedValue}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
