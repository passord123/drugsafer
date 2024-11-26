import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Timer, 
  Activity, 
  HeartPulse, 
  Shield, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { timingProfiles, categoryProfiles } from './timingProfiles';

const DrugTimeline = ({ lastDoseTime, drugName, category }) => {
  const [currentPhase, setCurrentPhase] = useState('none');
  const [progress, setProgress] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const getProfile = (name, drugCategory) => {
    return timingProfiles[name.toLowerCase()] || 
           categoryProfiles[drugCategory] || 
           timingProfiles.default;
  };

  useEffect(() => {
    if (!lastDoseTime) return;

    const updateTimeline = () => {
      const now = new Date();
      const doseTime = new Date(lastDoseTime);
      const minutesSince = (now - doseTime) / (1000 * 60);
      
      const profile = getProfile(drugName, category); // Changed from getSubstanceProfile
      const { phase, progress: currentProgress, remaining, nextPhase } = calculatePhase(minutesSince, profile);
      
      setCurrentPhase(phase);
      setProgress(currentProgress);
      setTimeToNextPhase({
        hours: Math.floor(remaining / 60),
        minutes: Math.floor(remaining % 60),
        seconds: Math.floor((remaining % 1) * 60),
        nextPhase
      });
    };

    updateTimeline();
    const interval = setInterval(updateTimeline, 1000);
    return () => clearInterval(interval);
  }, [lastDoseTime, drugName, category]);

  const calculatePhase = (minutesSince, profile) => {
    const onset = profile.onset.duration;
    const comeup = profile.comeup.duration;
    const peak = profile.peak.duration;
    const offset = profile.offset.duration;

    if (minutesSince < onset) {
      return {
        phase: 'onset',
        progress: (minutesSince / onset) * 100,
        remaining: onset - minutesSince,
        nextPhase: 'comeup'
      };
    }

    const afterOnset = minutesSince - onset;
    if (afterOnset < comeup) {
      return {
        phase: 'comeup',
        progress: (minutesSince / (onset + comeup)) * 100,
        remaining: comeup - afterOnset,
        nextPhase: 'peak'
      };
    }

    const afterComeup = afterOnset - comeup;
    if (afterComeup < peak) {
      return {
        phase: 'peak',
        progress: (minutesSince / (onset + comeup + peak)) * 100,
        remaining: peak - afterComeup,
        nextPhase: 'offset'
      };
    }

    const afterPeak = afterComeup - peak;
    if (afterPeak < offset) {
      return {
        phase: 'offset',
        progress: (minutesSince / (onset + comeup + peak + offset)) * 100,
        remaining: offset - afterPeak,
        nextPhase: 'finished'
      };
    }

    return {
      phase: 'finished',
      progress: 100,
      remaining: 0,
      nextPhase: 'finished'
    };
  };

  const formatCountdown = (time) => {
    if (!time) return '--:--:--';
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  const getPhaseStyles = (phase) => {
    switch (phase) {
      case 'onset':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'comeup':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'peak':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'offset':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'finished':
        return 'bg-green-50 border-green-200 text-green-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getProgressColor = (phase) => {
    switch (phase) {
      case 'onset': return 'bg-yellow-500';
      case 'comeup': return 'bg-orange-500';
      case 'peak': return 'bg-red-500';
      case 'offset': return 'bg-blue-500';
      case 'finished': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSafetyInfo = (phase) => {
    const profile = getProfile(drugName, category);
    return profile[phase]?.safetyInfo ||
      "Monitor effects carefully and maintain safe environment";
  };

  if (!lastDoseTime) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border text-center text-gray-500">
        No active dose tracked
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white rounded-lg border p-4">
      {/* Timer Display */}
      <div className={`p-4 rounded-lg border ${getPhaseStyles(currentPhase)}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold">
            {currentPhase === 'finished' ? 'Effects Complete' :
              `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase`}
          </h3>
          <div className="mt-2 font-mono text-4xl font-bold">
            {formatCountdown(timeToNextPhase)}
          </div>
          <div className="text-sm mt-1">
            Until {timeToNextPhase?.nextPhase === 'finished' ? 'completion' : 'next phase'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getProgressColor(currentPhase)}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Safety Information */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="font-medium text-blue-700">Safety Information</span>
        </div>
        <p className="text-sm text-blue-600">{getSafetyInfo(currentPhase)}</p>
      </div>

      {/* Vital Signs Monitoring */}
      {(currentPhase === 'peak' || currentPhase === 'comeup') && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-700">
              Monitor vital signs carefully during this phase
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugTimeline;