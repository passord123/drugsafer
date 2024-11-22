import React from 'react';
import { Timer } from 'lucide-react';

const PhaseInfo = ({ phase, timeRemaining, message, color }) => {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Timer className="w-5 h-5" />
          <span className="font-medium">
            {phase.charAt(0).toUpperCase() + phase.slice(1)} Phase
          </span>
        </div>
        <div className="text-2xl font-bold">
          {timeRemaining.hours.toString().padStart(2, '0')}:
          {timeRemaining.minutes.toString().padStart(2, '0')}:
          {timeRemaining.seconds.toString().padStart(2, '0')}
        </div>
      </div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
};

export default PhaseInfo;