import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const EnhancedDrugHistory = ({ doses = [], dosageUnit = 'mg' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
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

  const formatTime = (timestamp) => {
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
        <div className="flex gap-2">
          {[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'Past Week' },
            { value: 'month', label: 'Past Month' },
            { value: 'all', label: 'All Time' }
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${selectedPeriod === period.value 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {period.label}
            </button>
          ))}
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
              {dailyDoses.map((dose, index) => (
                <div key={dose.id || index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <Clock className="w-4 h-4 text-blue-500" />
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
                    
                    {dose.status === 'override' && (
                      <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700">Override</span>
                      </div>
                    )}
                    
                    {dose.status === 'normal' && (
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-700">Normal</span>
                      </div>
                    )}
                  </div>
                  
                  {dose.overrideReason && (
                    <div className="mt-2 text-sm text-gray-500 pl-12">
                      Reason: {dose.overrideReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedDrugHistory;