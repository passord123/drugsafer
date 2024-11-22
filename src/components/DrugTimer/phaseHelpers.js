export const getPhaseInfo = (phase) => {
  const phases = {
    onset: {
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      message: 'Effects beginning - Find a safe space'
    },
    peak: {
      color: 'bg-red-50 border-red-200 text-red-800',
      message: 'Peak effects - Avoid redosing'
    },
    duration: {
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      message: 'Primary effects active'
    },
    afterglow: {
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      message: 'Coming down - Rest and hydrate'
    },
    safe: {
      color: 'bg-green-50 border-green-200 text-green-800',
      message: 'Safe to redose if needed'
    }
  };

  return phases[phase] || phases.onset;
};

export const calculateProgress = (minutesSince, profile) => {
  const total = profile.total;
  return Math.min(100, (minutesSince / total) * 100);
};

export const getNextPhase = (currentPhase) => {
  const phases = ['onset', 'peak', 'duration', 'afterglow', 'safe'];
  const currentIndex = phases.indexOf(currentPhase);
  return phases[currentIndex + 1] || 'safe';
};

export const formatTimeRemaining = (timeRemaining) => {
  return `${timeRemaining.hours.toString().padStart(2, '0')}:${
    timeRemaining.minutes.toString().padStart(2, '0')}:${
    timeRemaining.seconds.toString().padStart(2, '0')}`;
};

export const calculateTimeRemaining = (targetTime) => {
  const now = new Date();
  const diff = targetTime - now;
  
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  };
};