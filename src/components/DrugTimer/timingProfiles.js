export const timingProfiles = {
  // Benzodiazepines
  'alprazolam': {
    onset: { duration: 15, intensity: 'moderate' },
    comeup: { duration: 50, intensity: 'mild' },
    peak: { duration: 60, intensity: 'high' },
    offset: { duration: 120, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Initial calming effects beginning. Stay in a safe environment.",
      onset: "Effects building. Find a calm environment.",
      peak: "Strong sedation likely. Do not drive or operate machinery.",
      offset: "Effects still strong. Avoid additional doses.",
      afterglow: "You may still be impaired. Get rest.",
      safe: "Safe to take prescribed dose if needed."
    }
  },

  'diazepam': {
    onset: { duration: 30, intensity: 'moderate' },
    comeup: { duration: 15, intensity: 'mild' },
    peak: { duration: 120, intensity: 'moderate' },
    offset: { duration: 480, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Initial relaxation beginning. Find a comfortable setting.",
      onset: "Effects building gradually. Stay in a comfortable setting.",
      peak: "Moderate sedation expected. No driving.",
      offset: "Long-acting effects continue. Stay hydrated.",
      afterglow: "Effects may persist. Rest recommended.",
      safe: "Safe for prescribed dose if needed."
    }
  },

  // Stimulants
  'mdma': {
    onset: { duration: 30, intensity: 'moderate' },
    comeup: { duration: 20, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'very high' },
    offset: { duration: 180, intensity: 'high' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Initial effects starting. Find comfortable temperature. Anxiety normal.",
      onset: "Effects building. Stay hydrated but don't overdrink.",
      peak: "Strong effects. Take breaks from dancing. Monitor temperature.",
      offset: "Continue hydration. Watch for overheating.",
      afterglow: "Rest and recover. Supplement with vitamins if available.",
      safe: "Wait 6-8 weeks before next use for safety."
    }
  },

  'kokain': {
    onset: { duration: 1, intensity: 'high' },
    comeup: { duration: 10, intensity: 'high' },
    peak: { duration: 20, intensity: 'very high' },
    offset: { duration: 20, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Rapid onset beginning. Check heart rate.",
      onset: "Effects coming on quickly. Monitor heart rate.",
      peak: "Intense stimulation. Watch for anxiety.",
      offset: "Avoid redosing too frequently.",
      afterglow: "Coming down. Don't chase the high.",
      safe: "Wait at least 1 hour between doses."
    }
  },

  'amfetamin': {
    onset: { duration: 20, intensity: 'moderate' },
    comeup: { duration: 15, intensity: 'moderate' },
    peak: { duration: 180, intensity: 'high' },
    offset: { duration: 360, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Initial stimulation starting. Stay calm.",
      onset: "Effects building. Stay calm and hydrated.",
      peak: "Strong stimulation. Monitor heart rate.",
      offset: "Maintain hydration. Eat if possible.",
      afterglow: "Rest and recover. Food and hydration important.",
      safe: "Wait 24 hours before redosing."
    }
  },

  'metylfenidat': {
    onset: { duration: 60, intensity: 'moderate' },
    comeup: { duration: 30, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'moderate' },
    offset: { duration: 240, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      onset: "Gradual onset. Maintain normal routine.",
      comeup: "Gradual onset. Maintain normal routine.",
      peak: "Moderate stimulation. Don't exceed prescribed dose.",
      offset: "Effects steady. Stay hydrated.",
      afterglow: "Effects diminishing. Avoid late doses.",
      safe: "Follow prescribed dosing schedule."
    }
  },

  // Psychedelics
  'lsd': {
    onset: { duration: 60, intensity: 'moderate' },
    comeup: { duration: 30, intensity: 'mild' },
    peak: { duration: 240, intensity: 'very high' },
    offset: { duration: 360, intensity: 'high' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "First alerts. Anxiety normal. Find comfortable setting.",
      onset: "Effects building gradually. Get comfortable.",
      peak: "Strong psychedelic effects. Stay with trusted people.",
      offset: "Extended effects. Stay in safe environment.",
      afterglow: "Integration phase. Rest and reflect.",
      safe: "Wait at least 2 weeks before next use."
    }
  },

  'psilocybin': {
    onset: { duration: 30, intensity: 'moderate' },
    comeup: { duration: 20, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'high' },
    offset: { duration: 180, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "First effects. Nausea normal. Stay seated.",
      onset: "Effects building. Nausea common.",
      peak: "Strong effects. Remain in safe space.",
      offset: "Effects reducing. Stay grounded.",
      afterglow: "Gentle return. Integration important.",
      safe: "Wait 2 weeks minimum before next use."
    }
  },

  // Dissociatives
  'ketamin': {
    onset: { duration: 2, intensity: 'high' },
    comeup: { duration: 10, intensity: 'high' },
    peak: { duration: 30, intensity: 'very high' },
    offset: { duration: 30, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Effects begin rapidly. Sit or lie down.",
      onset: "Find safe position. Effects come quick.",
      peak: "Strong dissociation. Stay seated/lying.",
      offset: "Coordination impaired. Don't move much.",
      afterglow: "Gradual return. Take it slow.",
      safe: "Wait 1 hour minimum between doses."
    }
  },

  // Default profile for unknown substances
  'default': {
    onset: { duration: 30, intensity: 'moderate' },
    comeup: { duration: 15, intensity: 'mild' },
    peak: { duration: 90, intensity: 'high' },
    offset: { duration: 180, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Initial effects beginning. Find safe environment.",
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
    comeup: { duration: 10, intensity: 'mild' },
    peak: { duration: 120, intensity: 'high' },
    offset: { duration: 360, intensity: 'moderate' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Initial calming effects starting. Stay comfortable.",
      onset: "Find safe environment. Effects starting.",
      peak: "No driving or machinery. Memory affected.",
      offset: "Avoid alcohol and other depressants.",
      afterglow: "Rest and recovery important.",
      safe: "Follow prescribed timing."
    }
  },

  'Sentralstimulerende': {
    onset: { duration: 15, intensity: 'high' },
    comeup: { duration: 10, intensity: 'moderate' },
    peak: { duration: 120, intensity: 'very high' },
    offset: { duration: 240, intensity: 'high' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Initial stimulation beginning. Stay calm.",
      onset: "Monitor heart rate. Stay hydrated.",
      peak: "Watch temperature. Take breaks.",
      offset: "Stay cool. Keep hydrating.",
      afterglow: "Rest and recover. Eat if possible.",
      safe: "Wait appropriate time before redose."
    }
  },

  'Opioider': {
    onset: { duration: 20, intensity: 'high' },
    comeup: { duration: 10, intensity: 'moderate' },
    peak: { duration: 90, intensity: 'very high' },
    offset: { duration: 180, intensity: 'high' },
    total: function () {
      return this.onset.duration + this.comeup.duration + this.peak.duration + this.offset.duration;
    },
    safetyInfo: {
      comeup: "Effects beginning. Have naloxone ready.",
      onset: "Never use alone. Have naloxone.",
      peak: "High overdose risk. No mixing.",
      offset: "Monitor breathing. No other depressants.",
      afterglow: "Still dangerous. No alcohol.",
      safe: "Wait full duration before redose."
    }
  }
};

export const getSubstanceProfile = (substance) => {
  return timingProfiles[substance.toLowerCase()] ||
    categoryProfiles[substance] ||
    timingProfiles.default;
};