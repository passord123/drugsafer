import React, { useState } from 'react';
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

const DrugTimeline = ({
  lastDoseTime,
  drugName,
  category,
  currentPhase,
  timeToNextPhase
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showAllPhases, setShowAllPhases] = useState(false);

  const profile = timingProfiles[drugName.toLowerCase()] ||
    categoryProfiles[category] ||
    timingProfiles.default;

  const phases = ['onset', 'comeup', 'peak', 'offset', 'finished'];

  const getNextPhase = (phase) => {
    const currentIndex = phases.indexOf(phase);
    return phases[currentIndex + 1] || 'finished';
  };

  const getPhaseEndTime = (phase, profile, lastDoseTime) => {
    const lastDose = new Date(lastDoseTime);
    let phaseEndMinutes = 0;

    switch (phase) {
      case 'onset':
        phaseEndMinutes = profile.onset.duration;
        break;
      case 'comeup':
        phaseEndMinutes = profile.onset.duration + profile.comeup.duration;
        break;
      case 'peak':
        phaseEndMinutes = profile.onset.duration + profile.comeup.duration + profile.peak.duration;
        break;
      case 'offset':
        phaseEndMinutes = profile.total();
        break;
      default:
        return null;
    }

    return new Date(lastDose.getTime() + phaseEndMinutes * 60 * 1000);
  };

  const calculateTimeRemaining = (currentPhase, lastDoseTime, profile) => {
    if (!lastDoseTime || currentPhase === 'finished') {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const now = new Date();
    const phaseEndTime = getPhaseEndTime(currentPhase, profile, lastDoseTime);

    if (!phaseEndTime || now >= phaseEndTime) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const diffMs = phaseEndTime - now;
    return {
      hours: Math.floor(diffMs / (1000 * 60 * 60)),
      minutes: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diffMs % (1000 * 60)) / 1000)
    };
  };

  const getPhaseStyles = (phase) => {
    switch (phase) {
      case 'onset':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-200';
      case 'comeup':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-200';
      case 'peak':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200';
      case 'offset':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200';
      case 'finished':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-200';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200';
    }
  };

  const getSafetyInfo = (phase) => {
    return profile[phase]?.safetyInfo ||
      "Monitor effects carefully and maintain safe environment";
  };

  const formatCountdown = (time) => {
    if (!time) return '--:--:--';
    const hours = Math.max(0, time.hours);
    const minutes = Math.max(0, time.minutes);
    const seconds = Math.max(0, time.seconds);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getPhaseTime = (phase) => {
    switch (phase) {
      case 'onset':
        return profile.onset.duration;
      case 'comeup':
        return profile.comeup.duration;
      case 'peak':
        return profile.peak.duration;
      case 'offset':
        return profile.offset.duration;
      default:
        return 0;
    }
  };

  const remainingTime = calculateTimeRemaining(currentPhase, lastDoseTime, profile);

  if (!lastDoseTime) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">No active dose tracked</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Timer Display */}
      <div className={`p-4 rounded-lg border ${getPhaseStyles(currentPhase)}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold">
            {currentPhase === 'finished' ? 'Effects Complete' :
              `${currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase`}
          </h3>
          <div className="mt-2 font-mono text-4xl font-bold">
            {formatCountdown(remainingTime)}
          </div>
          <div className="text-sm mt-1">
            Next phase: {getNextPhase(currentPhase)}
          </div>
        </div>
      </div>

      {/* Show All Phases Toggle */}
      <button
        onClick={() => setShowAllPhases(!showAllPhases)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 
                 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 
                 transition-colors"
      >
        <span className="font-medium">Phase Timeline</span>
        {showAllPhases ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* All Phases Timeline */}
      {showAllPhases && (
        <div className="space-y-3">
          {phases.map((phase) => (
            <div
              key={phase}
              className={`p-3 rounded-lg border ${getPhaseStyles(phase)} 
                       ${currentPhase === phase ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{phase.charAt(0).toUpperCase() + phase.slice(1)}</h4>
                  <p className="text-sm opacity-75">
                    {phase !== 'finished' ? `Duration: ${getPhaseTime(phase)}m` : 'Complete'}
                  </p>
                </div>
                {currentPhase === phase && (
                  <div className="text-sm font-mono">
                    {formatCountdown(remainingTime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expandable Details Section */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 
                   rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 
                   transition-colors"
      >
        <span className="font-medium">Phase Details</span>
        {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {showDetails && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
          {/* Timing Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Current Phase Timing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {remainingTime.hours}h {remainingTime.minutes}m
                </p>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">Next Phase</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {getNextPhase(currentPhase)}
                </p>
              </div>
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white">Safety Guidelines</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Wait recommended time between doses, wait atleast untill offset</span>
              </li>
              <li className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Monitor vital signs regularly</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span>Stay in a safe environment</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugTimeline;