import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getSubstanceProfile } from './DrugTimer/timingProfiles';

const DrugTimeline = ({ lastDoseTime, drugName }) => {
  const [currentPhase, setCurrentPhase] = useState('none');
  const [progress, setProgress] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(null);
  
  const profile = getSubstanceProfile(drugName);

  const calculateTimeToNextPhase = (timeSince) => {
    let nextPhaseStart = 0;
    let nextPhaseName = '';

    if (timeSince < profile.onset.duration) {
      nextPhaseStart = profile.onset.duration;
      nextPhaseName = 'peak';
    } else if (timeSince < (profile.onset.duration + profile.peak.duration)) {
      nextPhaseStart = profile.onset.duration + profile.peak.duration;
      nextPhaseName = 'duration';
    } else if (timeSince < (profile.onset.duration + profile.peak.duration + profile.duration.duration)) {
      nextPhaseStart = profile.onset.duration + profile.peak.duration + profile.duration.duration;
      nextPhaseName = 'comedown';
    } else if (timeSince < profile.total) {
      nextPhaseStart = profile.total;
      nextPhaseName = 'finished';
    }

    const minutesRemaining = nextPhaseStart - timeSince;
    const totalSeconds = Math.max(0, Math.floor(minutesRemaining * 60));
    
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      nextPhase: nextPhaseName
    };
  };

  useEffect(() => {
    if (!lastDoseTime) return;

    const updateTimeline = () => {
      const now = new Date();
      const doseTime = new Date(lastDoseTime);
      const minutesSince = (now - doseTime) / (1000 * 60);
      
      let phase;
      if (minutesSince < profile.onset.duration) {
        phase = 'onset';
      } else if (minutesSince < (profile.onset.duration + profile.peak.duration)) {
        phase = 'peak';
      } else if (minutesSince < (profile.onset.duration + profile.peak.duration + profile.duration.duration)) {
        phase = 'duration';
      } else if (minutesSince < profile.total) {
        phase = 'comedown';
      } else {
        phase = 'finished';
      }

      setCurrentPhase(phase);
      setProgress(Math.min(100, (minutesSince / profile.total) * 100));
      setTimeToNextPhase(calculateTimeToNextPhase(minutesSince));
    };

    updateTimeline();
    const interval = setInterval(updateTimeline, 1000);
    return () => clearInterval(interval);
  }, [lastDoseTime, profile]);

  if (!lastDoseTime) return null;

  const formatCountdown = (time) => {
    if (!time) return '00:00:00';
    const { hours, minutes, seconds } = time;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const phaseColors = {
    onset: 'bg-yellow-500',
    peak: 'bg-red-500',
    duration: 'bg-orange-500',
    comedown: 'bg-blue-500',
    finished: 'bg-green-500'
  };

  return (
    <div className="space-y-4 bg-white rounded-lg border p-4">
      <div className="bg-blue-100 rounded-lg border-2 border-blue-300 p-4 mb-4">
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-900">Next Phase: {timeToNextPhase?.nextPhase || 'Complete'}</h3>
          <div className="bg-white mt-2 p-3 rounded-lg border border-blue-300">
            <div className="font-mono text-4xl font-bold text-blue-800">
              {formatCountdown(timeToNextPhase)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${phaseColors[currentPhase]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {profile.safetyInfo?.[currentPhase] && (
        <div className="mt-2 p-3 text-sm bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-500" />
            <span>{profile.safetyInfo[currentPhase]}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugTimeline;