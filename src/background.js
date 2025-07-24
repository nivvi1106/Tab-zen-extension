// The importScripts line has been REMOVED from the top of this file.

(function() {
    "use strict";
    const DEFAULT_SETTINGS = {
        focusDuration: 25, breakDuration: 5, pomodoroCycles: 4,
        blacklist: ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com'],
        whitelist: [], focusMode: 'blacklist', strictMode: false,
        stats: { dailyFocus: {}, totalHours: 0 }
    };
    let timerState = 'paused', sessionType = 'focus', timeLeft = 0, currentCycle = 1;

    // --- Sound Playing Logic (More Robust) ---
    async function playSound(soundFile) {
      const url = browser.runtime.getURL(soundFile);
      if (await browser.offscreen.hasDocument()) {
        browser.runtime.sendMessage({ command: 'play-sound', sound: url });
      } else {
        await browser.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'To notify the user when a timer session ends.',
        });
        // Allow time for the offscreen document to load before sending the message
        setTimeout(() => {
            browser.runtime.sendMessage({ command: 'play-sound', sound: url });
        }, 100);
      }
    }

    // ... (updateTimeLeft, startTimer, pauseTimer, resetTimer are the same) ...
    async function updateTimeLeftFromSettings() {
        const settings = await browser.storage.local.get(['focusDuration', 'breakDuration']);
        timeLeft = (sessionType === 'focus' ? settings.focusDuration : settings.breakDuration) * 60;
    }
    async function startTimer() {
        if (timeLeft <= 0) await updateTimeLeftFromSettings();
        timerState = 'running';
        browser.alarms.create('pomodoroTimer', { delayInMinutes: 0, periodInMinutes: 1 / 60 });
        if (sessionType === 'focus') browser.action.setBadgeText({ text: '' });
        return { timeLeft, timerState, sessionType, currentCycle };
    }
    async function pauseTimer() {
        timerState = 'paused';
        browser.alarms.clear('pomodoroTimer');
        return { timeLeft, timerState, sessionType, currentCycle };
    }
    async function resetTimer() {
        await pauseTimer();
        sessionType = 'focus';
        currentCycle = 1;
        await updateTimeLeftFromSettings();
        browser.action.setBadgeText({ text: '' });
        return { timeLeft, timerState, sessionType, currentCycle };
    }

    browser.runtime.onInstalled.addListener(async () => {
        const data = await browser.storage.local.get();
        await browser.storage.local.set({ ...DEFAULT_SETTINGS, ...data });
        await updateTimeLeftFromSettings();
        browser.action.setBadgeBackgroundColor({ color: '#22c55e' });
    });

    browser.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name !== 'pomodoroTimer') return;
        timeLeft--;
        if (timeLeft < 0) {
            await advanceSession();
        } else {
            try {
                await browser.runtime.sendMessage({ command: 'updateTimer', timeLeft });
            } catch (e) {
                if (!e.message.includes('Could not establish connection')) {
                    console.error(e);
                }
            }

        }
    });

    async function advanceSession() {
        const settings = await browser.storage.local.get();
        let newState;

        if (sessionType === 'focus') {
            const stats = settings.stats || { dailyFocus: {}, totalHours: 0 };
            const today = new Date().toISOString().split('T')[0];
            stats.dailyFocus[today] = (stats.dailyFocus[today] || 0) + settings.focusDuration;
            stats.totalHours = (stats.totalHours || 0) + settings.focusDuration / 60;
            await browser.storage.local.set({ stats });
            
            if (currentCycle >= settings.pomodoroCycles) {
                browser.action.setBadgeText({ text: 'Done!' });
                newState = await resetTimer();
            } else {
                sessionType = 'break';
                browser.action.setBadgeText({ text: 'Break' });
                newState = await startTimer();
            }
        } else {
            sessionType = 'focus';
            currentCycle++;
            browser.action.setBadgeText({ text: '' });
            newState = await startTimer();
        }

        // 🔊 Still playing alarm sound
        playSound('alarm.mp3');

        // 🧹 Notification removed here

        await browser.runtime.sendMessage({ command: 'sessionChanged', ...newState }).catch(() => {});
    }


    // ... (onMessage and onUpdated listeners are the same) ...
    browser.runtime.onMessage.addListener(async (message) => {
        const { strictMode } = await browser.storage.local.get('strictMode');
        switch (message.command) {
            case 'startTimer': return startTimer();
            case 'pauseTimer': return (strictMode && sessionType === 'focus') ? { error: 'Cannot pause in Strict Mode' } : pauseTimer();
            case 'resetTimer': return resetTimer();
            case 'getTimerState': return { timeLeft, timerState, sessionType, currentCycle };
        }
    });
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
        if (timerState !== 'running' || sessionType !== 'focus' || !tab.url || !tab.url.startsWith('http')) return;
        const settings = await browser.storage.local.get(['blacklist', 'whitelist', 'focusMode']);
        const url = new URL(tab.url);
        const isBlacklisted = (settings.blacklist || []).some(site => url.href.includes(site));
        const isWhitelisted = (settings.whitelist || []).length > 0 && (settings.whitelist || []).some(site => url.href.includes(site));
        let shouldBlock = (settings.focusMode === 'blacklist' && isBlacklisted) || (settings.focusMode === 'whitelist' && !isWhitelisted);
        if (shouldBlock) {
            try { await browser.tabs.update(tabId, { url: browser.runtime.getURL('blocked.html') }); } catch (e) {}
        }
    });
})();


