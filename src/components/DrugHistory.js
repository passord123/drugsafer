import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Edit2, Trash2, X, Info } from 'lucide-react';
import MobileModal from './modals/MobileModal';

const DrugHistory = ({ doses = [], dosageUnit = 'mg', onUpdateDose, onDeleteDose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [editingDose, setEditingDose] = useState(null);
  const [editDosage, setEditDosage] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editReason, setEditReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doseToDelete, setDoseToDelete] = useState(null);

  if (!Array.isArray(doses) || doses.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No doses recorded yet</p>
      </div>
    );
  }

  // Sort doses by date
  const sortedDoses = [...doses].sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Filter doses based on selected period
  const filterDoses = () => {
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);

    switch (selectedPeriod) {
      case 'today':
        return sortedDoses.filter(dose =>
          new Date(dose.timestamp) >= new Date(today)
        );
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return sortedDoses.filter(dose =>
          new Date(dose.timestamp) >= weekAgo
        );
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return sortedDoses.filter(dose =>
          new Date(dose.timestamp) >= monthAgo
        );
      default:
        return sortedDoses;
    }
  };

  const filteredDoses = filterDoses();

  // Group doses by date
  const groupedDoses = filteredDoses.reduce((groups, dose) => {
    const date = new Date(dose.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(dose);
    return groups;
  }, {});

  const handleEditClick = (dose) => {
    setEditingDose(dose);
    setEditDosage(dose.dosage.toString());
    setEditTime(new Date(dose.timestamp).toISOString().slice(0, 16));
    setEditReason(dose.overrideReason || '');
  };

  const handleSaveEdit = () => {
    if (!editingDose || !editDosage || !onUpdateDose) return;

    const updatedDose = {
      ...editingDose,
      dosage: parseFloat(editDosage),
      timestamp: new Date(editTime).toISOString(),
      overrideReason: editReason || editingDose.overrideReason
    };

    onUpdateDose(updatedDose);
    setEditingDose(null);
    setEditDosage('');
    setEditTime('');
    setEditReason('');
  };

  const handleDeleteClick = (dose) => {
    setDoseToDelete(dose);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!doseToDelete || !onDeleteDose) return;

    onDeleteDose(doseToDelete.id);
    setShowDeleteConfirm(false);
    setDoseToDelete(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      {/* Period Selector */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 z-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'Past Week' },
            { value: 'month', label: 'Past Month' },
            { value: 'all', label: 'All Time' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                ${selectedPeriod === period.value
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-sm text-blue-600 dark:text-blue-300">Total Doses</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-200">
              {filteredDoses.length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="text-sm text-yellow-600 dark:text-yellow-300">Override Doses</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">
              {filteredDoses.filter(dose => dose.status === 'override').length}
            </div>
          </div>
        </div>
      </div>

      {/* Doses List */}
      <div className="divide-y dark:divide-gray-700">
        {Object.entries(groupedDoses).map(([date, dailyDoses]) => (
          <div key={date} className="bg-white dark:bg-gray-800">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({dailyDoses.length} doses)
              </span>
            </div>

            <div className="divide-y dark:divide-gray-700">
              {dailyDoses.map((dose) => (
                <div key={dose.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${dose.status === 'override'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : 'bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                        <Clock className={`w-4 h-4 ${dose.status === 'override'
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-blue-500 dark:text-blue-400'
                          }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {typeof dose.dosage === 'number' ? dose.dosage : parseFloat(dose.dosage)} {dosageUnit}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(dose.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {dose.status === 'override' && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                          <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                          <span className="text-sm text-red-700 dark:text-red-300">Override</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleEditClick(dose)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 
                                 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(dose)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 
                                 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {dose.overrideReason && (
                    <div className="mt-2 ml-12 flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Override reason: {dose.overrideReason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dose Modal */}
      <MobileModal
        isOpen={Boolean(editingDose)}
        onClose={() => {
          setEditingDose(null);
          setEditDosage('');
          setEditTime('');
          setEditReason('');
        }}
        title="Edit Dose"
      >
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Dosage Amount
            </label>
            <input
              type="number"
              value={editDosage}
              onChange={(e) => setEditDosage(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              step="any"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Time Taken
            </label>
            <input
              type="datetime-local"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 
                       text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              max={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {editingDose?.status === 'override' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Override Reason
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 
                       text-white px-4 py-2 rounded-lg transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditingDose(null);
                setEditDosage('');
                setEditTime('');
                setEditReason('');
              }}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </MobileModal>

      {/* Delete Confirmation Modal */}
      <MobileModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDoseToDelete(null);
        }}
        title="Delete Dose"
      >
        <div className="p-4 space-y-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this dose record? This action cannot be undone.
              </p>
              {doseToDelete?.status === 'override' && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  This was an override dose. The override record will also be deleted.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 
                       text-white px-4 py-2 rounded-lg transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDoseToDelete(null);
              }}
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </MobileModal>
    </div>
  );
};

export default DrugHistory;