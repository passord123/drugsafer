import React, { useState, useEffect } from 'react';
import {
  Clock, Settings, PlusCircle, History, AlertTriangle, Package,
  Timer, ArrowUpCircle, Activity, HeartPulse, Shield
} from 'lucide-react';
import { useAlerts } from '../contexts/AlertContext';
import { getDrugTiming, checkDoseSafety } from '../utils/drugTimingHandler';
import { timingProfiles, categoryProfiles, getSubstanceProfile } from './DrugTimer/timingProfiles';
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
  const [customDosage, setCustomDosage] = useState(drug.settings?.defaultDosage?.toString() || drug.dosage?.toString() || '');
  const [selectedTime, setSelectedTime] = useState('now');
  const [customTime, setCustomTime] = useState(formatDateTimeLocal(new Date()));
  const [overrideReason, setOverrideReason] = useState('');

  // Timeline state
  const [currentPhase, setCurrentPhase] = useState('none');
  const [progress, setProgress] = useState(0);
  const [timeToNextPhase, setTimeToNextPhase] = useState(null);
  const [showPhaseDetails, setShowPhaseDetails] = useState(false);

  const { addSafetyAlert, addAlert } = useAlerts();

  // Reset form state when drug changes
  useEffect(() => {
    resetDoseForm();
  }, [drug.id]); // Reset when drug changes

  // Get drug profile with timing info
  const getDrugProfile = (drugName) => {
    return timingProfiles[drugName.toLowerCase()] ||
           categoryProfiles[drug.category] ||
           timingProfiles.default;
  };

  const profile = getDrugProfile(drug.name);

  // Update timeline effect
  useEffect(() => {
    if (!drug.doses?.[0]) return;

    const updateTimeline = () => {
      const now = new Date();
      const lastDose = new Date(drug.doses[0].timestamp);
      const minutesSince = (now - lastDose) / (1000 * 60);
      
      let currentPhase;
      let progress;
      let nextPhase;
      let timeRemaining;

      const offsetStart = profile.onset.duration + 
                         profile.comeup.duration + 
                         profile.peak.duration;

      if (minutesSince < profile.onset.duration) {
        currentPhase = 'onset';
        progress = (minutesSince / profile.onset.duration) * 100;
        nextPhase = 'comeup';
        timeRemaining = profile.onset.duration - minutesSince;
      } else if (minutesSince < offsetStart) {
        currentPhase = minutesSince < (profile.onset.duration + profile.comeup.duration) ? 'comeup' : 'peak';
        const phaseStart = currentPhase === 'comeup' ? profile.onset.duration : profile.onset.duration + profile.comeup.duration;
        const phaseDuration = currentPhase === 'comeup' ? profile.comeup.duration : profile.peak.duration;
        progress = ((minutesSince - phaseStart) / phaseDuration) * 100;
        nextPhase = currentPhase === 'comeup' ? 'peak' : 'offset';
        timeRemaining = phaseDuration - (minutesSince - phaseStart);
      } else if (minutesSince < profile.total()) {
        currentPhase = 'offset';
        progress = ((minutesSince - offsetStart) / profile.offset.duration) * 100;
        nextPhase = 'finished';
        timeRemaining = profile.offset.duration - (minutesSince - offsetStart);
      } else {
        currentPhase = 'finished';
        progress = 100;
        nextPhase = 'finished';
        timeRemaining = 0;
      }

      const hours = Math.floor(timeRemaining / 60);
      const minutes = Math.floor(timeRemaining % 60);
      const seconds = Math.floor((timeRemaining % 1) * 60);

      setCurrentPhase(currentPhase);
      setProgress(progress);
      setTimeToNextPhase({ hours, minutes, seconds, nextPhase });
    };

    updateTimeline();
    const interval = setInterval(updateTimeline, 1000);
    return () => clearInterval(interval);
  }, [drug.doses, profile]);

  function formatDateTimeLocal(date) {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  const resetDoseForm = () => {
    setCustomDosage(drug.settings?.defaultDosage?.toString() || drug.dosage?.toString() || '');
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

    // Calculate new supply if tracking is enabled
    const newSupply = drug.settings?.trackSupply
      ? Math.max(0, (drug.settings?.currentSupply || 0) - parseFloat(customDosage))
      : drug.settings?.currentSupply;

    // Create new dose record
    const newDose = {
      id: Date.now(),
      timestamp: doseTime.toISOString(),
      dosage: parseFloat(customDosage),
      status: safetyCheck.inOffsetPhase ? 'offset' : 'normal'
    };

    // Update drug record
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
  };

  return (
    <div className="p-6 space-y-6">
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

      {/* Supply Warning */}
      {drug.settings?.trackSupply && drug.settings.currentSupply <= 5 && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Package className="w-5 h-5 text-yellow-500" />
          <p className="text-sm text-yellow-700">
            Low supply warning: {drug.settings.currentSupply} {drug.settings?.defaultDosageUnit || drug.dosageUnit} remaining
          </p>
        </div>
      )}

      {/* Record Dose Button */}
      <button
        onClick={() => setShowDoseModal(true)}
        className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 
                 bg-blue-500 hover:bg-blue-600 text-white transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={drug.settings?.trackSupply && drug.settings.currentSupply <= 0}
      >
        <PlusCircle className="w-5 h-5" />
        <span>
          {drug.settings?.trackSupply && drug.settings.currentSupply <= 0
            ? 'No Supply Available'
            : 'Record New Dose'
          }
        </span>
      </button>

      {/* Record Dose Modal */}
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

      {/* Settings Modal */}
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

      {/* Override Modal */}
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

      {/* History Modal */}
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
    </div>
  );
};

export default DrugTracker;