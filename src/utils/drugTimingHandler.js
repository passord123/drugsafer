import { timingProfiles, categoryProfiles } from '../components/DrugTimer/timingProfiles';

export const getDrugTiming = (drug) => {
  const profile = timingProfiles[drug.name.toLowerCase()] ||
    categoryProfiles[drug.category] ||
    timingProfiles.default;

  const totalDuration = profile.total();
  const offsetPhaseStart = profile.onset.duration +
    profile.comeup.duration +
    profile.peak.duration;

  const minTimeBetweenDoses = drug.settings?.useRecommendedTiming
    ? totalDuration / 60 // Convert minutes to hours
    : drug.settings?.minTimeBetweenDoses || 4;

  const maxDailyDoses = Math.floor(24 / minTimeBetweenDoses);

  return {
    minTimeBetweenDoses,
    maxDailyDoses,
    totalDuration,
    offsetPhaseStart,
    profile
  };
};

export const checkDoseSafety = (drug, proposedDoseTime) => {
  if (!drug.doses?.length) return { safe: true };

  const timing = getDrugTiming(drug);
  const lastDose = new Date(drug.doses[0].timestamp);
  const proposed = new Date(proposedDoseTime);
  const minutesSinceLastDose = (proposed - lastDose) / (1000 * 60);
  const hoursSinceLastDose = minutesSinceLastDose / 60;

  // Calculate offset phase start time (when onset + comeup + peak phases are complete)
  const offsetPhaseStart = timing.profile.onset.duration +
    timing.profile.comeup.duration +
    timing.profile.peak.duration;

  // Check if in offset phase
  const inOffsetPhase = minutesSinceLastDose >= offsetPhaseStart;

  // Check daily dose limit
  const today = proposed.toDateString();
  const dosesToday = drug.doses.filter(dose =>
    new Date(dose.timestamp).toDateString() === today
  ).length;

  const maxDailyDoses = drug.settings?.maxDailyDoses || timing.maxDailyDoses;
  const quotaExceeded = dosesToday >= maxDailyDoses;

  // Allow dosing during offset phase by considering it safe
  const tooSoon = !inOffsetPhase && hoursSinceLastDose < timing.minTimeBetweenDoses;

  return {
    safe: (!tooSoon || inOffsetPhase) && !quotaExceeded,
    remainingTime: Math.max(0, timing.minTimeBetweenDoses - hoursSinceLastDose),
    quotaExceeded,
    dosesToday,
    maxDailyDoses,
    lastDoseTime: lastDose,
    timeSinceLastDose: hoursSinceLastDose,
    inOffsetPhase,
    reason: tooSoon
      ? `Wait atleast untill offset phase or optimally ${formatHours(timing.minTimeBetweenDoses)} between doses`
      : quotaExceeded
        ? `Maximum ${maxDailyDoses} doses per day exceeded`
        : null
  };
};

export const calculateNextDoseTime = (drug, lastDoseTime) => {
  if (!lastDoseTime) return null;

  const timing = getDrugTiming(drug);
  const lastDose = new Date(lastDoseTime);
  const nextDoseTime = new Date(lastDose.getTime() + (timing.minTimeBetweenDoses * 60 * 60 * 1000));

  return nextDoseTime;
};

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${remainingMinutes}m`;
};

const formatHours = (hours) => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  } else if (wholeHours === 0) {
    return `${minutes}m`;
  }
  return `${wholeHours}h ${minutes}m`;
};

export const getSafetyMessage = (drug, phase) => {
  const { profile } = getDrugTiming(drug);

  if (phase === 'offset') {
    return "Redosing possible but use caution. Monitor effects carefully.";
  }

  return profile.safetyInfo?.[phase] ||
    "Monitor effects carefully and wait appropriate time between doses.";
};