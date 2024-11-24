import React, { useState, useEffect } from 'react';
import { Clock, Settings, PlusCircle, History, AlertTriangle, Import } from 'lucide-react';
import DrugTimeline from './DrugTimeline';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';
import { useNavigate } from 'react-router-dom';
import { Alert } from './DrugTimer/Alert';
import MobileModal from './layout/MobileModal';
import DrugHistory from './DrugHistory';
import { getDrugTiming, checkDoseSafety } from '../utils/drugTimingHandler';
import { useAlerts } from '../contexts/AlertContext';
import DrugTrackerHeader from './DrugTrackerHeader';
import VitalSignsSection from './VitalSignsSection';
import SupplyStatus from './SupplyStatus';
import SettingsModal from './modals/SettingsModal';
import RecordDoseModal from './modals/RecordDoseModal';
import OverrideModal from './modals/OverrideModal';

const DrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  const navigate = useNavigate();
  const { addAlert: showAlert } = useAlerts();

  // Core state
  const [showSettings, setShowSettings] = useState(false);
  const [customDosage, setCustomDosage] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [lastDoseTimer, setLastDoseTimer] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [safetyChecks, setSafetyChecks] = useState(null);

  // Time tracking state
  const [selectedTime, setSelectedTime] = useState('now');
  const [customTime, setCustomTime] = useState(new Date().toISOString().slice(0, 16));
  const [currentPhase, setCurrentPhase] = useState('none');

  // Settings state
  const [standardDose, setStandardDose] = useState(drug.dosage || '');
  const [maxDailyDoses, setMaxDailyDoses] = useState(drug.settings?.maxDailyDoses || 4);
  const [enableSupply, setEnableSupply] = useState(drug.settings?.trackSupply || false);
  const [currentSupply, setCurrentSupply] = useState(drug.settings?.currentSupply || 0);
  const [showTimeline, setShowTimeline] = useState(
    drug.settings?.showTimeline !== undefined ? drug.settings.showTimeline : true
  );

  // Timing profile state
  const [useRecommendedTiming, setUseRecommendedTiming] = useState(true);
  const [minTimeBetweenDoses, setMinTimeBetweenDoses] = useState(
    drug.settings?.minTimeBetweenDoses || getDefaultTiming()
  );

  useEffect(() => {
    if (showDoseModal) {
      setCustomDosage(drug.settings?.defaultDosage || drug.dosage || '');
    }
  }, [showDoseModal, drug]);

  // Get timing from profile
  function getDefaultTiming() {
    const profile = timingProfiles[drug.name.toLowerCase()] ||
      categoryProfiles[drug.category] ||
      timingProfiles.default;
    return profile.total() / 60; // Convert minutes to hours
  }

  // Format duration for display
  function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  }

  // Get the timing profile for the current drug
  const getTimingProfile = () => {
    return timingProfiles[drug.name.toLowerCase()] ||
      categoryProfiles[drug.category] ||
      timingProfiles.default;
  };

  // Helper function to format date for input
  const formatDateTimeLocal = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  // Add Alert handling
  const addAlert = (type, message, duration = 5000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, duration);
  };

  const checkSafetyRestrictions = (doseTime = new Date()) => {
    const today = doseTime.toDateString();
    const dosesToday = drug.doses?.filter(dose =>
      new Date(dose.timestamp).toDateString() === today
    ).length || 0;

    const lastDose = drug.doses?.[0]?.timestamp;
    const timeSinceLastDose = lastDose
      ? (doseTime - new Date(lastDose)) / (1000 * 60 * 60)
      : Infinity;

    const profile = getTimingProfile();
    const recommendedHours = profile.total() / 60;

    return {
      hasTimeRestriction: timeSinceLastDose < (useRecommendedTiming ? recommendedHours : drug.settings.minTimeBetweenDoses),
      hasQuotaRestriction: dosesToday >= drug.settings.maxDailyDoses,
      timeSinceLastDose,
      dosesToday,
      recommendedWaitTime: recommendedHours
    };
  };

  const handleUpdateDose = (updatedDose) => {
    const updatedDoses = drug.doses.map(dose =>
      dose.id === updatedDose.id ? updatedDose : dose
    );

    updatedDoses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const updatedDrug = {
      ...drug,
      doses: updatedDoses
    };

    onRecordDose(drug.id, updatedDrug);
    showAlert('success', 'Dose updated successfully');
  };

  const handleDeleteDose = (doseId) => {
    const updatedDoses = drug.doses.filter(dose => dose.id !== doseId);
    const updatedDrug = {
      ...drug,
      doses: updatedDoses
    };

    onRecordDose(drug.id, updatedDrug);
    showAlert('success', 'Dose deleted successfully');
  };

  const handleSaveSettings = () => {
    const profile = getTimingProfile();
    const totalMinutes = profile.total();

    const updatedSettings = {
      ...drug.settings,
      defaultDosage: standardDose,
      defaultDosageUnit: drug.dosageUnit,
      maxDailyDoses: Number(maxDailyDoses),
      minTimeBetweenDoses: useRecommendedTiming ? totalMinutes / 60 : Number(minTimeBetweenDoses),
      trackSupply: enableSupply,
      currentSupply: enableSupply ? Number(currentSupply) : null,
      showTimeline: showTimeline,
      useRecommendedTiming
    };

    onUpdateSettings(drug.id, updatedSettings);
    setShowSettings(false);
    addAlert('info', 'Settings updated successfully');
  };

  const handleOverrideDose = () => {
    if (!customDosage || !drug) return;

    const dosageNum = parseFloat(customDosage);

    let doseTime;
    if (selectedTime === 'now') {
      doseTime = new Date();
    } else {
      doseTime = new Date(customTime);
    }

    const newSupply = enableSupply
      ? Math.max(0, (drug.settings?.currentSupply || 0) - dosageNum)
      : null;

    const doseData = {
      id: Date.now(),
      timestamp: doseTime.toISOString(),
      dosage: dosageNum,
      status: 'override',
      overrideReason: overrideReason || 'Safety override'
    };

    const updatedDrug = {
      ...drug,
      doses: [doseData, ...(drug.doses || [])],
      settings: {
        ...drug.settings,
        currentSupply: newSupply
      }
    };

    const safetyChecks = checkSafetyRestrictions(doseTime);
    const overrideLog = {
      timestamp: doseTime.toISOString(),
      drugId: drug.id,
      drugName: drug.name,
      reason: overrideReason,
      timeSinceLastDose: safetyChecks.timeSinceLastDose,
      dosesToday: safetyChecks.dosesToday
    };

    onRecordDose(drug.id, updatedDrug);

    setShowDoseModal(false);
    setShowOverrideConfirm(false);
    setOverrideReason('');
    setCustomDosage('');
    setSelectedTime('now');

    addAlert('warning', 'Dose recorded with safety override', 8000);
  };

  const handleRecordDose = () => {
    const dosageNum = parseFloat(customDosage);

    if (!customDosage || isNaN(dosageNum) || dosageNum <= 0) {
      addAlert('error', 'Please enter a valid dosage');
      return;
    }

    let doseTime;
    if (selectedTime === 'now') {
      doseTime = new Date();
    } else {
      doseTime = new Date(customTime);
    }

    const safetyCheck = checkSafetyRestrictions(doseTime);
    if (safetyCheck.hasTimeRestriction || safetyCheck.hasQuotaRestriction) {
      setSafetyChecks(safetyCheck);
      setShowOverrideConfirm(true);
      return;
    }

    const newDose = {
      id: Date.now(),
      timestamp: doseTime.toISOString(),
      dosage: dosageNum,
      status: 'normal'
    };

    const updatedDrug = {
      ...drug,
      doses: [newDose, ...(drug.doses || [])],
      settings: {
        ...drug.settings,
        currentSupply: enableSupply
          ? Math.max(0, (drug.settings?.currentSupply || 0) - dosageNum)
          : drug.settings?.currentSupply
      }
    };

    onRecordDose(drug.id, updatedDrug);

    setShowDoseModal(false);
    setCustomDosage('');
    setSelectedTime('now');

    addAlert('success', 'Dose recorded successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* System Alerts */}
      <div id="alerts-container">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            onDismiss={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
          />
        ))}
      </div>

      {/* Drug Tracker Header */}
      <DrugTrackerHeader
        drug={drug}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
        lastDoseTime={drug.doses?.[0]?.timestamp}
      />

      {/* Timeline */}
      <DrugTimeline
        lastDoseTime={drug.doses?.[0]?.timestamp}
        drugName={drug.name}
      />

      {/* Supply Status */}
      <SupplyStatus drug={drug} />

      {/* Record Dose Button */}
      <button
        onClick={() => setShowDoseModal(true)}
        className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 
           bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        disabled={drug.settings?.trackSupply && drug.settings?.currentSupply <= 0}
      >
        <PlusCircle className="w-5 h-5" />
        <span>
          {drug.settings?.trackSupply && drug.settings?.currentSupply <= 0
            ? 'No Supply Available'
            : 'Record New Dose'
          }
        </span>
      </button>

      {/* Settings Modal */}
      <SettingsModal
      isOpen={showSettings}
      onClose={() => setShowSettings(false)}
      drug={drug}
      settings={{
        showTimeline,
        standardDose,
        maxDailyDoses,
        useRecommendedTiming,
        minTimeBetweenDoses,
        enableSupply,
        currentSupply
      }}
      onSave={handleSaveSettings}
      onUpdate={{
        setShowTimeline,
        setStandardDose,
        setMaxDailyDoses,
        setUseRecommendedTiming,
        setMinTimeBetweenDoses,
        setEnableSupply,
        setCurrentSupply
      }}
    />

      {/* History Modal */}
      <MobileModal
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
    </MobileModal>

      {/* Dose Recording Modal */}
      <RecordDoseModal
      isOpen={showDoseModal}
      onClose={() => {
        setShowDoseModal(false);
        setCustomDosage('');
        setSelectedTime('now');
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

      {/* Override Confirmation Modal */}
      <OverrideModal
      isOpen={showOverrideConfirm}
      onClose={() => {
        setShowOverrideConfirm(false);
        setOverrideReason('');
      }}
      drug={drug}
      safetyChecks={safetyChecks}
      overrideReason={overrideReason}
      onReasonChange={setOverrideReason}
      onOverride={handleOverrideDose}
    />
    </div>
  );
};

export default DrugTracker;