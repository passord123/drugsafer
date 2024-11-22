import React from 'react';

const TimerProgress = ({ 
  phase, 
  progress, 
  timestamps, 
  onPhaseHover, 
  hoveredPhase, 
  formatTime 
}) => {
  const phases = ['onset', 'peak', 'duration', 'afterglow', 'safe'];
  
  const getPhaseColor = (phaseName) => {
    const colors = {
      onset: 'bg-yellow-500',
      peak: 'bg-red-500',
      duration: 'bg-orange-500',
      afterglow: 'bg-blue-500',
      safe: 'bg-green-500'
    };
    return colors[phaseName] || colors.onset;
  };

  const getProgressWidth = () => {
    const phaseIndex = phases.indexOf(phase);
    const baseWidth = ((phaseIndex + 1) * 20);
    const phaseProgress = progress % 20;
    return Math.min(100, baseWidth + phaseProgress);
  };

  return (
    <div className="relative pt-4">
      {/* Progress Bar */}
      <div className="absolute left-0 right-0 h-2 bg-gray-200 rounded-full">
        <div 
          className={`absolute left-0 h-full rounded-full transition-all duration-300 ${getPhaseColor(phase)}`}
          style={{ width: `${getProgressWidth()}%` }}
        />
      </div>

      {/* Phase Labels */}
      <div className="flex justify-between mt-4">
        {phases.map((phaseName) => (
          <div
            key={phaseName}
            className="relative cursor-pointer"
            onMouseEnter={() => onPhaseHover(phaseName)}
            onMouseLeave={() => onPhaseHover(null)}
          >
            <div className="text-xs text-gray-500 mb-1">
              {phaseName.charAt(0).toUpperCase() + phaseName.slice(1)}
            </div>
            <div className="text-xs text-gray-400">
              {formatTime(timestamps[phaseName === 'onset' ? 'start' : 
                         phaseName === 'safe' ? 'afterglowEnd' : 
                         `${phaseName}End`])}
            </div>
            {hoveredPhase === phaseName && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {phaseName === phase ? 'Current phase' : 
                   phases.indexOf(phaseName) < phases.indexOf(phase) ? 'Completed' :
                   'Upcoming'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimerProgress;