import React, { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Play, Pause, RefreshCw } from 'lucide-react';

const TimerDisplay = ({ title, time, isActive }) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    return (
        <div className={`w-1/2 flex flex-col items-center justify-center rounded-lg p-4 transition-all duration-300 ${isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <p className={`text-sm font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
            <p className={`text-4xl font-bold ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{formatTime(time)}</p>
        </div>
    );
};

const TimerView = () => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerState, setTimerState] = useState('paused');
    const [sessionType, setSessionType] = useState('focus');
    const [currentCycle, setCurrentCycle] = useState(1);
    const [durations, setDurations] = useState({ focusDuration: 25, breakDuration: 5, pomodoroCycles: 4 });
    const [isStrictMode, setIsStrictMode] = useState(false);

    const updateState = (state) => {
        if (!state) return;
        setTimeLeft(state.timeLeft);
        setTimerState(state.timerState);
        setSessionType(state.sessionType);
        setCurrentCycle(state.currentCycle);
    };

    useEffect(() => {
        const setup = async () => {
            const settings = await browser.storage.local.get(['focusDuration', 'breakDuration', 'pomodoroCycles', 'strictMode']);
            setDurations(settings);
            setIsStrictMode(settings.strictMode);
            const state = await browser.runtime.sendMessage({ command: 'getTimerState' });
            updateState(state);
        };
        setup();
        const messageListener = (message) => {
            if (message.command === 'updateTimer') setTimeLeft(message.timeLeft);
            if (message.command === 'sessionChanged') updateState(message);
        };
        browser.runtime.onMessage.addListener(messageListener);
        const storageListener = (changes, area) => {
            if (area === 'local' && changes.strictMode) setIsStrictMode(changes.strictMode.newValue);
        };
        browser.storage.onChanged.addListener(storageListener);
        return () => {
            browser.runtime.onMessage.removeListener(messageListener);
            browser.storage.onChanged.removeListener(storageListener);
        };
    }, []);

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        const newDurations = { ...durations, [name]: parseInt(value) || 0 };
        setDurations(newDurations);
        browser.storage.local.set(newDurations).then(() => {
            browser.runtime.sendMessage({ command: 'resetTimer' }).then(updateState);
        });
    };

    const handleStartPause = () => {
        const command = timerState === 'running' ? 'pauseTimer' : 'startTimer';
        browser.runtime.sendMessage({ command }).then(updateState);
    };

    const handleReset = () => {
        browser.runtime.sendMessage({ command: 'resetTimer' }).then(updateState);
    };
    
    // **STRICT MODE FIX IS HERE**: This variable determines if buttons should be disabled.
    const isLocked = timerState === 'running' && sessionType === 'focus' && isStrictMode;

    return (
        <div className="flex flex-col h-full text-center">
            <div className="flex space-x-2">
                <TimerDisplay title="Focus" time={sessionType === 'focus' ? timeLeft : durations.focusDuration * 60} isActive={sessionType === 'focus'} />
                <TimerDisplay title="Break" time={sessionType === 'break' ? timeLeft : durations.breakDuration * 60} isActive={sessionType === 'break'} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm my-4">Cycle {currentCycle} of {durations.pomodoroCycles}</p>

            <div className="space-y-4 text-left">
                <div className="grid grid-cols-3 gap-3 items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Focus Time (min)</label>
                    <input type="number" name="focusDuration" value={durations.focusDuration} onChange={handleSettingsChange} className="col-span-2 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
                <div className="grid grid-cols-3 gap-3 items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Break Time (min)</label>
                    <input type="number" name="breakDuration" value={durations.breakDuration} onChange={handleSettingsChange} className="col-span-2 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
                <div className="grid grid-cols-3 gap-3 items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cycles</label>
                    <input type="number" name="pomodoroCycles" value={durations.pomodoroCycles} onChange={handleSettingsChange} className="col-span-2 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                </div>
            </div>

            <div className="flex-grow flex items-center justify-center space-x-4">
                 <button onClick={handleReset} disabled={isLocked} className={`p-5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <RefreshCw size={28} />
                </button>
                <button onClick={handleStartPause} disabled={isLocked && timerState === 'running'} className={`p-5 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all ${isLocked && timerState === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {timerState === 'running' ? <Pause size={28} /> : <Play size={28} />}
                </button>
            </div>
        </div>
    );
};

export default TimerView;