// Core phase definitions and styling
export const timingPhases = {
  onset: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    message: 'Initial effects - Monitor carefully',
    vitals: ['heartRate', 'anxiety']
  },
  comeup: {
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 border-purple-200 text-purple-700',
    message: 'Effects building - Find safe space',
    vitals: ['heartRate', 'temperature'] 
  },
  peak: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50 border-red-200 text-red-700',
    message: 'Maximum effects - No redosing',
    vitals: ['heartRate', 'temperature', 'breathing']
  },
  offset: {
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 border-orange-200 text-orange-700', 
    message: 'Effects reducing - Rest & recover',
    vitals: ['heartRate']
  },
  afterglow: {
    color: 'bg-blue-500', 
    bgColor: 'bg-blue-50 border-blue-200 text-blue-700',
    message: 'After-effects - Take it easy',
    vitals: []
  },
  finished: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50 border-green-200 text-green-700',
    message: 'Effects minimal - Safe to rest',
    vitals: []
  }
};

// Complete timing profiles for all substances
export const timingProfiles = {
  // Benzodiazepines
  'alprazolam': {
    onset: { 
      duration: 15, 
      intensity: 'waiting',
      safetyInfo: "Initial calming effects beginning. Stay in a safe environment."
    },
    comeup: { 
      duration: 50, 
      intensity: 'mild',
      safetyInfo: "Effects building. Find a calm environment."
    },
    peak: { 
      duration: 60, 
      intensity: 'high',
      safetyInfo: "Strong sedation likely. Do not drive or operate machinery."
    },
    offset: { 
      duration: 120, 
      intensity: 'moderate',
      safetyInfo: "Effects still strong. Avoid additional doses."
    },
    afterglow: {
      duration: 240,
      intensity: 'mild',
      safetyInfo: "You may still be impaired. Get rest."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Highly addictive. Do not mix with other depressants.",
      breathing: "Monitor breathing rate",
      vitals: ["breathing rate", "consciousness level"]
    }
  },

  'diazepam': {
    onset: { 
      duration: 30, 
      intensity: 'moderate',
      safetyInfo: "Initial relaxation beginning. Find a comfortable setting."
    },
    comeup: { 
      duration: 15, 
      intensity: 'mild',
      safetyInfo: "Effects building gradually. Stay in a comfortable setting."
    },
    peak: { 
      duration: 120, 
      intensity: 'moderate',
      safetyInfo: "Moderate sedation expected. No driving."
    },
    offset: { 
      duration: 480, 
      intensity: 'moderate',
      safetyInfo: "Long-acting effects continue. Stay hydrated."
    },
    afterglow: {
      duration: 720,
      intensity: 'mild',
      safetyInfo: "Effects may persist. Rest recommended."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Long-acting benzo. Avoid alcohol and other depressants.",
      breathing: "Monitor breathing rate",
      vitals: ["breathing rate", "consciousness level"]
    }
  },

  // Stimulants
  'mdma': {
    onset: { 
      duration: 30, 
      intensity: 'moderate',
      safetyInfo: "Initial effects starting. Find comfortable temperature. Anxiety normal."
    },
    comeup: { 
      duration: 20, 
      intensity: 'moderate',
      safetyInfo: "Effects building. Stay hydrated but don't overdrink."
    },
    peak: { 
      duration: 120, 
      intensity: 'very high',
      safetyInfo: "Strong effects. Take breaks from dancing. Monitor temperature."
    },
    offset: { 
      duration: 180, 
      intensity: 'high',
      safetyInfo: "Continue hydration. Watch for overheating."
    },
    afterglow: {
      duration: 360,
      intensity: 'mild',
      safetyInfo: "Rest and recover. Supplement with vitamins if available."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Wait 6-8 weeks between uses. Test your substances.",
      hydration: "Sip water regularly - 500ml/hour max",
      temperature: "Take regular cool-down breaks",
      vitals: ["heart rate", "temperature", "hydration"]
    }
  },

  'kokain': {
    onset: { 
      duration: 1, 
      intensity: 'high',
      safetyInfo: "Rapid onset beginning. Check heart rate."
    },
    comeup: { 
      duration: 10, 
      intensity: 'high',
      safetyInfo: "Effects coming on quickly. Monitor heart rate."
    },
    peak: { 
      duration: 20, 
      intensity: 'very high',
      safetyInfo: "Intense stimulation. Watch for anxiety."
    },
    offset: { 
      duration: 20, 
      intensity: 'moderate',
      safetyInfo: "Avoid redosing too frequently."
    },
    afterglow: {
      duration: 60,
      intensity: 'mild',
      safetyInfo: "Coming down. Don't chase the high."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "High addiction potential. Monitor heart.",
      heartRate: "Watch for irregular heartbeat",
      temperature: "Stay cool and hydrated",
      vitals: ["heart rate", "chest pain", "anxiety"]
    }
  },

  'amfetamin': {
    onset: { 
      duration: 20, 
      intensity: 'moderate',
      safetyInfo: "Initial stimulation starting. Stay calm."
    },
    comeup: { 
      duration: 15, 
      intensity: 'moderate',
      safetyInfo: "Effects building. Stay calm and hydrated."
    },
    peak: { 
      duration: 180, 
      intensity: 'high',
      safetyInfo: "Strong stimulation. Monitor heart rate."
    },
    offset: { 
      duration: 360, 
      intensity: 'moderate',
      safetyInfo: "Maintain hydration. Eat if possible."
    },
    afterglow: {
      duration: 240,
      intensity: 'mild',
      safetyInfo: "Rest and recover. Food and hydration important."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Monitor heart rate and temperature",
      hydration: "Stay hydrated but don't overdo it",
      food: "Try to eat even if not hungry",
      vitals: ["heart rate", "temperature", "hydration"]
    }
  },

  'metylfenidat': {
    onset: { 
      duration: 60, 
      intensity: 'moderate',
      safetyInfo: "Gradual onset. Maintain normal routine."
    },
    comeup: { 
      duration: 30, 
      intensity: 'moderate',
      safetyInfo: "Effects building gradually."
    },
    peak: { 
      duration: 120, 
      intensity: 'moderate',
      safetyInfo: "Moderate stimulation. Don't exceed prescribed dose."
    },
    offset: { 
      duration: 240, 
      intensity: 'moderate',
      safetyInfo: "Effects steady. Stay hydrated."
    },
    afterglow: {
      duration: 120,
      intensity: 'mild',
      safetyInfo: "Effects diminishing. Avoid late doses."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Follow prescribed dosing schedule",
      heartRate: "Monitor if feeling anxious",
      sleep: "Avoid taking too late in day",
      vitals: ["heart rate", "sleep quality"]
    }
  },

  // Dissociatives
  'ketamin': {
    onset: { 
      duration: 2, 
      intensity: 'high',
      safetyInfo: "Effects begin rapidly. Sit or lie down."
    },
    comeup: { 
      duration: 10, 
      intensity: 'high',
      safetyInfo: "Find safe position. Effects come quick."
    },
    peak: { 
      duration: 30, 
      intensity: 'very high',
      safetyInfo: "Strong dissociation. Stay seated/lying."
    },
    offset: { 
      duration: 30, 
      intensity: 'moderate',
      safetyInfo: "Coordination impaired. Don't move much."
    },
    afterglow: {
      duration: 60,
      intensity: 'mild',
      safetyInfo: "Gradual return. Take it slow."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Use in safe setting with sitter",
      position: "Stay seated or lying down",
      breathing: "Maintain clear airway",
      vitals: ["breathing", "consciousness"]
    }
  },

  // Default profile
  'default': {
    onset: { 
      duration: 30, 
      intensity: 'moderate',
      safetyInfo: "Initial effects beginning. Find safe environment."
    },
    comeup: { 
      duration: 15, 
      intensity: 'mild',
      safetyInfo: "Monitor effects carefully. Stay safe."
    },
    peak: { 
      duration: 90, 
      intensity: 'high',
      safetyInfo: "Peak effects. No additional doses."
    },
    offset: { 
      duration: 180, 
      intensity: 'moderate',
      safetyInfo: "Main effects continuing."
    },
    afterglow: {
      duration: 120,
      intensity: 'mild',
      safetyInfo: "Effects reducing. Rest advised."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Monitor effects carefully",
      vitals: ["general wellbeing"],
      position: "Stay in safe environment"
    }
  }
};

// Categories for fallback
export const categoryProfiles = {
  'Benzodiazepiner': {
    onset: { 
      duration: 20, 
      intensity: 'moderate',
      safetyInfo: "Initial calming effects starting. Stay comfortable."
    },
    comeup: { 
      duration: 10, 
      intensity: 'mild',
      safetyInfo: "Find safe environment. Effects starting."
    },
    peak: { 
      duration: 120, 
      intensity: 'high',
      safetyInfo: "No driving or machinery. Memory affected."
    },
    offset: { 
      duration: 360, 
      intensity: 'moderate',
      safetyInfo: "Avoid alcohol and other depressants."
    },
    afterglow: {
      duration: 240,
      intensity: 'mild',
      safetyInfo: "Rest and recovery important."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Do not mix with alcohol or opioids",
      breathing: "Monitor breathing rate",
      vitals: ["breathing rate", "consciousness"]
    }
  },

  'Sentralstimulerende': {
    onset: { 
      duration: 15, 
      intensity: 'high',
      safetyInfo: "Initial stimulation beginning. Stay calm."
    },
    comeup: { 
      duration: 10, 
      intensity: 'moderate',
      safetyInfo: "Monitor heart rate. Stay hydrated."
    },
    peak: { 
      duration: 120, 
      intensity: 'very high',
      safetyInfo: "Watch temperature. Take breaks."
    },
    offset: { 
      duration: 240, 
      intensity: 'high',
      safetyInfo: "Stay cool. Keep hydrating."
    },
    afterglow: {
      duration: 180,
      intensity: 'mild',
      safetyInfo: "Rest and recover. Eat if possible."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Monitor heart rate and temperature",
      hydration: "Regular small sips of water",
      vitals: ["heart rate", "temperature", "hydration"]
    }
  },

  'Opioider': {
    onset: { 
      duration: 20, 
      intensity: 'high',
      safetyInfo: "Effects beginning. Have naloxone ready."
    },
    comeup: { 
      duration: 10, 
      intensity: 'moderate',
      safetyInfo: "Never use alone. Have naloxone."
    },
    peak: { 
      duration: 90, 
      intensity: 'very high',
      safetyInfo: "High overdose risk. No mixing."
    },
    offset: { 
      duration: 180, 
      intensity: 'high',
      safetyInfo: "Monitor breathing. No other depressants."
    },
    afterglow: {
      duration: 240,
      intensity: 'mild',
      safetyInfo: "Still dangerous. No alcohol."
    },
    total: function() {
      return this.onset.duration + 
             this.comeup.duration + 
             this.peak.duration + 
             this.offset.duration;
    },
    safetyInfo: {
      general: "Have naloxone available. Never use alone.",
      breathing: "Monitor breathing rate closely",
      consciousness: "Check responsiveness regularly",
      vitals: ["breathing rate", "consciousness", "skin color"]
    }
  }
};

