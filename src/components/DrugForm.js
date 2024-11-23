import React, { useState, useMemo } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '../contexts/AlertContext';
import MobileModal from './layout/MobileModal';
import { timingProfiles, categoryProfiles } from './DrugTimer/timingProfiles';

const DrugForm = ({ onAdd, defaultDrugs = [] }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDrugDetails, setShowDrugDetails] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [customDosage, setCustomDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [waitingPeriod, setWaitingPeriod] = useState(4);
  const [maxDailyDoses, setMaxDailyDoses] = useState(4);
  const [initialSupply, setInitialSupply] = useState('0');
  const [formErrors, setFormErrors] = useState({});
  const [enableSupply, setEnableSupply] = useState(false);
  const [currentSupply, setCurrentSupply] = useState('0');
  const [useRecommendedTiming, setUseRecommendedTiming] = useState(true);
  const [recommendedTime, setRecommendedTime] = useState(4);

  const getRecommendedTiming = (drugName, category) => {
    const profile = timingProfiles[drugName.toLowerCase()] ||
      categoryProfiles[category] ||
      timingProfiles.default;

    // Get total duration in minutes from the profile's total() function
    const totalDuration = profile.total();
    // Convert to hours and round up
    return Math.ceil(totalDuration / 60);
  };

  const { addAlert } = useAlerts();

  const handleAddDrug = () => {
    if (!selectedDrug) return;

    const existingDrugs = JSON.parse(localStorage.getItem('drugs') || '[]');

    // Calculate timing values based on profile
    const recommendedTime = getRecommendedTiming(selectedDrug.name, selectedDrug.category);

    const newDrug = {
      id: Date.now(),
      name: selectedDrug.name,
      category: selectedDrug.category || 'Custom',
      dosage: customDosage,
      dosageUnit: dosageUnit,
      description: selectedDrug.description || '',
      instructions: selectedDrug.instructions || '',
      warnings: selectedDrug.warnings || '',
      dateAdded: new Date().toISOString(),
      doses: [],
      settings: {
        defaultDosage: customDosage,
        defaultDosageUnit: dosageUnit,
        minTimeBetweenDoses: useRecommendedTiming ? recommendedTime : Number(waitingPeriod),
        maxDailyDoses: Number(maxDailyDoses),
        trackSupply: enableSupply,
        currentSupply: enableSupply ? Number(currentSupply) : null,
        useRecommendedTiming: useRecommendedTiming
      }
    };

    const updatedDrugs = [...existingDrugs, newDrug];
    localStorage.setItem('drugs', JSON.stringify(updatedDrugs));

    navigate('/drugs');
  };

  const categories = useMemo(() => {
    const uniqueCats = new Set(defaultDrugs.map(drug => drug.category));
    return ['all', ...Array.from(uniqueCats)];
  }, [defaultDrugs]);

  const filteredDrugs = useMemo(() => {
    return defaultDrugs.filter(drug => {
      const matchesSearch = drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [defaultDrugs, searchQuery, selectedCategory]);

  const validateDrugForm = (values) => {
    const errors = {};

    if (!values.customDosage) {
      errors.dosage = 'Dosage is required';
    } else if (parseFloat(values.customDosage) <= 0) {
      errors.dosage = 'Dosage must be greater than 0';
    } else if (parseFloat(values.customDosage) > 1000) {
      errors.dosage = 'Dosage seems unusually high, please verify';
    }

    if (!values.waitingPeriod) {
      errors.waitingPeriod = 'Waiting period is required';
    } else if (parseFloat(values.waitingPeriod) < 0) {
      errors.waitingPeriod = 'Waiting period cannot be negative';
    }

    if (!values.maxDailyDoses) {
      errors.maxDailyDoses = 'Maximum daily doses is required';
    } else if (parseInt(values.maxDailyDoses) <= 0) {
      errors.maxDailyDoses = 'Maximum daily doses must be at least 1';
    }

    if (enableSupply) {
      if (values.currentSupply === '') {
        errors.currentSupply = 'Current supply is required when supply tracking is enabled';
      } else if (parseFloat(values.currentSupply) < 0) {
        errors.currentSupply = 'Supply cannot be negative';
      }
    }

    return errors;
  };

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug);
    setCustomDosage(drug.settings?.defaultDosage || drug.dosage || '');
    setDosageUnit(drug.settings?.defaultDosageUnit || drug.dosageUnit || 'mg');

    // Calculate recommended time from timing profile instead of using drugs.json
    const recommendedTime = getRecommendedTiming(drug.name, drug.category);
    setRecommendedTime(recommendedTime);

    // If using recommended timing, set the waiting period to the recommended time
    if (useRecommendedTiming) {
      setWaitingPeriod(recommendedTime);
    } else {
      // Otherwise use the drug's settings or default
      setWaitingPeriod(drug.settings?.minTimeBetweenDoses || 4);
    }

    setMaxDailyDoses(drug.settings?.maxDailyDoses || Math.floor(24 / recommendedTime));
    setShowDrugDetails(true);
  };

  const handleAddCustomDrug = () => {
    const customDrug = {
      id: Date.now(),
      name: searchQuery,
      category: 'Custom',
      description: 'Custom substance',
      warnings: "Please research appropriate dosage and safety information for this substance"
    };
    handleDrugSelect(customDrug);
  };

  const resetForm = () => {
    setSelectedDrug(null);
    setCustomDosage('');
    setDosageUnit('mg');
    setWaitingPeriod(4);
    setMaxDailyDoses(4);
    setInitialSupply('0');
    setSearchQuery('');
    setShowDrugDetails(false);
    setFormErrors({});
    setEnableSupply(true);
    setCurrentSupply('0');
  };

  return (
    <div className="bg-white h-full">
      <div className="sticky top-0 z-10 bg-white border-b p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search substances..."
            className="w-full pl-10 pr-10 py-3 border rounded-lg text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-base
                ${selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y">
        {filteredDrugs.map(drug => (
          <div
            key={drug.id}
            onClick={() => handleDrugSelect(drug)}
            className="p-4 hover:bg-gray-50 active:bg-gray-100"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{drug.name}</h3>
                <span className="text-sm text-gray-500">{drug.category}</span>
              </div>

              {drug.instructions && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  {drug.instructions.split('\n').map((line, index) => (
                    <div key={index} className="flex flex-wrap gap-2">
                      {line.split(',').map((dose, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                          {dose.trim()}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-gray-500 line-clamp-2">
                {drug.description}
              </p>

              {drug.warnings && (
                <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{drug.warnings}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {searchQuery && filteredDrugs.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No substances found matching your search</p>
            <button
              onClick={handleAddCustomDrug}
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg text-lg"
            >
              Add "{searchQuery}"
            </button>
          </div>
        )}
      </div>

      <MobileModal
        isOpen={showDrugDetails}
        onClose={() => {
          setShowDrugDetails(false);
          resetForm();
        }}
        title={selectedDrug?.name || "Add Drug"}
        fullScreen
      >
        <div className="p-4 space-y-6">
          {/* Standard Dose */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Standard Dose
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                className="flex-1 input-primary"
                placeholder="Amount"
                min="0"
                step="any"
              />
              <select
                value={dosageUnit}
                onChange={(e) => setDosageUnit(e.target.value)}
                className="w-24 input-primary"
              >
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="tablets">tablets</option>
              </select>
            </div>
            {formErrors.dosage && (
              <p className="text-sm text-red-600">{formErrors.dosage}</p>
            )}
          </div>

          {/* Hours Between Doses with Recommended Timing */}
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useRecommendedTiming}
                onChange={(e) => {
                  setUseRecommendedTiming(e.target.checked);
                  if (e.target.checked) {
                    setWaitingPeriod(recommendedTime);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Recommended Time Between Doses
              </span>
            </label>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Hours Between Doses
              </label>
              <input
                type="number"
                value={useRecommendedTiming ? recommendedTime : waitingPeriod}
                onChange={(e) => setWaitingPeriod(e.target.value)}
                className="w-full input-primary"
                min="0"
                step="0.5"
                disabled={useRecommendedTiming}
                placeholder="Minimum hours between doses"
              />
              {formErrors.waitingPeriod && (
                <p className="text-sm text-red-600">{formErrors.waitingPeriod}</p>
              )}
              {useRecommendedTiming && (
                <p className="text-sm text-gray-500">
                  Based on total duration: {recommendedTime} hours
                </p>
              )}
            </div>
          </div>

          {/* Daily Limit */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Daily Limit
            </label>
            <input
              type="number"
              value={maxDailyDoses}
              onChange={(e) => setMaxDailyDoses(e.target.value)}
              className="w-full input-primary"
              min="1"
              placeholder="Maximum doses per day"
            />
            {formErrors.maxDailyDoses && (
              <p className="text-sm text-red-600">{formErrors.maxDailyDoses}</p>
            )}
          </div>

          {/* Supply Tracking */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enableSupply}
                onChange={(e) => setEnableSupply(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Track Supply</span>
            </label>

            {enableSupply && (
              <div className="mt-2">
                <input
                  type="number"
                  value={currentSupply}
                  onChange={(e) => setCurrentSupply(e.target.value)}
                  className="w-full input-primary"
                  min="0"
                  placeholder="Initial supply amount"
                />
                {formErrors.currentSupply && (
                  <p className="text-sm text-red-600">{formErrors.currentSupply}</p>
                )}
              </div>
            )}
          </div>

          {/* Safety Warnings */}
          {selectedDrug?.warnings && (
            <div className="bg-red-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-red-900">Safety Warning</h3>
              </div>
              <p className="text-red-800">{selectedDrug.warnings}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-2">
          <button
            onClick={handleAddDrug}
            className="flex-1 btn-primary"
          >
            Add Drug
          </button>
          <button
            onClick={() => {
              setShowDrugDetails(false);
              resetForm();
            }}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
        </div>
      </MobileModal>
    </div>
  );
};

export default DrugForm;