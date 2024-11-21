import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, X, Plus, AlertCircle } from 'lucide-react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

const DrugForm = ({ onAdd, defaultDrugs = [] }) => {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [customDosage, setCustomDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [waitingPeriod, setWaitingPeriod] = useState(4);
  const [maxDailyDoses, setMaxDailyDoses] = useState(4);
  const [initialSupply, setInitialSupply] = useState('0');
  const [features, setFeatures] = useState({
    supplyManagement: true,
    dailyLimits: true,
    timingRestrictions: true
  });

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

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug);
    setCustomDosage(drug.settings?.defaultDosage || drug.dosage?.split(' ')[0] || '');
    setDosageUnit(drug.settings?.defaultDosageUnit || drug.dosageUnit || 'mg');
    setWaitingPeriod(drug.settings?.minTimeBetweenDoses || 4);
    setMaxDailyDoses(drug.settings?.maxDailyDoses || 4);
    setShowModal(true);
  };

  const DosageDisplay = ({ dosage, instructions }) => (
    <div className="space-y-1">
      {instructions && instructions.split('\n').map((line, index) => (
        <div key={index} className="flex flex-wrap gap-2">
          {line.split(',').map((dose, i) => (
            <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
              {dose.trim()}
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  const handleAddDrug = () => {
    if (!customDosage || customDosage <= 0) {
      alert('Please enter a valid dosage amount');
      return;
    }

    onAdd({
      ...selectedDrug,
      id: Date.now(),
      doses: [],
      dateAdded: new Date().toISOString(),
      dosage: `${customDosage} ${dosageUnit}`,
      settings: {
        defaultDosage: {
          amount: customDosage,
          unit: dosageUnit
        },
        features,
        minTimeBetweenDoses: Number(waitingPeriod),
        maxDailyDoses: Number(maxDailyDoses),
        currentSupply: Number(initialSupply)
      }
    });
    setShowModal(false);
    setSelectedDrug(null);
    setSearchQuery('');
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

  const renderSearchAndCategories = () => (
    <>
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search substances..."
          className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 ${isMobile ? 'pl-12 pr-12 py-3 text-lg' : 'pl-10 pr-4 py-2'
            }`}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
          </button>
        )}
      </div>

      <div className={`flex gap-2 overflow-x-auto ${isMobile ? 'pb-2 scrollbar-hide' : 'pb-2 no-scrollbar'}`}>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap ${selectedCategory === category
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isMobile ? 'px-4 py-2 text-base rounded-full' : 'px-3 py-1 text-sm rounded-full'
              }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </>
  );

  const renderDrugCard = (drug) => (
    <div
      key={drug.id}
      onClick={() => handleDrugSelect(drug)}
      className={`${isMobile
        ? "w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
        : "p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
        }`}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className={`font-medium text-gray-900 ${isMobile ? 'text-lg' : ''}`}>{drug.name}</h3>
          <ChevronDown className={`text-gray-400 ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
        </div>

        {(!isMobile || drug.instructions) && (
          <div className="bg-gray-50 px-3 py-2 rounded">
            <p className="text-sm font-medium text-gray-700 mb-2">Dosage Guidelines:</p>
            <DosageDisplay
              dosage={drug.dosage}
              instructions={drug.instructions}
            />
          </div>
        )}

        <p className={`text-gray-500 ${isMobile ? 'text-sm line-clamp-2' : 'text-sm'}`}>
          {drug.description}
        </p>

        {drug.warnings && (
          <div className={`flex items-start gap-2 ${isMobile ? 'bg-red-50 p-3 rounded-lg' : 'text-red-600'}`}>
            <AlertCircle className={`flex-shrink-0 ${isMobile ? 'w-5 h-5 text-red-500' : 'w-4 h-4 mt-0.5'}`} />
            <p className={`text-sm ${isMobile ? 'text-red-700' : ''}`}>{drug.warnings}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal || !selectedDrug) return null;


    const modalContent = (
      <>
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{selectedDrug.name}</h2>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {selectedDrug.instructions && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Dosage Guidelines</h3>
              <DosageDisplay
                dosage={selectedDrug.dosage}
                instructions={selectedDrug.instructions}
              />
            </div>
          )}

          <div className="space-y-4">
            <label className={`block font-medium ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
              Your Standard Dose
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                className={`flex-1 border rounded-lg focus:ring-2 focus:ring-blue-500 ${isMobile ? 'px-4 py-3 text-lg' : 'px-3 py-2'
                  }`}
                placeholder="Enter amount"
                min="0"
                step="any"
              />
              <select
                value={dosageUnit}
                onChange={(e) => setDosageUnit(e.target.value)}
                className={`border rounded-lg focus:ring-2 focus:ring-blue-500 ${isMobile ? 'px-4 py-3 text-lg' : 'px-3 py-2'
                  }`}
              >
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="tablets">tablets</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className={`block font-medium ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
              Time Between Doses
            </label>
            <input
              type="number"
              value={waitingPeriod}
              onChange={(e) => setWaitingPeriod(e.target.value)}
              className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 ${isMobile ? 'px-4 py-3 text-lg' : 'px-3 py-2'
                }`}
              min="0"
              step="0.5"
              placeholder="Hours"
            />
            <p className="text-sm text-gray-500">Minimum hours to wait between doses</p>
          </div>

          <div className="space-y-4">
            <label className={`block font-medium ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
              Daily Limit
            </label>
            <input
              type="number"
              value={maxDailyDoses}
              onChange={(e) => setMaxDailyDoses(e.target.value)}
              className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 ${isMobile ? 'px-4 py-3 text-lg' : 'px-3 py-2'
                }`}
              min="1"
              placeholder="Maximum doses per day"
            />
            <p className="text-sm text-gray-500">Maximum number of doses in 24 hours</p>
          </div>

          <div className="space-y-4">
            <label className={`block font-medium ${isMobile ? 'text-base' : 'text-sm'} text-gray-700`}>
              Current Supply
            </label>
            <input
              type="number"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              className={`w-full border rounded-lg focus:ring-2 focus:ring-blue-500 ${isMobile ? 'px-4 py-3 text-lg' : 'px-3 py-2'
                }`}
              min="0"
              placeholder="Amount available"
            />
            <p className="text-sm text-gray-500">Track your remaining supply</p>
          </div>

          {selectedDrug.warnings && (
            <div className="bg-red-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className={`text-red-500 ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                <h3 className="font-medium text-red-900">Safety Warning</h3>
              </div>
              <p className="text-red-800">{selectedDrug.warnings}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
          <button
            onClick={handleAddDrug}
            className={`flex-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${isMobile ? 'px-4 py-3 text-lg font-medium' : 'px-4 py-2'
              }`}
          >
            Add Substance
          </button>
          <button
            onClick={() => setShowModal(false)}
            className={`flex-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 ${isMobile ? 'px-4 py-3 text-lg font-medium' : 'px-4 py-2'
              }`}
          >
            Cancel
          </button>
        </div>
      </>
    );

    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
        <div className={`bg-white overflow-y-auto ${isMobile
            ? 'fixed inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh]'
            : 'rounded-lg w-full max-w-md max-h-[90vh] m-auto mt-[10vh]'
          }`}>
          {modalContent}
        </div>
      </div>
    );
  };

  return (
    <div className={`drug-form bg-white ${isMobile ? '' : 'p-4 sm:p-6'}`}>
      <div className={`${isMobile ? 'sticky top-0 bg-white z-10 p-4 space-y-4 border-b' : 'space-y-4'}`}>
        {renderSearchAndCategories()}
      </div>

      <div className={isMobile ? 'divide-y' : 'mt-4 space-y-2'}>
        {filteredDrugs.map(drug => renderDrugCard(drug))}

        {searchQuery && filteredDrugs.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No substances found matching your search</p>
            <button
              onClick={handleAddCustomDrug}
              className={`inline-flex items-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${isMobile ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-base'
                }`}
            >
              <Plus className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
              Add "{searchQuery}"
            </button>
          </div>
        )}
      </div>

      {renderModal()}
    </div>
  );
};

export default DrugForm;