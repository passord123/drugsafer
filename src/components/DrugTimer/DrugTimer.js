// src/components/DrugTimer/DrugTimer.js
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const DrugTimer = ({ drug, lastDoseTime }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [status, setStatus] = useState('safe');

  useEffect(() => {
    if (!lastDoseTime) return;

    const updateTimer = () => {
      const now = new Date();
      const lastDose = new Date(lastDoseTime);
      const minTimeMs = drug.settings.minTimeBetweenDoses * 60 * 60 * 1000;
      const nextDoseTime = new Date(lastDose.getTime() + minTimeMs);
      
      if (now >= nextDoseTime) {
        setStatus('safe');
        setTimeRemaining(null);
        return;
      }

      const diff = nextDoseTime - now;
      setTimeRemaining({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      });
      
      const hoursSinceLastDose = (now - lastDose) / (1000 * 60 * 60);
      if (hoursSinceLastDose < drug.settings.minTimeBetweenDoses / 2) {
        setStatus('active');
      } else {
        setStatus('waiting');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastDoseTime, drug.settings.minTimeBetweenDoses]);

  if (!lastDoseTime) {
    return (
      <div className="p-4 text-center text-gray-500">
        No doses recorded
      </div>
    );
  }

  const statusStyles = {
    active: 'bg-red-50 border-red-200 text-red-700',
    waiting: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    safe: 'bg-green-50 border-green-200 text-green-700'
  };

  return (
    <div className={`p-4 rounded-lg border ${statusStyles[status]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'active' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Clock className="w-5 h-5" />
          )}
          <div>
            <h3 className="font-medium">
              {status === 'active' ? 'Drug Active' :
               status === 'waiting' ? 'Waiting Period' :
               'Safe to Dose'}
            </h3>
            <p className="text-sm mt-1">
              Last dose: {new Date(lastDoseTime).toLocaleTimeString()}
            </p>
          </div>
        </div>
        {timeRemaining && (
          <div className="text-2xl font-bold">
            {timeRemaining.hours}h {timeRemaining.minutes}m
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugTimer;