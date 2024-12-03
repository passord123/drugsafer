import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Clock, Shield, Package, Activity, 
         AlertTriangle, X, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkDoseSafety, getDrugTiming, calculateNextDoseTime } from '../utils/drugTimingHandler';
import ConfirmationDialog from './ConfirmationDialog';

const DrugList = ({ drugs = [], onDelete, onSelect, selectedDrug }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [drugToDelete, setDrugToDelete] = useState(null);
  const [expandedDrug, setExpandedDrug] = useState(null);

  const handleDeleteClick = (e, drug) => {
    e.stopPropagation();
    setDrugToDelete(drug);
    setShowDeleteConfirm(true);
  };

  const getTodaysDoses = (drug) => {
    if (!drug.doses?.length) return 0;
    const today = new Date().setHours(0, 0, 0, 0);
    return drug.doses.filter(dose => {
      const doseDate = new Date(dose.timestamp).setHours(0, 0, 0, 0);
      return doseDate === today;
    }).length;
  };

  const getMaxDailyDoses = (drug) => {
    return drug.settings?.maxDailyDoses || Math.floor(24 / (drug.settings?.minTimeBetweenDoses || 4));
  };

  const formatTimeSince = (timestamp) => {
    if (!timestamp) return 'No doses';
    
    const now = new Date();
    const doseTime = new Date(timestamp);
    const diffMs = now - doseTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      return diffMinutes === 0 ? 'Just now' : `${diffMinutes}m ago`;
    }
    return `${diffHours}h ${diffMinutes}m ago`;
  };

  const getDrugStatus = (drug) => {
    if (!drug.doses?.length) return { safe: true };
    const now = new Date();
    return checkDoseSafety(drug, now.toISOString());
  };

  const calculateNextDose = (drug) => {
    if (!drug.doses?.[0]) return 'Ready';
    const nextDoseTime = calculateNextDoseTime(drug, drug.doses[0].timestamp);
    if (!nextDoseTime) return 'Ready';

    const now = new Date();
    if (now >= nextDoseTime) return 'Ready';
    
    const timeDiff = nextDoseTime - now;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getStatusColor = (status) => {
    if (status.quotaExceeded) {
      return 'text-red-600 dark:text-red-400';
    }
    if (!status.safe) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  const filteredDrugs = useMemo(() => {
    return drugs.filter(drug =>
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [drugs, searchQuery]);

  if (!drugs.length) {
    return (
      <div className="text-center py-12">
        <Link
          to="/add"
          className="inline-flex items-center gap-2 px-6 py-3 
                   bg-blue-500 dark:bg-blue-600 text-white rounded-lg 
                   hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Your First Drug
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 
                        text-gray-400 dark:text-gray-500 w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your drugs..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 
                   border border-gray-200 dark:border-gray-600 rounded-lg
                   text-gray-900 dark:text-white
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                     text-gray-400 dark:text-gray-500
                     hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Drug List */}
      <div className="space-y-4">
        {filteredDrugs.map((drug) => {
          const status = getDrugStatus(drug);
          const todaysDoses = getTodaysDoses(drug);
          const maxDoses = getMaxDailyDoses(drug);
          const isExpanded = expandedDrug === drug.id;

          return (
            <div
              key={drug.id}
              onClick={() => onSelect(drug)}
              className={`p-6 border rounded-lg cursor-pointer transition-all duration-200
                ${selectedDrug?.id === drug.id
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400'
                }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-lg">
                      {drug.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {drug.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDrug(isExpanded ? null : drug.id);
                      }}
                      className="p-2 text-gray-400 dark:text-gray-500 
                               hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, drug)}
                      className="p-2 text-gray-400 dark:text-gray-500 
                               hover:text-red-500 dark:hover:text-red-400
                               hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span>Last dose: {formatTimeSince(drug.doses?.[0]?.timestamp)}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Timer className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className={getStatusColor(status)}>
                      Next safe dose: {calculateNextDose(drug)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Activity className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    <span className={todaysDoses >= maxDoses ? 'text-red-600 dark:text-red-400' : ''}>
                      Today: {todaysDoses} of {maxDoses} doses
                    </span>
                  </div>

                  {drug.settings?.trackSupply && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Package className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      <span>{drug.settings.currentSupply} {drug.settings.defaultDosageUnit} remaining</span>
                    </div>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {drug.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {drug.description}
                      </p>
                    )}

                    {drug.instructions && (
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          {drug.instructions}
                        </p>
                      </div>
                    )}

                    {drug.warnings && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-200">
                          {drug.warnings}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Safety Status */}
                {(status.quotaExceeded || !status.safe) && (
                  <div className={`flex items-start gap-2 p-3 rounded-lg ${
                    status.quotaExceeded 
                      ? 'bg-red-50 dark:bg-red-900/20' 
                      : 'bg-yellow-50 dark:bg-yellow-900/20'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      status.quotaExceeded 
                        ? 'text-red-500 dark:text-red-400' 
                        : 'text-yellow-500 dark:text-yellow-400'
                    }`} />
                    <p className={`text-sm ${
                      status.quotaExceeded 
                        ? 'text-red-700 dark:text-red-200' 
                        : 'text-yellow-700 dark:text-yellow-200'
                    }`}>
                      {status.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDrugToDelete(null);
        }}
        onConfirm={() => {
          onDelete(drugToDelete.id);
          setShowDeleteConfirm(false);
          setDrugToDelete(null);
        }}
        title="Delete Drug"
        message={`Are you sure you want to delete ${drugToDelete?.name}? This action cannot be undone.`}
        type="danger"
      />

      {/* Mobile Quick Add Button */}
      <div className="lg:hidden fixed right-4 bottom-20 z-20">
        <Link
          to="/add"
          className="flex items-center justify-center w-14 h-14 
                   bg-blue-500 dark:bg-blue-600 text-white rounded-full shadow-lg
                   hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
};

export default DrugList;