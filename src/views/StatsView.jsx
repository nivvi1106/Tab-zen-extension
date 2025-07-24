import React, { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatsView = () => {
    const [stats, setStats] = useState({ dailyFocus: {}, totalHours: 0 });
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // ... (same as before) ...
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);
        const handleChange = () => setIsDarkMode(mediaQuery.matches);
        mediaQuery.addEventListener('change', handleChange);
        const getStats = async () => {
            const data = await browser.storage.local.get('stats');
            if (data.stats) setStats(data.stats);
        };
        getStats();
        const storageListener = (changes, area) => {
            if (area === 'local' && changes.stats) setStats(changes.stats.newValue);
        };
        browser.storage.onChanged.addListener(storageListener);
        return () => {
            browser.storage.onChanged.removeListener(storageListener);
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const processDataForChart = () => {
        // ... (same as before) ...
        const dailyData = stats.dailyFocus || {};
        const last7Days = Object.keys(dailyData).sort((a,b) => new Date(b) - new Date(a)).slice(0, 7);
        return last7Days.map(date => ({ name: new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric' }), 'Focus (min)': dailyData[date] })).reverse();
    };
    
    const tooltipStyle = isDarkMode 
      ? { backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#e5e7eb' } 
      : { backgroundColor: '#ffffff', border: '1px solid #e5e7eb' };

    return (
        <div className="p-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Productivity Stats</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Total Focus Hours</h2>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.totalHours ? stats.totalHours.toFixed(2) : '0.00'}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-6">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 text-center">Focus Minutes This Week</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={processDataForChart()} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#4b5563' : '#e5e7eb'} />
                        <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                        <YAxis tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }} />
                        <Tooltip contentStyle={tooltipStyle} cursor={false} /> {/* **HOVER FIX IS HERE** */}
                        <Bar dataKey="Focus (min)" fill="#3b82f6" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatsView;
