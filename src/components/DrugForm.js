// src/components/DrugForm.js
import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, X, Plus } from 'lucide-react';

const DrugForm = ({ onAdd, defaultDrugs = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [customDosage, setCustomDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg');
  const [waitingPeriod, setWaitingPeriod] = useState(4);
  const [maxDailyDoses, setMaxDailyDoses] = useState(4);
  const [initialSupply, setInitialSupply] = useState('0');

  const categories = useMemo(() => {
    const drugsArray = Array.isArray(defaultDrugs) ? defaultDrugs : [];
    const cats = new Set(drugsArray.map(drug => drug.category || 'Uncategorized'));
    return ['all', ...Array.from(cats)];
  }, [defaultDrugs]);

  const filteredDrugs = useMemo(() => {
    const drugsArray = Array.isArray(defaultDrugs) ? defaultDrugs : [];
    return drugsArray.filter(drug => {
      const matchesSearch = drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [defaultDrugs, searchQuery, selectedCategory]);

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug);
    setCustomDosage(drug.dosage?.split(' ')[0] || '');
    setDosageUnit(drug.dosage?.split(' ')[1] || 'mg');
    setWaitingPeriod(drug.minTimeBetweenDoses || 4);
    setMaxDailyDoses(drug.maxDailyDoses || 4);
    setShowModal(true);
  };

  const handleAddCustomDrug = () => {
    const customDrug = {
      id: Date.now(),
      name: searchQuery,
      category: 'Custom',
      description: 'Custom medication'
    };
    handleDrugSelect(customDrug);
  };

  const handleAddDrug = () => {
    if (selectedDrug) {
      onAdd({
        ...selectedDrug,
        id: Date.now(),
        doses: [],
        dateAdded: new Date().toISOString(),
        dosage: `${customDosage} ${dosageUnit}`,
        currentSupply: Number(initialSupply),
        minTimeBetweenDoses: Number(waitingPeriod),
        maxDailyDoses: Number(maxDailyDoses),
        settings: {
          defaultDosage: {
            amount: customDosage,
            unit: dosageUnit
          },
          waitingPeriod: Number(waitingPeriod),
          maxDailyDoses: Number(maxDailyDoses),
          currentSupply: Number(initialSupply)
        }
      });
      setShowModal(false);
      setSelectedDrug(null);
      setSearchQuery('');
    }
  };

  return (
    <div className="drug-form bg-white p-6 rounded-lg">
      {/* Search and Category Selection */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medications..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Drug List */}
        <div className="mt-4 space-y-2">
          {filteredDrugs.map(drug => (
            <div
              key={drug.id}
              onClick={() => handleDrugSelect(drug)}
              className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">{drug.name}</h3>
                  <p className="text-sm text-gray-500">{drug.dosage}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}

          {searchQuery && filteredDrugs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No medications found matching your search</p>
              <button
                onClick={handleAddCustomDrug}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add "{searchQuery}" as Custom Medication
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drug Configuration Modal */}
      {showModal && selectedDrug && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-6">{selectedDrug.name}</h2>

            <div className="space-y-6">
              {/* Dosage Configuration */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Default Dosage</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customDosage}
                    onChange={(e) => setCustomDosage(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Amount"
                    min="0"
                    step="any"
                  />
                  <select
                    value={dosageUnit}
                    onChange={(e) => setDosageUnit(e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mg">mg</option>
                    <option value="ml">ml</option>
                    <option value="g">g</option>
                    <option value="tablets">tablets</option>
                  </select>
                </div>
              </div>

              {/* Waiting Period */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Minimum Hours Between Doses
                </label>
                <input
                  type="number"
                  value={waitingPeriod}
                  onChange={(e) => setWaitingPeriod(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.5"
                />
              </div>

              {/* Max Daily Doses */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Maximum Doses per Day
                </label>
                <input
                  type="number"
                  value={maxDailyDoses}
                  onChange={(e) => setMaxDailyDoses(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Initial Supply Amount
                </label>
                <input
                  type="number"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="1"
                />
              </div>

              {selectedDrug.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedDrug.description}</p>
                </div>
              )}

              {selectedDrug.warnings && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-red-700">Warnings</label>
                  <p className="text-red-700">{selectedDrug.warnings}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddDrug}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Add Medication
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedDrug(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugForm;