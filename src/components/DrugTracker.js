import React, { useState, useEffect } from 'react';
import { Clock, Settings, AlertTriangle, PlusCircle, History, X, Package } from 'lucide-react';
import DrugTimeline from './DrugTimeline';
import { getSubstanceProfile } from './DrugTimer/timingProfiles';
import { useNavigate } from 'react-router-dom';
import { Alert } from './DrugTimer/Alert';
import MobileModal from './layout/MobileModal';
import DrugHistory from './DrugHistory';
import PropTypes from 'prop-types';


const DrugTracker = ({ drug, onRecordDose, onUpdateSettings }) => {
  // Core state
  const navigate = useNavigate();
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

  // Settings state
  const [standardDose, setStandardDose] = useState(drug.dosage || '');
  const [maxDailyDoses, setMaxDailyDoses] = useState(drug.settings?.maxDailyDoses || 4);
  const [enableSupply, setEnableSupply] = useState(drug.settings?.trackSupply || false);
  const [currentSupply, setCurrentSupply] = useState(drug.settings?.currentSupply || 0);
  const [minTimeBetweenDoses, setMinTimeBetweenDoses] = useState(
    drug.settings?.minTimeBetweenDoses || 4
  );
  const [showTimeline, setShowTimeline] = useState(
    drug.settings?.showTimeline !== undefined ? drug.settings.showTimeline : true
  );

  // Helper function to format date for input
  const formatDateTimeLocal = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };

  // Get the current standard dose
  const getStandardDose = () => {
    return drug.settings?.defaultDosage?.amount || drug.settings?.defaultDosage || drug.dosage || '';
  };

  // Effects
  useEffect(() => {
    if (drug.doses?.[0]) {
      const lastDoseTime = new Date(drug.doses[0].timestamp);
      const interval = setInterval(() => {
        const now = new Date();
        const timeSince = (now - lastDoseTime) / (1000 * 60 * 60);
        setLastDoseTimer(timeSince);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [drug.doses]);

  useEffect(() => {
    const standardDose = getStandardDose();
    setStandardDose(standardDose);
  }, [drug]);
  const addAlert = (type, message, duration = 5000) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, duration);
  };

  const handleSaveSettings = () => {
    const updatedSettings = {
      ...drug.settings,
      defaultDosage: standardDose,
      defaultDosageUnit: drug.dosageUnit,
      maxDailyDoses: Number(maxDailyDoses),
      minTimeBetweenDoses: Number(minTimeBetweenDoses),
      trackSupply: enableSupply,
      currentSupply: enableSupply ? Number(currentSupply) : null,
      showTimeline: showTimeline
    };
    onUpdateSettings(drug.id, updatedSettings);
    setShowSettings(false);
    addAlert('info', 'Settings updated successfully');
  };

  const handleStartEditingDose = () => {
    const standardDose = getStandardDose();
    setCustomDosage(standardDose);
    setCustomTime(formatDateTimeLocal(new Date()));
    setSelectedTime('now');
    setShowDoseModal(true);
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

    return {
      hasTimeRestriction: timeSinceLastDose < drug.settings.minTimeBetweenDoses,
      hasQuotaRestriction: dosesToday >= drug.settings.maxDailyDoses,
      timeSinceLastDose,
      dosesToday
    };
  };

  const getDrugWithDoses = () => {
    const drugs = JSON.parse(localStorage.getItem('drugs') || '[]');
    return drugs.find(d => d.id === drug.id) || drug;
  };

  const handleRecordDose = () => {
    const dosageNum = parseFloat(customDosage);

    if (!customDosage || isNaN(dosageNum) || dosageNum <= 0) {
      addAlert('error', 'Please enter a valid dosage');
      return;
    }

    const newDose = {
      id: Date.now(),
      timestamp: selectedTime === 'now' ? new Date().toISOString() : new Date(customTime).toISOString(),
      dosage: dosageNum,
      status: 'normal'
    };

    // Get current drug data from localStorage
    const drugs = JSON.parse(localStorage.getItem('drugs') || '[]');
    const currentDrug = drugs.find(d => d.id === drug.id);

    if (!currentDrug) {
      addAlert('error', 'Drug not found');
      return;
    }

    // Update drug with new dose
    const updatedDrug = {
      ...currentDrug,
      doses: [newDose, ...(currentDrug.doses || [])],
      settings: {
        ...currentDrug.settings,
        currentSupply: enableSupply
          ? Math.max(0, (currentDrug.settings?.currentSupply || 0) - dosageNum)
          : currentDrug.settings?.currentSupply
      }
    };

    // Update localStorage
    const updatedDrugs = drugs.map(d => d.id === drug.id ? updatedDrug : d);
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));

    // Update parent component
    onRecordDose(drug.id, updatedDrug);

    // Reset UI
    setShowDoseModal(false);
    setCustomDosage('');
    setSelectedTime('now');

    addAlert('success', 'Dose recorded successfully');
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

    // Create the dose data
    const doseData = {
      id: Date.now(),
      timestamp: doseTime.toISOString(),
      dosage: dosageNum,
      status: 'override',
      overrideReason: overrideReason || 'Safety override'
    };

    // Update the doses array
    const updatedDoses = [...(drug.doses || []), doseData].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Update the drug with new doses array
    const updatedDrug = {
      ...drug,
      doses: updatedDoses,
      settings: {
        ...drug.settings,
        currentSupply: newSupply
      }
    };

    // Log the override for record keeping
    const safetyChecks = checkSafetyRestrictions(doseTime);
    const overrideLog = {
      timestamp: doseTime.toISOString(),
      drugId: drug.id,
      drugName: drug.name,
      reason: overrideReason,
      timeSinceLastDose: safetyChecks.timeSinceLastDose,
      dosesToday: safetyChecks.dosesToday
    };

    // Store override log in localStorage
    const overrideLogs = JSON.parse(localStorage.getItem(`${drug.id}_overrides`) || '[]');
    overrideLogs.push(overrideLog);
    localStorage.setItem(`${drug.id}_overrides`, JSON.stringify(overrideLogs));

    // Record the dose with override
    onRecordDose(drug.id, updatedDrug);

    // Reset UI state
    setShowDoseModal(false);
    setShowOverrideConfirm(false);
    setOverrideReason('');
    setCustomDosage('');
    setSelectedTime('now');

    // Show warning alert
    addAlert('warning', 'Dose recorded with safety override', 8000);
  };

  const handleResetTimer = () => {
    const updatedDoses = drug.doses?.filter(dose =>
      dose.id !== drug.doses[0].id
    ) || [];

    onUpdateSettings(drug.id, {
      ...drug.settings,
      doses: updatedDoses
    });

    setShowResetConfirm(false);
    addAlert('info', 'Timer has been reset');
  };

  const calculateDoseStatus = (doseTime, previousDoseTime, minTimeBetweenDoses) => {
    if (!previousDoseTime) return 'normal';
    const doseDate = new Date(doseTime);
    const prevDose = new Date(previousDoseTime);
    const hoursBetween = (doseDate - prevDose) / (1000 * 60 * 60);
    if (hoursBetween < minTimeBetweenDoses / 2) return 'early';
    if (hoursBetween < minTimeBetweenDoses) return 'warning';
    return 'normal';
  };

  const getStatusClass = (status) => {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'normal':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'early':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'override':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Warning';
      case 'early':
        return 'Early';
      case 'override':
        return 'Override';
      default:
        return 'Unknown';
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const renderHistory = () => {
    const currentDrug = getDrugWithDoses();
    return (
      <DrugHistory
        doses={currentDrug.doses || []}
        dosageUnit={currentDrug.settings?.defaultDosage?.unit || currentDrug.dosageUnit || 'mg'}
      />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{drug.name}</h2>
          <p className="text-sm text-gray-500">
            Standard dose: {getStandardDose()} {drug.dosageUnit}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <History className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Supply Status */}
      {enableSupply && (
        <div className={`p-4 rounded-lg border ${drug.settings?.currentSupply <= 0 ? 'bg-red-50 border-red-200' :
          drug.settings?.currentSupply <= 5 ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Current Supply</h3>
              <p className="text-sm mt-1">
                {drug.settings?.currentSupply || 0} {drug.dosageUnit} remaining
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`p-4 rounded-lg border ${alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
              'bg-blue-50 border-blue-200 text-blue-700'
            }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span>{alert.message}</span>
          </div>
        </div>
      ))}

      {/* Drug Timeline */}
      {showTimeline && (
        <DrugTimeline
          lastDoseTime={drug.doses?.[0]?.timestamp}
          drugName={drug.name}
        />
      )}

      {/* History Display */}
      {showHistory && (
        <MobileModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          title="Dose History"
          fullScreen
        >
          {renderHistory()}
        </MobileModal>
      )}

      {/* Record Dose Button */}
      <button
        onClick={handleStartEditingDose}
        className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 
                 bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        disabled={enableSupply && drug.settings?.currentSupply <= 0}
      >
        <PlusCircle className="w-5 h-5" />
        <span>
          {enableSupply && drug.settings?.currentSupply <= 0
            ? 'No Supply Available'
            : 'Record New Dose'
          }
        </span>
      </button>
      {/* Dose Recording Modal */}
      <MobileModal
        isOpen={showDoseModal}
        onClose={() => {
          setShowDoseModal(false);
          setCustomDosage('');
          setSelectedTime('now');
        }}
        title="Record Dose"
        fullScreen
      >
        <div className="p-4 space-y-6">
          {/* Dosage Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Dose Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {drug.dosageUnit}
              </span>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Time Taken
            </label>
            <div className="flex gap-2">
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="now">Just now</option>
                <option value="custom">Custom time</option>
              </select>
              {selectedTime === 'custom' && (
                <input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  max={formatDateTimeLocal(new Date())}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Safety Warnings */}
          {drug.warnings && (
            <div className="bg-red-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-red-900">Safety Warning</h3>
              </div>
              <p className="text-red-800">{drug.warnings}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <button
            onClick={handleRecordDose}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Record
          </button>
          <button
            onClick={() => {
              setShowDoseModal(false);
              setCustomDosage('');
              setSelectedTime('now');
            }}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </MobileModal>

      {/* Safety Override Modal */}
      <MobileModal
        isOpen={showOverrideConfirm}
        onClose={() => {
          setShowOverrideConfirm(false);
          setOverrideReason('');
        }}
        title="Safety Override"
        fullScreen
      >
        <div className="p-4 space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Safety Override Required</h3>
              <p className="mt-2 text-gray-600">
                {safetyChecks?.hasTimeRestriction &&
                  `Time since last dose: ${safetyChecks.timeSinceLastDose.toFixed(1)} hours`}
                {safetyChecks?.hasQuotaRestriction &&
                  `Daily dose limit (${drug.settings.maxDailyDoses}) reached`}
              </p>
            </div>
          </div>

          <textarea
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            placeholder="Please provide a reason for override (optional)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
            rows={3}
          />

          {drug.warnings && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {drug.warnings}
            </div>
          )}

          <div className="sticky bottom-0 bg-white pt-4 flex gap-3">
            <button
              onClick={handleOverrideDose}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Override Safety Check
            </button>
            <button
              onClick={() => {
                setShowOverrideConfirm(false);
                setOverrideReason('');
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </MobileModal>

      {/* Settings Modal */}
      <MobileModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Drug Settings"
        fullScreen
      >
        <div className="p-4 space-y-6">
          {/* Timeline Toggle */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showTimeline}
                onChange={(e) => setShowTimeline(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Show Effect Timeline
              </span>
            </label>
            <p className="text-xs text-gray-500">
              Displays visual timeline of drug effects and safety information
            </p>
          </div>

          {/* Standard Dose Setting */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Standard Dose ({drug.dosageUnit})
            </label>
            <input
              type="number"
              value={standardDose}
              onChange={(e) => setStandardDose(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="any"
            />
          </div>

          {/* Time Between Doses Setting */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Minimum Hours Between Doses
            </label>
            <input
              type="number"
              value={minTimeBetweenDoses}
              onChange={(e) => setMinTimeBetweenDoses(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.5"
            />
          </div>

          {/* Max Daily Doses Setting */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Maximum Doses per Day
            </label>
            <input
              type="number"
              value={maxDailyDoses}
              onChange={(e) => setMaxDailyDoses(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {/* Supply Management */}
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableSupply}
                onChange={(e) => setEnableSupply(e.target.checked)}
                className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Track Supply
              </span>
            </label>

            {enableSupply && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Supply ({drug.dosageUnit})
                </label>
                <input
                  type="number"
                  value={currentSupply}
                  onChange={(e) => setCurrentSupply(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="any"
                />
              </div>
            )}
          </div>

          {/* Safety Information */}
          {drug.warnings && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{drug.warnings}</p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button
            onClick={handleSaveSettings}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Save Settings
          </button>
          <button
            onClick={() => setShowSettings(false)}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </MobileModal>

      {/* Reset Timer Modal */}
      <MobileModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset Timer"
        fullScreen
      >
        <div className="p-4 space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reset Timer</h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to reset the timer? This will remove the last recorded dose.
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-4 flex gap-3">
            <button
              onClick={handleResetTimer}
              className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Reset Timer
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </MobileModal>
    </div>
  );
}

DrugTracker.propTypes = {
  drug: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    dosage: PropTypes.string,
    dosageUnit: PropTypes.string,
    warnings: PropTypes.string,
    doses: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        timestamp: PropTypes.string,
        dosage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        status: PropTypes.string,
        overrideReason: PropTypes.string
      })
    ),
    settings: PropTypes.shape({
      defaultDosage: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.shape({
          amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          unit: PropTypes.string
        })
      ]),
      maxDailyDoses: PropTypes.number,
      minTimeBetweenDoses: PropTypes.number,
      trackSupply: PropTypes.bool,
      currentSupply: PropTypes.number,
      showTimeline: PropTypes.bool
    })
  }).isRequired,
  onRecordDose: PropTypes.func.isRequired,
  onUpdateSettings: PropTypes.func.isRequired
};

DrugTracker.defaultProps = {
  drug: {
    doses: [],
    settings: {
      maxDailyDoses: 4,
      minTimeBetweenDoses: 4,
      trackSupply: false,
      showTimeline: true
    }
  }
};

export default DrugTracker; 