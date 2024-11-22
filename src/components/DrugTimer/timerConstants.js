// src/components/DrugTimer/timerConstants.js

import { Clock, AlertTriangle, Shield, Heart, Thermometer } from 'lucide-react';

export const PHASES = {
  onset: {
    color: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-800',
    title: 'Onset Phase - Effects Beginning',
    message: 'Find a safe, quiet environment. Have water ready.',
    icon: Clock,
    vitals: ['temperature']
  },
  peak: {
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-800',
    title: 'Peak Phase - Maximum Effects',
    message: 'Do not redose. Stay hydrated. Monitor vital signs.',
    icon: AlertTriangle,
    vitals: ['temperature', 'heartRate', 'breathing']
  },
  plateau: {
    color: 'bg-orange-50 border-orange-200',
    textColor: 'text-orange-800',
    title: 'Plateau Phase - Sustained Effects',
    message: 'Maintain safe environment. Continue hydration.',
    icon: Shield,
    vitals: ['temperature', 'heartRate']
  },
  comedown: {
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    title: 'Comedown Phase - Effects Reducing',
    message: 'Rest and recover. Consider supplements if appropriate.',
    icon: Heart,
    vitals: ['heartRate']
  },
  safe: {
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-800',
    title: 'Safe Period',
    message: 'Effects minimal. Safe to sleep.',
    icon: Shield,
    vitals: []
  }
};

export const VITAL_SIGNS = {
  temperature: {
    icon: Thermometer,
    message: 'Monitor body temperature - stay cool and hydrated'
  },
  heartRate: {
    icon: Heart,
    message: 'Check heart rate - seek help if racing or irregular'
  },
  breathing: {
    icon: AlertTriangle,
    message: 'Monitor breathing - seek help if shallow or difficult'
  }
};

export const calculatePhase = (minutesSince, profile) => {
  if (minutesSince < profile.onset) {
    return 'onset';
  } else if (minutesSince < profile.onset + profile.peak) {
    return 'peak';
  } else if (minutesSince < profile.onset + profile.peak + profile.plateau) {
    return 'plateau';
  } else if (minutesSince < profile.total) {
    return 'comedown';
  }
  return 'safe';
};

export const calculateTimeRemaining = (phase, doseTime, profile) => {
  const now = new Date();
  const doseDate = new Date(doseTime);
  let targetTime = new Date(doseDate);

  switch (phase) {
    case 'onset':
      targetTime.setMinutes(targetTime.getMinutes() + profile.onset);
      break;
    case 'peak':
      targetTime.setMinutes(targetTime.getMinutes() + profile.onset + profile.peak);
      break;
    case 'plateau':
      targetTime.setMinutes(targetTime.getMinutes() + profile.onset + profile.peak + profile.plateau);
      break;
    case 'comedown':
      targetTime.setMinutes(targetTime.getMinutes() + profile.total);
      break;
    default:
      return { hours: 0, minutes: 0, seconds: 0 };
  }

  if (targetTime <= now) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const diff = targetTime - now;
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  };
};

export const calculateProgress = (minutesSince, profile) => {
  return Math.min(100, (minutesSince / profile.total) * 100);
};

export const getVitalSigns = (phase) => {
  return PHASES[phase]?.vitals || [];
};