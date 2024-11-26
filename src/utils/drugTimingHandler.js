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

  // Check if in offset phase
  const inOffsetPhase = minutesSinceLastDose >= timing.offsetPhaseStart;

  // Check daily dose limit
  const today = proposed.toDateString();
  const dosesToday = drug.doses.filter(dose => 
    new Date(dose.timestamp).toDateString() === today
  ).length;
  
  const maxDailyDoses = drug.settings?.maxDailyDoses || timing.maxDailyDoses;
  const quotaExceeded = dosesToday >= maxDailyDoses;

  // Check minimum time between doses - allow during offset phase
  const minTime = drug.settings?.useRecommendedTiming 
    ? timing.minTimeBetweenDoses 
    : drug.settings?.minTimeBetweenDoses;
  const tooSoon = !inOffsetPhase && hoursSinceLastDose < minTime;

  return {
    safe: (!tooSoon || inOffsetPhase) && !quotaExceeded,
    remainingTime: Math.max(0, minTime - hoursSinceLastDose),
    quotaExceeded,
    dosesToday,
    maxDailyDoses,
    lastDoseTime: lastDose,
    timeSinceLastDose: hoursSinceLastDose,
    inOffsetPhase,
    reason: tooSoon 
      ? `Wait at least ${minTime} hours between doses` 
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

export const getSafetyMessage = (drug, phase) => {
  const { profile } = getDrugTiming(drug);
  return profile.safetyInfo?.[phase] || 
         "Monitor effects carefully and wait appropriate time between doses.";
};