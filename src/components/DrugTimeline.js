import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Timer, ArrowUpCircle, Activity, HeartPulse, Shield } from 'lucide-react';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';

const DrugTimeline = ({ lastDoseTime, drugName }) => {
  const [currentPhase, setCurrentPhase] = useState('none');
  const [progress, setProgress] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVitals, setShowVitals] = useState(false);
  
  const getModifiedProfile = (name) => {
    const baseProfile = timingProfiles[name.toLowerCase()] || 
                       categoryProfiles[name] || 
                       timingProfiles.default;
    
    const totalDuration = baseProfile.total();
    
    return {
      onset: { 
        duration: baseProfile.onset.duration,
        intensity: 'waiting'
      },
      comeup: { 
        duration: baseProfile.comeup?.duration || Math.floor(baseProfile.onset.duration * 0.4),
        intensity: baseProfile.comeup?.intensity || 'mild'
      },
      peak: { 
        duration: baseProfile.peak.duration,
        intensity: baseProfile.peak.intensity 
      },
      offset: { 
        duration: baseProfile.offset.duration,
        intensity: baseProfile.offset.intensity 
      },
      total: totalDuration,
      safetyInfo: {
        onset: "Waiting for first effects. Be patient, don't redose.",
        comeup: baseProfile.safetyInfo?.comeup || "Initial effects starting. Find a safe environment.",
        peak: baseProfile.safetyInfo?.peak || "Peak effects. Monitor yourself carefully.",
        offset: baseProfile.safetyInfo?.offset || "Effects diminishing. Don't redose yet."
      }
    };
  };

  const profile = getModifiedProfile(drugName);

  const calculatePhaseAndProgress = (minutesSince) => {
    const onsetEnd = profile.onset.duration;
    const comeupEnd = onsetEnd + profile.comeup.duration;
    const peakEnd = comeupEnd + profile.peak.duration;
    const offsetEnd = peakEnd + profile.offset.duration;

    let phase;
    let nextPhaseStart;
    let nextPhaseName;

    if (minutesSince < onsetEnd) {
      phase = 'onset';
      nextPhaseStart = onsetEnd;
      nextPhaseName = 'comeup';
    } else if (minutesSince < comeupEnd) {
      phase = 'comeup';
      nextPhaseStart = comeupEnd;
      nextPhaseName = 'peak';
    } else if (minutesSince < peakEnd) {
      phase = 'peak';
      nextPhaseStart = peakEnd;
      nextPhaseName = 'offset';
    } else if (minutesSince < offsetEnd) {
      phase = 'offset';
      nextPhaseStart = offsetEnd;
      nextPhaseName = 'finished';
    } else {
      phase = 'finished';
      nextPhaseStart = offsetEnd;
      nextPhaseName = 'finished';
    }

    const progressPercent = Math.min(100, (minutesSince / profile.total) * 100);
    
    const minutesRemaining = Math.max(0, nextPhaseStart - minutesSince);
    const totalSeconds = Math.floor(minutesRemaining * 60);
    
    const timeRemaining = {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
      nextPhase: nextPhaseName
    };

    return { phase, progress: progressPercent, timeRemaining };
  };

  useEffect(() => {
    if (!lastDoseTime) return;

    const updateTimeline = () => {
      const now = new Date();
      const doseTime = new Date(lastDoseTime);
      const minutesSince = (now - doseTime) / (1000 * 60);
      
      const { phase, progress: currentProgress, timeRemaining } = calculatePhaseAndProgress(minutesSince);
      
      setCurrentPhase(phase);
      setProgress(currentProgress);
      setTimeToNextPhase(timeRemaining);
    };

    updateTimeline();
    const interval = setInterval(updateTimeline, 1000);
    return () => clearInterval(interval);
  }, [lastDoseTime, drugName]);

  const getPhaseColor = (phase) => {
    const colors = {
      onset: 'bg-gray-400',
      comeup: 'bg-purple-500',
      peak: 'bg-red-500',
      offset: 'bg-orange-500',
      finished: 'bg-green-500'
    };
    return colors[phase] || colors.onset;
  };

  const getPhaseBgColor = (phase) => {
    const colors = {
      onset: 'bg-gray-50 border-gray-200 text-gray-700',
      comeup: 'bg-purple-50 border-purple-200 text-purple-700',
      peak: 'bg-red-50 border-red-200 text-red-700',
      offset: 'bg-orange-50 border-orange-200 text-orange-700',
      finished: 'bg-green-50 border-green-200 text-green-700'
    };
    return colors[phase] || colors.onset;
  };

  const getPhaseIcon = (phase) => {
    const icons = {
      onset: Clock,
      comeup: ArrowUpCircle,
      peak: Activity,
      offset: HeartPulse,
      finished: Shield
    };
    const Icon = icons[phase] || Clock;
    return <Icon className="w-5 h-5" />;
  };

  const formatCountdown = (time) => {
    if (!time) return '00:00:00';
    const { hours, minutes, seconds } = time;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!lastDoseTime) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
        No active dose tracked
      </div>
    );
  }

  const phases = ['onset', 'comeup', 'peak', 'offset'];

  return (
    <div className="space-y-4">
      {/* Main Timer Display */}
      <div className={`p-4 rounded-lg border ${getPhaseBgColor(currentPhase)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getPhaseIcon(currentPhase)}
            <h3 className="font-medium">
              {currentPhase === 'onset' ? 'Onset - Waiting for Effects' : 
               currentPhase === 'finished' ? 'Effects Complete' :
               `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase`}
            </h3>
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
            Until {timeToNextPhase?.nextPhase === 'finished' ? 'completion' : 
                   `${timeToNextPhase?.nextPhase} phase`}
          </p>
        </div>

        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getPhaseColor(currentPhase)}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {profile.safetyInfo?.[currentPhase] && (
          <div className="mt-4 flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{profile.safetyInfo[currentPhase]}</p>
          </div>
        )}
      </div>

      {/* Expanded Phase Details */}
      {isExpanded && (
        <div className="grid gap-3 md:grid-cols-4">
          {phases.map((phase) => (
            <div 
              key={phase}
              className={`p-3 rounded-lg border ${
                currentPhase === phase ? getPhaseBgColor(phase) : 'bg-gray-50 border-gray-200'
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
                <p>Duration: {formatDuration(profile[phase].duration)}</p>
                <p>Intensity: {profile[phase].intensity}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vital Signs Monitoring */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-blue-900">Vital Signs Monitoring</h4>
          <button
            onClick={() => setShowVitals(!showVitals)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showVitals ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        {showVitals && (
          <div className="space-y-2 mt-3">
            <div className="flex items-start gap-2 text-sm text-blue-800">
              <HeartPulse className="w-4 h-4 mt-1 flex-shrink-0" />
              <span>Monitor heart rate - seek help if racing or irregular</span>
            </div>
            {(currentPhase === 'peak' || currentPhase === 'onset') && (
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <Timer className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Check temperature - stay cool and hydrated</span>
              </div>
            )}
            {currentPhase === 'peak' && (
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <AlertTriangle className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Monitor breathing - seek help if shallow or difficult</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugTimeline;