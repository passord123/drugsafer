import React from 'react';

const DrugHistory = ({ doses, dosageUnit }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString() + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const sortedDoses = [...doses].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  // Group doses
  const groupedDoses = sortedDoses.reduce((groups, dose) => {
    const date = new Date(dose.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(dose);
    return groups;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groupedDoses).map(([date, dailyDoses]) => (
        <div key={date} className="space-y-2">
          <div className="sticky top-0 bg-white p-2 border-b font-medium text-gray-600">
            {date === new Date().toDateString() ? 'Today' :
             date === new Date(Date.now() - 86400000).toDateString() ? 'Yesterday' :
             new Date(date).toLocaleDateString()}
          </div>
          {dailyDoses.map((dose, index) => (
            <div key={dose.id || index} className="flex items-center justify-between px-4 py-2 bg-white">
              <span className="font-medium">{dose.dosage} {dosageUnit}</span>
              <span className="text-sm text-gray-500">
                {date === new Date().toDateString() || 
                 date === new Date(Date.now() - 86400000).toDateString()
                  ? formatTimestamp(dose.timestamp).split(' at ')[1]
                  : formatTimestamp(dose.timestamp).split(' ')[1]
                }
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DrugHistory;