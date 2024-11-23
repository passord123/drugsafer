export const timingProfiles = {
  // Benzodiazepines
  'alprazolam': {
    onset: { duration: 15, intensity: 'moderate' },
    peak: { duration: 90, intensity: 'high' },
    offset: { duration: 300, intensity: 'moderate' },
    total: 720, // 12 hours
    safetyInfo: {
      onset: "Effects begin quickly. Find a safe, calm environment.",
      peak: "Strong sedation likely. Do not drive or operate machinery.",
      offset: "Avoid additional doses. Effects are still strong.",
      afterglow: "You may still be impaired. Get rest.",
      safe: "Safe to take prescribed dose if needed."
    },
    specificAdvice: {
      peak: "Memory impairment likely. Don't make important decisions.",
      offset: "Avoid alcohol and other depressants."
    }
  },

  'diazepam': {
    onset: { duration: 30, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'moderate' },
    offset: { duration: 480, intensity: 'moderate' },
    total: 1440, // 24 hours
    safetyInfo: {
      onset: "Effects begin gradually. Stay in a comfortable setting.",
      peak: "Moderate sedation expected. No driving.",
      offset: "Long-acting effects continue. Stay hydrated.",
      afterglow: "Effects may persist. Rest recommended.",
      safe: "Safe for prescribed dose if needed."
    }
  },

  'klonazepam': {
    onset: { duration: 30, intensity: 'moderate' },
    peak: { duration: 240, intensity: 'high' },
    offset: { duration: 480, intensity: 'moderate' },
    total: 1440, // 24 hours
    safetyInfo: {
      onset: "Effects build slowly. Find a safe space.",
      peak: "Long peak duration. No driving or machinery.",
      offset: "Long-lasting effects. Stay in safe environment.",
      afterglow: "Effects still present. Rest recommended.",
      safe: "Wait full 24 hours before redosing."
    }
  },

  // Stimulants
  'mdma': {
    onset: { duration: 30, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'very high' },
    offset: { duration: 180, intensity: 'high' },
    total: 360, // 6 hours
    safetyInfo: {
      onset: "Stay hydrated but don't overdrink. Find comfortable temperature.",
      peak: "Strong effects. Take breaks from dancing. Monitor temperature.",
      offset: "Continue hydration. Watch for overheating.",
      afterglow: "Rest and recover. Supplement with vitamins if available.",
      safe: "Wait 6-8 weeks before next use for safety."
    },
    specificAdvice: {
      peak: "Take regular breaks. 500ml water per hour maximum.",
      offset: "Cool down if dancing. Watch body temperature."
    }
  },

  'kokain': {
    onset: { duration: 5, intensity: 'high' },
    peak: { duration: 30, intensity: 'very high' },
    offset: { duration: 45, intensity: 'moderate' },
    total: 120, // 2 hours
    safetyInfo: {
      onset: "Effects come on quickly. Monitor heart rate.",
      peak: "Intense stimulation. Watch for anxiety.",
      offset: "Avoid redosing too frequently.",
      afterglow: "Coming down. Don't chase the high.",
      safe: "Wait at least 1 hour between doses."
    }
  },

  'amfetamin': {
    onset: { duration: 20, intensity: 'moderate' },
    peak: { duration: 180, intensity: 'high' },
    offset: { duration: 360, intensity: 'moderate' },
    total: 720, // 12 hours
    safetyInfo: {
      onset: "Effects building. Stay calm and hydrated.",
      peak: "Strong stimulation. Monitor heart rate.",
      offset: "Maintain hydration. Eat if possible.",
      afterglow: "Rest and recover. Food and hydration important.",
      safe: "Wait 24 hours before redosing."
    }
  },

  'metamfetamin': {
    onset: { duration: 5, intensity: 'high' },
    peak: { duration: 240, intensity: 'very high' },
    offset: { duration: 480, intensity: 'high' },
    total: 1440, // 24 hours
    safetyInfo: {
      onset: "Rapid onset. Find safe environment.",
      peak: "Very strong effects. Monitor heart rate.",
      offset: "Extended duration. Stay hydrated.",
      afterglow: "Long comedown. Rest and hydrate.",
      safe: "Wait at least 24 hours before considering redose."
    }
  },

  'metylfenidat': {
    onset: { duration: 30, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'moderate' },
    offset: { duration: 240, intensity: 'moderate' },
    total: 480, // 8 hours
    safetyInfo: {
      onset: "Gradual onset. Maintain normal routine.",
      peak: "Moderate stimulation. Don't exceed prescribed dose.",
      offset: "Effects steady. Stay hydrated.",
      afterglow: "Effects diminishing. Avoid late doses.",
      safe: "Follow prescribed dosing schedule."
    }
  },

  // Psychedelics
  'lsd': {
    onset: { duration: 60, intensity: 'moderate' },
    peak: { duration: 240, intensity: 'very high' },
    offset: { duration: 360, intensity: 'high' },
    total: 720, // 12 hours
    safetyInfo: {
      onset: "Effects build gradually. Get comfortable.",
      peak: "Strong psychedelic effects. Stay with trusted people.",
      offset: "Extended effects. Stay in safe environment.",
      afterglow: "Integration phase. Rest and reflect.",
      safe: "Wait at least 2 weeks before next use."
    }
  },

  'psilocybin': {
    onset: { duration: 30, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'high' },
    offset: { duration: 180, intensity: 'moderate' },
    total: 360, // 6 hours
    safetyInfo: {
      onset: "Nausea common. Stay comfortable.",
      peak: "Strong effects. Remain in safe space.",
      offset: "Effects reducing. Stay grounded.",
      afterglow: "Gentle return. Integration important.",
      safe: "Wait 2 weeks minimum before next use."
    }
  },

  // Dissociatives
  'ketamin': {
    onset: { duration: 5, intensity: 'high' },
    peak: { duration: 30, intensity: 'very high' },
    offset: { duration: 60, intensity: 'moderate' },
    total: 120, // 2 hours
    safetyInfo: {
      onset: "Find safe position. Effects come quick.",
      peak: "Strong dissociation. Stay seated/lying.",
      offset: "Coordination impaired. Don't move much.",
      afterglow: "Gradual return. Take it slow.",
      safe: "Wait 1 hour minimum between doses."
    }
  },

  'dxm': {
    onset: { duration: 30, intensity: 'moderate' },
    peak: { duration: 180, intensity: 'high' },
    offset: { duration: 240, intensity: 'moderate' },
    total: 480, // 8 hours
    safetyInfo: {
      onset: "Nausea possible. Stay near bathroom.",
      peak: "Strong dissociation. Stay in bed/couch.",
      offset: "Significant impairment. Don't move around.",
      afterglow: "Afterglow can be strong. Rest.",
      safe: "Week minimum between experiences."
    }
  },

  // Opioids
  'morfin': {
    onset: { duration: 20, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'high' },
    offset: { duration: 240, intensity: 'moderate' },
    total: 480, // 8 hours
    safetyInfo: {
      onset: "Effects begin gradually. Monitor breathing.",
      peak: "Strong effects. No additional doses.",
      offset: "Avoid other depressants completely.",
      afterglow: "Effects wearing off. Still no other depressants.",
      safe: "Wait full 8 hours between doses."
    }
  },

  'heroin': {
    onset: { duration: 10, intensity: 'very high' },
    peak: { duration: 60, intensity: 'very high' },
    offset: { duration: 240, intensity: 'high' },
    total: 360, // 6 hours
    safetyInfo: {
      onset: "Rapid onset. Never use alone.",
      peak: "Overdose risk highest. Have naloxone ready.",
      offset: "Strong effects continue. No mixing.",
      afterglow: "Still risky period. No other depressants.",
      safe: "Wait minimum 6 hours between doses."
    }
  },

  'oxycodone': {
    onset: { duration: 20, intensity: 'high' },
    peak: { duration: 90, intensity: 'high' },
    offset: { duration: 180, intensity: 'moderate' },
    total: 360, // 6 hours
    safetyInfo: {
      onset: "Effects build quickly. Have naloxone ready.",
      peak: "Strong effects. No additional doses.",
      offset: "Maintain safe position. No mixing.",
      afterglow: "Effects reducing. Still no other depressants.",
      safe: "Minimum 6 hours between doses."
    }
  },

  // Empathogens
  '2cb': {
    onset: { duration: 45, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'high' },
    offset: { duration: 180, intensity: 'moderate' },
    total: 360, // 6 hours
    safetyInfo: {
      onset: "Nausea possible. Get comfortable.",
      peak: "Visual and physical effects strong.",
      offset: "Stay hydrated. Watch temperature.",
      afterglow: "Gentle comedown. Rest and recover.",
      safe: "Wait 2 weeks between sessions."
    }
  },

  // Default profile for unknown substances
  'default': {
    onset: { duration: 30, intensity: 'moderate' },
    peak: { duration: 90, intensity: 'high' },
    offset: { duration: 180, intensity: 'moderate' },
    total: 360, // 6 hours
    safetyInfo: {
      onset: "Monitor effects carefully. Stay safe.",
      peak: "Peak effects. No additional doses.",
      offset: "Main effects continuing.",
      afterglow: "Effects reducing. Rest advised.",
      safe: "Effects should be minimal now."
    }
  }
};

// Categories for fallback
export const categoryProfiles = {
  'Benzodiazepiner': {
    onset: { duration: 20, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'high' },
    offset: { duration: 360, intensity: 'moderate' },
    total: 720,
    safetyInfo: {
      onset: "Find safe environment. Effects starting.",
      peak: "No driving or machinery. Memory affected.",
      offset: "Avoid alcohol and other depressants.",
      afterglow: "Rest and recovery important.",
      safe: "Follow prescribed timing."
    }
  },

  'Sentralstimulerende': {
    onset: { duration: 15, intensity: 'high' },
    peak: { duration: 120, intensity: 'very high' },
    offset: { duration: 240, intensity: 'high' },
    total: 480,
    safetyInfo: {
      onset: "Monitor heart rate. Stay hydrated.",
      peak: "Watch temperature. Take breaks.",
      offset: "Stay cool. Keep hydrating.",
      afterglow: "Rest and recover. Eat if possible.",
      safe: "Wait appropriate time before redose."
    }
  },

  'Opioider': {
    onset: { duration: 20, intensity: 'high' },
    peak: { duration: 90, intensity: 'very high' },
    offset: { duration: 180, intensity: 'high' },
    total: 360,
    safetyInfo: {
      onset: "Never use alone. Have naloxone.",
      peak: "High overdose risk. No mixing.",
      offset: "Monitor breathing. No other depressants.",
      afterglow: "Still dangerous. No alcohol.",
      safe: "Wait full duration before redose."
    }
  }
};

// Helper function to get the right profile
export const getSubstanceProfile = (substance) => {
  return timingProfiles[substance.toLowerCase()] || 
         categoryProfiles[substance] || 
         timingProfiles.default;
};