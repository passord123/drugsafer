import { timingProfiles, categoryProfiles } from '../components/DrugTimer/timingProfiles';

export const getDrugTiming = (drug) => {
  // Get the drug's timing profile
  const profile = timingProfiles[drug.name.toLowerCase()] || 
                 categoryProfiles[drug.category] || 
                 timingProfiles.default;
  
  // Calculate total duration in hours
  const totalDuration = profile.total();
  
  // Set minimum time between doses based on total duration
  const minTimeBetweenDoses = Math.max(
    totalDuration / 60, // Convert minutes to hours
    drug.settings?.minTimeBetweenDoses || 4 // Use existing setting as fallback
  );

  // Calculate recommended max daily doses based on duration
  const maxDailyDoses = Math.floor(24 / minTimeBetweenDoses);

  return {
    minTimeBetweenDoses,
    maxDailyDoses,
    totalDuration,
    profile  // Return the full profile for additional information
  };
};

export const calculateNextDoseTime = (drug, lastDoseTime) => {
  if (!lastDoseTime) return null;
  
  const timing = getDrugTiming(drug);
  const lastDose = new Date(lastDoseTime);
  const nextDoseTime = new Date(lastDose.getTime() + (timing.minTimeBetweenDoses * 60 * 60 * 1000));
  
  return nextDoseTime;
};

export const checkDoseSafety = (drug, proposedDoseTime) => {
  if (!drug.doses?.length) return { safe: true };
  
  const timing = getDrugTiming(drug);
  const lastDose = new Date(drug.doses[0].timestamp);
  const proposed = new Date(proposedDoseTime);
  const hoursSinceLastDose = (proposed - lastDose) / (1000 * 60 * 60);
  
  return {
    safe: hoursSinceLastDose >= timing.minTimeBetweenDoses,
    remainingTime: Math.max(0, timing.minTimeBetweenDoses - hoursSinceLastDose),
    reason: hoursSinceLastDose < timing.minTimeBetweenDoses 
      ? `Wait at least ${timing.minTimeBetweenDoses} hours between doses`
      : null
  };
};

// Helper function to format duration for display
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 
    ? `${hours}h ${remainingMinutes}m`
    : `${remainingMinutes}m`;
};

// Helper function to get safety message based on timing
export const getSafetyMessage = (drug) => {
  const { profile } = getDrugTiming(drug);
  return profile.safetyInfo?.peak || 
         "Monitor effects carefully and wait appropriate time between doses.";
};