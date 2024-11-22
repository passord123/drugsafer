import React, { useState, useEffect } from 'react';
import { getSubstanceProfile } from './DrugTimer/timingProfiles';
import { Clock, AlertTriangle } from 'lucide-react';

const DrugTimeline = ({ lastDoseTime, drugName }) => {
  const [currentPhase, setCurrentPhase] = useState('none');
  const [progress, setProgress] = useState(0);
  
  const profile = getSubstanceProfile(drugName);

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
    };

    updateTimeline();
    const interval = setInterval(updateTimeline, 60000);
    return () => clearInterval(interval);
  }, [lastDoseTime, profile]);

  if (!lastDoseTime) return null;

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getPhaseTime = (phase) => {
    const doseTime = new Date(lastDoseTime);
    let minutes = 0;
    
    switch (phase) {
      case 'onset':
        minutes = profile.onset.duration;
        break;
      case 'peak':
        minutes = profile.onset.duration + profile.peak.duration;
        break;
      case 'duration':
        minutes = profile.onset.duration + profile.peak.duration + profile.duration.duration;
        break;
      case 'comedown':
        minutes = profile.total;
        break;
      default:
        return '';
    }

    return new Date(doseTime.getTime() + minutes * 60000).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const phaseColors = {
    onset: 'bg-yellow-500',
    peak: 'bg-red-500',
    duration: 'bg-orange-500',
    comedown: 'bg-blue-500',
    finished: 'bg-green-500'
  };

  const phaseInfo = [
    {
      name: 'Onset',
      phase: 'onset',
      duration: profile.onset.duration,
      intensity: profile.onset.intensity,
      safety: profile.safetyInfo?.onset
    },
    {
      name: 'Peak',
      phase: 'peak',
      duration: profile.peak.duration,
      intensity: profile.peak.intensity,
      safety: profile.safetyInfo?.peak
    },
    {
      name: 'Duration',
      phase: 'duration',
      duration: profile.duration.duration,
      intensity: profile.duration.intensity,
      safety: profile.safetyInfo?.duration
    }
  ];

  return (
    <div className="space-y-4 bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium">Effect Timeline</h3>
        </div>
        <span className="text-sm text-gray-500">
          {formatDuration(Math.floor((new Date() - new Date(lastDoseTime)) / 60000))} since dose
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${phaseColors[currentPhase]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{new Date(lastDoseTime).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
          <span>{getPhaseTime('comedown')}</span>
        </div>
      </div>

      {/* Phase cards */}
      <div className="grid grid-cols-3 gap-2">
        {phaseInfo.map(({ name, phase, duration, intensity, safety }) => (
          <div 
            key={phase}
            className={`p-3 rounded-lg border ${
              currentPhase === phase 
                ? `bg-${phase === 'onset' ? 'yellow' : phase === 'peak' ? 'red' : 'orange'}-50 
                   border-${phase === 'onset' ? 'yellow' : phase === 'peak' ? 'red' : 'orange'}-200` 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="font-medium mb-1">{name}</div>
            <div className="text-sm text-gray-600">
              {formatDuration(duration)}
              {currentPhase === phase && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white border">
                  Current
                </span>
              )}
            </div>
            {intensity && (
              <div className="text-xs text-gray-500 mt-1">
                {intensity} intensity
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Safety info */}
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