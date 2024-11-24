import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle, Edit2, Trash2, X, Info } from 'lucide-react';
import MobileModal from './layout/MobileModal';

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
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No doses recorded yet</p>
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
    
    switch(selectedPeriod) {
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

  const formatTimeForDisplay = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Period Selector */}
      <div className="sticky top-0 bg-white border-b p-4 z-10">
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
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600">Total Doses</div>
            <div className="text-2xl font-bold text-blue-700">
              {filteredDoses.length}
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-sm text-yellow-600">Override Doses</div>
            <div className="text-2xl font-bold text-yellow-700">
              {filteredDoses.filter(dose => dose.status === 'override').length}
            </div>
          </div>
        </div>
      </div>

      {/* Doses List */}
      <div className="divide-y">
        {Object.entries(groupedDoses).map(([date, dailyDoses]) => (
          <div key={date} className="bg-white">
            <div className="px-4 py-3 bg-gray-50 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-700">
                {new Date(date).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="text-sm text-gray-500">
                ({dailyDoses.length} doses)
              </span>
            </div>
            
            <div className="divide-y">
              {dailyDoses.map((dose) => (
                <div key={dose.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        dose.status === 'override' 
                          ? 'bg-red-50' 
                          : 'bg-blue-50'
                      }`}>
                        <Clock className={`w-4 h-4 ${
                          dose.status === 'override'
                            ? 'text-red-500'
                            : 'text-blue-500'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {typeof dose.dosage === 'number' ? dose.dosage : parseFloat(dose.dosage)} {dosageUnit}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(dose.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {dose.status === 'override' && (
                        <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700">Override</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => handleEditClick(dose)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(dose)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {dose.overrideReason && (
                    <div className="mt-2 ml-12 flex items-start gap-2 text-sm text-gray-500">
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
            <label className="block text-sm font-medium text-gray-700">
              Dosage Amount
            </label>
            <input
              type="number"
              value={editDosage}
              onChange={(e) => setEditDosage(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              step="any"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Time Taken
            </label>
            <input
              type="datetime-local"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              max={new Date().toISOString().slice(0, 16)}
            />
          </div>

          {editingDose?.status === 'override' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Override Reason
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
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
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
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
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
              <p className="mt-1 text-gray-600">
                Are you sure you want to delete this dose record? This action cannot be undone.
              </p>
              {doseToDelete?.status === 'override' && (
                <p className="mt-2 text-sm text-red-600">
                  This was an override dose. The override record will also be deleted.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDoseToDelete(null);
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
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