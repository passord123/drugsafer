import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ArrowUpCircle, Timer, Thermometer, Activity, HeartPulse } from 'lucide-react';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';

const DrugTimeline = ({ lastDoseTime, drugName }) => {
  const [currentPhase, setCurrentPhase] = useState('none');
  const [progress, setProgress] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const profile = timingProfiles[drugName.toLowerCase()] || 
                 categoryProfiles[drugName] || 
                 timingProfiles.default;

  const calculateTimeToNextPhase = (timeSince) => {
    let nextPhaseStart = 0;
    let nextPhaseName = '';

    if (timeSince < profile.onset.duration) {
      nextPhaseStart = profile.onset.duration;
      nextPhaseName = 'peak';
    } else if (timeSince < (profile.onset.duration + profile.peak.duration)) {
      nextPhaseStart = profile.onset.duration + profile.peak.duration;
      nextPhaseName = 'offset';
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
      } else if (minutesSince < profile.total) {
        phase = 'offset';
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

  const getPhaseIcon = (phase) => {
    switch (phase) {
      case 'onset':
        return <Clock className="w-5 h-5" />;
      case 'peak':
        return <Activity className="w-5 h-5" />;
      case 'offset':
        return <HeartPulse className="w-5 h-5" />;
      default:
        return <Thermometer className="w-5 h-5" />;
    }
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'onset':
        return 'bg-yellow-500';
      case 'peak':
        return 'bg-red-500';
      case 'offset':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getCurrentPhaseInfo = () => {
    const phaseInfo = {
      onset: {
        color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        title: 'Onset Phase',
        description: profile.safetyInfo.onset
      },
      peak: {
        color: 'bg-red-50 border-red-200 text-red-700',
        title: 'Peak Phase',
        description: profile.safetyInfo.peak
      },
      offset: {
        color: 'bg-orange-50 border-orange-200 text-orange-700',
        title: 'Offset Phase',
        description: profile.safetyInfo.offset
      },
      finished: {
        color: 'bg-green-50 border-green-200 text-green-700',
        title: 'Safe Phase',
        description: 'Effects should be minimal now'
      }
    };

    return phaseInfo[currentPhase] || phaseInfo.finished;
  };

  const phaseInfo = getCurrentPhaseInfo();

  return (
    <div className="space-y-4">
      {/* Main Timer Display */}
      <div className={`p-4 rounded-lg border ${phaseInfo.color}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getPhaseIcon(currentPhase)}
            <h3 className="font-medium">{phaseInfo.title}</h3>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm hover:underline"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="text-3xl font-mono font-bold mb-2">
            {formatCountdown(timeToNextPhase)}
          </div>
          <p className="text-sm">
            Until {timeToNextPhase?.nextPhase === 'finished' ? 'completion' : `${timeToNextPhase?.nextPhase} phase`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getPhaseColor(currentPhase)}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Safety Information */}
        {profile.safetyInfo?.[currentPhase] && (
          <div className="mt-4 flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{profile.safetyInfo[currentPhase]}</p>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="grid gap-3 md:grid-cols-3">
          {['onset', 'peak', 'offset'].map((phase) => (
            <div 
              key={phase}
              className={`p-3 rounded-lg border ${
                currentPhase === phase 
                  ? `bg-${phase === 'onset' ? 'yellow' : phase === 'peak' ? 'red' : 'orange'}-50 
                     border-${phase === 'onset' ? 'yellow' : phase === 'peak' ? 'red' : 'orange'}-200` 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getPhaseIcon(phase)}
                <span className="font-medium capitalize">{phase}</span>
                {currentPhase === phase && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white border">
                    Current
                  </span>
                )}
              </div>
              <div className="text-sm space-y-1">
                <p>Duration: {phase === 'onset' ? profile.onset.duration : 
                            phase === 'peak' ? profile.peak.duration : 
                            profile.offset.duration} minutes</p>
                <p>Intensity: {phase === 'onset' ? profile.onset.intensity :
                             phase === 'peak' ? profile.peak.intensity :
                             profile.offset.intensity}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrugTimeline;