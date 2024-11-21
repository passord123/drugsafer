// src/pages/MedicationStats.js
import React from 'react';
import { Calendar, Clock, AlertTriangle, Activity, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Progress = ({ value, warning }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div 
      className={`h-2.5 rounded-full transition-all duration-300 ${
        warning ? 'bg-red-500' : 'bg-green-500'
      }`}
      style={{ width: `${value}%` }}
    />
  </div>
);

const StatCard = ({ icon: Icon, title, value, subtitle, warning, success }) => (
  <div className={`${
    warning ? 'bg-red-50' : 
    success ? 'bg-green-50' : 
    'bg-white'
  } p-6 rounded-lg border shadow-sm`}>
    <div className="flex items-center space-x-3 mb-4">
      <div className={`${
        warning ? 'bg-red-100' : 
        success ? 'bg-green-100' : 
        'bg-blue-50'
      } p-2 rounded-lg`}>
        <Icon className={`w-6 h-6 ${
          warning ? 'text-red-500' : 
          success ? 'text-green-500' : 
          'text-blue-500'
        }`} />
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
    </div>
    <p className={`text-3xl font-bold ${
      warning ? 'text-red-600' : 
      success ? 'text-green-600' : 
      'text-gray-900'
    } mb-1`}>
      {value}
    </p>
    {subtitle && (
      <p className={`text-sm ${
        warning ? 'text-red-600' : 
        success ? 'text-green-600' : 
        'text-gray-500'
      }`}>
        {subtitle}
      </p>
    )}
  </div>
);

const MedicationStats = () => {
  const medications = JSON.parse(localStorage.getItem('drugs') || '[]');

  const calculateSoberStreak = (doses) => {
    if (!doses?.length) return Infinity; // No doses = continuous sober streak
    
    const now = new Date();
    const lastDose = new Date(doses[0].timestamp);
    
    // Calculate days since last dose
    const diffTime = Math.abs(now - lastDose);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const calculateLongestSoberPeriod = (doses) => {
    if (!doses?.length) return Infinity;
    if (doses.length === 1) return calculateSoberStreak(doses);

    let longestStreak = 0;
    const sortedDoses = [...doses].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    for (let i = 1; i < sortedDoses.length; i++) {
      const currentDose = new Date(sortedDoses[i].timestamp);
      const prevDose = new Date(sortedDoses[i-1].timestamp);
      const diffTime = Math.abs(currentDose - prevDose);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      longestStreak = Math.max(longestStreak, diffDays);
    }

    // Check current streak
    const currentStreak = calculateSoberStreak(doses);
    return Math.max(longestStreak, currentStreak);
  };

  const calculateStats = () => {
    const stats = medications.reduce((acc, med) => {
      const currentSoberStreak = calculateSoberStreak(med.doses);
      const longestSoberPeriod = calculateLongestSoberPeriod(med.doses);
      
      // Check doses in last 24 hours
      const last24Hours = new Date();
      last24Hours.setHours(last24Hours.getHours() - 24);
      const recentDoses = med.doses?.filter(dose => 
        new Date(dose.timestamp) > last24Hours
      ).length || 0;

      return {
        medicationCount: acc.medicationCount + 1,
        currentSoberStreak: Math.min(acc.currentSoberStreak, currentSoberStreak),
        longestSoberPeriod: Math.min(acc.longestSoberPeriod, longestSoberPeriod),
        recentDoses: acc.recentDoses + recentDoses,
        medications: [
          ...acc.medications,
          {
            ...med,
            currentSoberStreak,
            recentDoses
          }
        ]
      };
    }, {
      medicationCount: 0,
      currentSoberStreak: Infinity,
      longestSoberPeriod: Infinity,
      recentDoses: 0,
      medications: []
    });

    return {
      ...stats,
      currentSoberStreak: stats.currentSoberStreak === Infinity ? 0 : stats.currentSoberStreak,
      longestSoberPeriod: stats.longestSoberPeriod === Infinity ? 0 : stats.longestSoberPeriod
    };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Recovery Progress</h1>
        <p className="text-gray-600">Track your journey to medication independence</p>
      </div>

      {/* Sober Streak */}
      <div className="mb-8 bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-medium text-green-700">Current Progress</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-4xl font-bold text-green-600 mb-2">
              {stats.currentSoberStreak} days
            </p>
            <p className="text-green-600">Current medication-free streak</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-600 mb-2">
              {stats.longestSoberPeriod} days
            </p>
            <p className="text-green-600">Longest period without medication</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Activity}
          title="Recent Usage"
          value={stats.recentDoses}
          subtitle="Doses in last 24 hours"
          warning={stats.recentDoses > 0}
        />
        <StatCard
          icon={Calendar}
          title="Medications Tracked"
          value={stats.medicationCount}
          subtitle="Currently monitoring"
        />
        <StatCard
          icon={Shield}
          title="Milestone"
          value={`${stats.longestSoberPeriod} days`}
          subtitle="Longest medication-free period"
          success={stats.longestSoberPeriod > 0}
        />
      </div>

      {/* Individual Medication Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Individual Progress</h2>
        <div className="grid gap-4">
          {stats.medications.map(med => (
            <div 
              key={med.id} 
              className={`${
                med.recentDoses > 0 ? 'bg-red-50 border-red-200' : 'bg-white'
              } p-6 rounded-lg border shadow-sm`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">{med.name}</h3>
                  <p className="text-sm text-gray-500">
                    {med.currentSoberStreak} days without use
                  </p>
                </div>
                <Link
                  to="/drugs"
                  className="text-blue-500 text-sm hover:text-blue-600"
                >
                  View Details
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-2xl font-bold ${
                    med.recentDoses > 0 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {med.recentDoses}
                  </p>
                  <p className="text-sm text-gray-500">Doses in last 24h</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {med.currentSoberStreak}
                  </p>
                  <p className="text-sm text-gray-500">Days medication-free</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedicationStats;