import React, { useState, useEffect } from 'react';
import {
  Clock,
  Settings,
  PlusCircle,
  History,
  AlertTriangle,
  Package,
  Timer,
  ArrowUpCircle,
  Activity,
  HeartPulse,
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAlerts } from '../contexts/AlertContext';
import { getDrugTiming, checkDoseSafety, formatDuration } from '../utils/drugTimingHandler';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';
import Modal from './Modal';
import DrugHistory from './DrugHistory';
import DrugTrackerHeader from './DrugTrackerHeader';
import OverrideModal from './modals/OverrideModal';
import RecordDoseModal from './modals/RecordDoseModal';
import SettingsModal from './modals/SettingsModal';
import DrugTimeline from './DrugTimer/DrugTimeline';

const DrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  // Core state
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [customDosage, setCustomDosage] = useState(
    drug.settings?.defaultDosage?.toString() ||
    drug.dosage?.toString() || ''
  );
  const [selectedTime, setSelectedTime] = useState('now');
  const [customTime, setCustomTime] = useState(formatDateTimeLocal(new Date()));
  const [overrideReason, setOverrideReason] = useState('');

  // Timeline state
  const [currentPhase, setCurrentPhase] = useState('none');
  const [progress, setProgress] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(null);
  const [showPhaseDetails, setShowPhaseDetails] = useState(false);

  const { addSafetyAlert, addAlert } = useAlerts();

  // Get drug profile with timing info
  const getDrugProfile = (drugName) => {
    return timingProfiles[drugName.toLowerCase()] ||
      categoryProfiles[drug.category] ||
      timingProfiles.default;
  };

  const profile = getDrugProfile(drug.name);

  // Reset form state when drug changes
  useEffect(() => {
    resetDoseForm();
  }, [drug.id]);

  // Update timeline effect
  useEffect(() => {
    if (!drug.doses?.[0]) return;

    const updateTimeline = () => {
      const now = new Date();
      const lastDose = new Date(drug.doses[0].timestamp);
      const minutesSince = (now - lastDose) / (1000 * 60);

      let phase = calculatePhase(minutesSince, profile);
      setCurrentPhase(phase.currentPhase);
      setProgress(phase.progress);
      setTimeToNextPhase({
        hours: Math.floor(phase.timeRemaining / 60),
        minutes: Math.floor(phase.timeRemaining % 60),
        seconds: Math.floor((phase.timeRemaining % 1) * 60),
        nextPhase: phase.nextPhase
      });
    };

    updateTimeline();
    const interval = setInterval(updateTimeline, 1000);
    return () => clearInterval(interval);
  }, [drug.doses, profile]);

  const calculatePhase = (minutesSince, profile) => {
    const offsetStart = profile.onset.duration +
      profile.comeup.duration +
      profile.peak.duration;

    if (minutesSince < profile.onset.duration) {
      return {
        currentPhase: 'onset',
        progress: (minutesSince / profile.onset.duration) * 100,
        timeRemaining: profile.onset.duration - minutesSince,
        nextPhase: 'comeup'
      };
    } else if (minutesSince < offsetStart) {
      const isInComeup = minutesSince < (profile.onset.duration + profile.comeup.duration);
      const phaseStart = isInComeup ? profile.onset.duration :
        profile.onset.duration + profile.comeup.duration;
      const phaseDuration = isInComeup ? profile.comeup.duration : profile.peak.duration;
      return {
        currentPhase: isInComeup ? 'comeup' : 'peak',
        progress: ((minutesSince - phaseStart) / phaseDuration) * 100,
        timeRemaining: phaseDuration - (minutesSince - phaseStart),
        nextPhase: isInComeup ? 'peak' : 'offset'
      };
    } else if (minutesSince < profile.total()) {
      return {
        currentPhase: 'offset',
        progress: ((minutesSince - offsetStart) / profile.offset.duration) * 100,
        timeRemaining: profile.offset.duration - (minutesSince - offsetStart),
        nextPhase: 'finished'
      };
    }

    return {
      currentPhase: 'finished',
      progress: 100,
      timeRemaining: 0,
      nextPhase: 'finished'
    };
  };

  function formatDateTimeLocal(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  const resetDoseForm = () => {
    setCustomDosage(
      drug.settings?.defaultDosage?.toString() ||
      drug.dosage?.toString() || ''
    );
    setSelectedTime('now');
    setCustomTime(formatDateTimeLocal(new Date()));
    setOverrideReason('');
  };

  const handleRecordDose = () => {
    if (!customDosage || isNaN(customDosage) || parseFloat(customDosage) <= 0) {
      addAlert('Please enter a valid dosage amount', 'warning');
      return;
    }

    let doseTime = selectedTime === 'now' ? new Date() : new Date(customTime);
    const safetyCheck = checkDoseSafety(drug, doseTime.toISOString());

    if (!safetyCheck.safe && !safetyCheck.inOffsetPhase) {
      setShowOverrideConfirm(true);
      return;
    }

    const newSupply = drug.settings?.trackSupply
      ? Math.max(0, (drug.settings?.currentSupply || 0) - parseFloat(customDosage))
      : drug.settings?.currentSupply;

    const newDose = {
      id: Date.now(),
      timestamp: doseTime.toISOString(),
      dosage: parseFloat(customDosage),
      status: safetyCheck.inOffsetPhase ? 'offset' : 'normal'
    };

    const updatedDrug = {
      ...drug,
      doses: [newDose, ...(drug.doses || [])],
      settings: {
        ...drug.settings,
        currentSupply: newSupply
      }
    };

    onRecordDose(drug.id, updatedDrug);
    setShowDoseModal(false);
    resetDoseForm();

    if (safetyCheck.inOffsetPhase) {
      addAlert('Dose recorded during offset phase - effects may be different', 'info');
    } else {
      addAlert('Dose recorded successfully', 'success');
    }
  };

  const handleOverrideDose = () => {
    if (!overrideReason.trim()) {
      addAlert('Please provide a reason for the override', 'warning');
      return;
    }

    let doseTime = selectedTime === 'now' ? new Date() : new Date(customTime);
    const safetyCheck = checkDoseSafety(drug, doseTime.toISOString());

    const newDose = {
      id: Date.now(),
      timestamp: doseTime.toISOString(),
      dosage: parseFloat(customDosage),
      status: 'override',
      overrideReason,
      safetyChecks: safetyCheck
    };

    const newSupply = drug.settings?.trackSupply
      ? Math.max(0, (drug.settings?.currentSupply || 0) - parseFloat(customDosage))
      : drug.settings?.currentSupply;

    const updatedDrug = {
      ...drug,
      doses: [newDose, ...(drug.doses || [])],
      settings: {
        ...drug.settings,
        currentSupply: newSupply
      }
    };

    onRecordDose(drug.id, updatedDrug);
    setShowOverrideConfirm(false);
    setShowDoseModal(false);
    resetDoseForm();
    addSafetyAlert('Override dose recorded - please be extra careful');
  };

  const handleUpdateDose = (updatedDose) => {
    const updatedDoses = drug.doses.map(dose =>
      dose.id === updatedDose.id ? updatedDose : dose
    );
    const updatedDrug = { ...drug, doses: updatedDoses };
    onRecordDose(drug.id, updatedDrug);
  };

  const handleDeleteDose = (doseId) => {
    const updatedDoses = drug.doses.filter(dose => dose.id !== doseId);
    const updatedDrug = { ...drug, doses: updatedDoses };
    onRecordDose(drug.id, updatedDrug);
    addAlert('Dose record deleted', 'success');
  };

  const getPhaseStyles = (phase) => {
    switch (phase) {
      case 'onset':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'comeup':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-700',
          text: 'text-orange-800 dark:text-orange-200'
        };
      case 'peak':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200'
        };
      case 'offset':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200'
        };
      case 'finished':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-800 dark:text-gray-200'
        };
    }
  };

  const formatTime = (time) => {
    if (!time) return '--:--:--';
    const { hours, minutes, seconds } = time;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <DrugTrackerHeader
        drug={drug}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        lastDoseTime={drug.doses?.[0]?.timestamp}
        currentPhase={currentPhase}
        timeRemaining={timeToNextPhase}
      />

      <DrugTimeline
        lastDoseTime={drug.doses?.[0]?.timestamp}
        drugName={drug.name}
        category={drug.category}
        currentPhase={currentPhase}
        progress={progress}
        timeToNextPhase={timeToNextPhase}
      />

      {drug.settings?.trackSupply && drug.settings.currentSupply <= 5 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 
                     border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <Package className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            Low supply warning: {drug.settings.currentSupply}
            {drug.settings?.defaultDosageUnit || drug.dosageUnit} remaining
          </p>
        </div>
      )}

      <button
        onClick={() => setShowDoseModal(true)}
        disabled={drug.settings?.trackSupply && drug.settings.currentSupply <= 0}
        className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 
                 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 
                 text-white transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusCircle className="w-5 h-5" />
        <span>
          {drug.settings?.trackSupply && drug.settings.currentSupply <= 0
            ? 'No Supply Available'
            : 'Record New Dose'
          }
        </span>
      </button>

      <RecordDoseModal
        isOpen={showDoseModal}
        onClose={() => {
          setShowDoseModal(false);
          resetDoseForm();
        }}
        drug={drug}
        customDosage={customDosage}
        selectedTime={selectedTime}
        customTime={customTime}
        onDosageChange={setCustomDosage}
        onTimeSelect={setSelectedTime}
        onTimeChange={setCustomTime}
        onRecord={handleRecordDose}
        formatDateTimeLocal={formatDateTimeLocal}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        drug={drug}
        settings={drug.settings}
        onSave={(updatedSettings) => {
          onUpdateSettings(drug.id, updatedSettings);
          setShowSettings(false);
        }}
      />

      <OverrideModal
        isOpen={showOverrideConfirm}
        onClose={() => {
          setShowOverrideConfirm(false);
          setOverrideReason('');
        }}
        drug={drug}
        safetyChecks={checkDoseSafety(drug,
          (selectedTime === 'now' ? new Date() : new Date(customTime)).toISOString()
        )}
        overrideReason={overrideReason}
        onReasonChange={setOverrideReason}
        onOverride={handleOverrideDose}
      />

      <Modal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        title="Dose History"
        fullScreen
      >
        <DrugHistory
          doses={drug.doses}
          dosageUnit={drug.settings?.defaultDosageUnit || drug.dosageUnit}
          onUpdateDose={handleUpdateDose}
          onDeleteDose={handleDeleteDose}
        />
      </Modal>

      {/* Additional Safety Information */}
      {currentPhase !== 'none' && currentPhase !== 'finished' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowPhaseDetails(!showPhaseDetails)}
            className="w-full flex items-center justify-between p-3 rounded-lg
                     bg-gray-50 dark:bg-gray-700/50 
                     text-gray-900 dark:text-white
                     hover:bg-gray-100 dark:hover:bg-gray-700 
                     transition-colors"
          >
            <span className="font-medium">Phase Details & Safety</span>
            {showPhaseDetails ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {showPhaseDetails && (
            <div className="space-y-4 p-4 rounded-lg border 
                         border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-800">
              {/* Phase-specific safety info */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Safety Guidelines
                </h4>
                <div className="space-y-3">
                  {profile[currentPhase]?.safetyInfo && (
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-1" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {profile[currentPhase].safetyInfo}
                      </p>
                    </div>
                  )}

                  {/* Vital signs monitoring */}
                  <div className="flex items-start gap-2">
                    <HeartPulse className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Monitor vital signs:
                      {profile[currentPhase]?.vitals?.join(', ') || 'General wellbeing'}
                    </p>
                  </div>

                  {/* Activity recommendations */}
                  <div className="flex items-start gap-2">
                    <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {currentPhase === 'peak'
                        ? 'Avoid strenuous activity'
                        : 'Maintain comfortable activity level'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Next phase preview */}
              {currentPhase !== 'finished' && timeToNextPhase && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Next Phase
                  </h4>
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {timeToNextPhase.nextPhase} phase begins in {formatTime(timeToNextPhase)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interaction Safety Reminder */}
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h4 className="font-medium text-gray-900 dark:text-white">
            Safety Reminders
          </h4>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400">•</span>
            Don't mix with other substances without checking interactions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400">•</span>
            Stay hydrated but don't overdrink
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 dark:text-blue-400">•</span>
            Have a trusted friend available if possible
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DrugTracker;