// Helper functions for phase management
export const getPhaseInfo = (phase) => {
  return timingPhases[phase] || timingPhases.onset;
};

export const getPhaseColor = (phase) => {
  return timingPhases[phase]?.color || timingPhases.onset.color;
};

export const getPhaseBgColor = (phase) => {
  return timingPhases[phase]?.bgColor || timingPhases.onset.bgColor;
};

export const calculatePhase = (minutesSince, profile) => {
  if (minutesSince < profile.onset.duration) {
    return {
      phase: 'onset',
      progress: (minutesSince / profile.onset.duration) * 100,
      timeRemaining: profile.onset.duration - minutesSince
    };
  } 
  
  const afterOnset = minutesSince - profile.onset.duration;
  if (afterOnset < profile.comeup.duration) {
    return {
      phase: 'comeup',
      progress: (afterOnset / profile.comeup.duration) * 100,
      timeRemaining: profile.comeup.duration - afterOnset
    };
  }
  
  const afterComeup = afterOnset - profile.comeup.duration;
  if (afterComeup < profile.peak.duration) {
    return {
      phase: 'peak',
      progress: (afterComeup / profile.peak.duration) * 100,
      timeRemaining: profile.peak.duration - afterComeup
    };
  }
  
  const afterPeak = afterComeup - profile.peak.duration;
  if (afterPeak < profile.offset.duration) {
    return {
      phase: 'offset',
      progress: (afterPeak / profile.offset.duration) * 100,
      timeRemaining: profile.offset.duration - afterPeak
    };
  }
  
  const afterOffset = afterPeak - profile.offset.duration;
  if (profile.afterglow && afterOffset < profile.afterglow.duration) {
    return {
      phase: 'afterglow',
      progress: (afterOffset / profile.afterglow.duration) * 100,
      timeRemaining: profile.afterglow.duration - afterOffset
    };
  }
  
  return {
    phase: 'finished',
    progress: 100,
    timeRemaining: 0
  };
};

// Time formatting and calculation helpers
export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatTimeRemaining = (timeInMinutes) => {
  if (!timeInMinutes) return '--:--:--';
  const hours = Math.floor(timeInMinutes / 60);
  const minutes = Math.floor(timeInMinutes % 60);
  const seconds = Math.floor((timeInMinutes % 1) * 60);
  return `${String(hours).padStart(2, '0')}:${
    String(minutes).padStart(2, '0')}:${
    String(seconds).padStart(2, '0')}`;
};

// Safety monitoring helpers
export const getVitalSigns = (phase, substance) => {
  const profile = timingProfiles[substance.toLowerCase()] || 
                 categoryProfiles[substance] || 
                 timingProfiles.default;
                 
  const phaseInfo = timingPhases[phase];
  
  return {
    required: phaseInfo?.vitals || [],
    recommendations: profile.safetyInfo?.vitals || [],
    message: profile[phase]?.safetyInfo || phaseInfo?.message
  };
};

export const getSafetyRecommendations = (substance, phase) => {
  const profile = timingProfiles[substance.toLowerCase()] || 
                 categoryProfiles[substance] || 
                 timingProfiles.default;
  
  return {
    phase: profile[phase]?.safetyInfo,
    general: profile.safetyInfo?.general,
    vitals: getVitalSigns(phase, substance)
  };
};

// Profile lookup helper
export const getSubstanceProfile = (substance) => {
  return timingProfiles[substance.toLowerCase()] ||
    categoryProfiles[substance] ||
    timingProfiles.default;
};

export const calculateNextDoseTime = (lastDoseTime, profile) => {
  if (!lastDoseTime) return null;
  
  const totalDuration = profile.total();
  const safeWaitTime = Math.max(totalDuration, 240); // Minimum 4 hours or total duration
  
  const lastDose = new Date(lastDoseTime);
  return new Date(lastDose.getTime() + (safeWaitTime * 60 * 1000));
};