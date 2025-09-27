
import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  startTime: number;
  finishTime: number;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ startTime, finishTime, label }) => {
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const totalDuration = finishTime - startTime;
    if (totalDuration <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(newProgress);

      const remaining = Math.max(0, finishTime - now);
      setTimeLeft(Math.ceil(remaining / 1000));

      if (now >= finishTime) {
        clearInterval(interval);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [startTime, finishTime]);

  const formattedTime = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span>{label}</span>
        <span>{formattedTime}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
