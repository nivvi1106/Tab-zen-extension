// import React, { useState, useEffect, useCallback } from 'react';
// import browser from 'webextension-polyfill';
// import { Trash2 } from 'lucide-react';

// const SettingsView = () => {
//     const [settings, setSettings] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [newBlacklistItem, setNewBlacklistItem] = useState('');
//     const [newWhitelistItem, setNewWhitelistItem] = useState('');
//     const [saveConfirmKey, setSaveConfirmKey] = useState(0);

//     useEffect(() => {
//         browser.storage.local.get().then(data => {
//             setSettings(data);
//             setIsLoading(false);
//         });
//     }, []);

//     useEffect(() => {
//         if (saveConfirmKey > 0) {
//             const timer = setTimeout(() => setSaveConfirmKey(0), 2000);
//             return () => clearTimeout(timer);
//         }
//     }, [saveConfirmKey]);

//     const handleSave = useCallback(async () => {
//         if (!settings) return;
//         await browser.storage.local.set(settings);
//         await browser.runtime.sendMessage({ command: 'resetTimer' });
//         setSaveConfirmKey(Date.now());
//     }, [settings]);

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         const val = type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value;
//         setSettings(prev => ({ ...prev, [name]: val }));
//     };

//     // **LIST UPDATE FIX IS HERE**
//     const handleListChange = (listName, item, action) => {
//         setSettings(currentSettings => {
//             const currentList = currentSettings[listName] || [];
//             if (action === 'add') {
//                 const trimmedItem = item.trim();
//                 if (!trimmedItem || currentList.includes(trimmedItem)) {
//                     return currentSettings; // No change if item is empty or already exists
//                 }
//                 const newList = [...currentList, trimmedItem];
//                 const oppositeListName = listName === 'blacklist' ? 'whitelist' : 'blacklist';
//                 const oppositeList = currentSettings[oppositeListName]?.filter(i => i !== trimmedItem) || [];
//                 return { ...currentSettings, [listName]: newList, [oppositeListName]: oppositeList };
//             } else { // 'remove' action
//                 const newList = currentList.filter(i => i !== item);
//                 return { ...currentSettings, [listName]: newList };
//             }
//         });
//     };

//     if (isLoading) {
//         return <div className="flex justify-center items-center h-full"><p className="dark:text-white">Loading...</p></div>;
//     }

//     return (
//         <div className="h-full flex flex-col relative">
//              {/* **CONFIRMATION MESSAGE FIX IS HERE**: Moved back to the top */}
//              {saveConfirmKey > 0 && (
//                 <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-semibold py-1 px-3 rounded-full shadow-lg z-50">
//                     Changes saved!
//                 </div>
//             )}

//             <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center flex-shrink-0">Blocker Settings</h1>
//             <div className="flex-grow overflow-y-auto space-y-8 px-2">
                
//                 {/* All settings inputs */}
//                 <div>
//                     <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Focus Mode Strategy</h2>
//                     <select name="focusMode" value={settings.focusMode} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
//                         <option value="blacklist">Block distracting sites (Blacklist)</option>
//                         <option value="whitelist">Allow only specific sites (Whitelist)</option>
//                     </select>
//                 </div>

//                 <div>
//                     <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Blacklist</h2>
//                     <div className="flex gap-2">
//                         <input type="text" value={newBlacklistItem} onChange={(e) => setNewBlacklistItem(e.target.value)} placeholder="Add domain or URL" className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
//                         <button onClick={() => { handleListChange('blacklist', newBlacklistItem, 'add'); setNewBlacklistItem(''); }} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Add</button>
//                     </div>
//                     <ul className="mt-2 space-y-1 max-h-24 overflow-y-auto">
//                         {(settings.blacklist || []).map(site => (
//                             <li key={site} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
//                                 <span className="text-gray-700 dark:text-gray-200 break-all">{site}</span> 
//                                 <button onClick={() => handleListChange('blacklist', site, 'remove')} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 flex-shrink-0 ml-2">
//                                     <Trash2 size={16} />
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//                  <div>
//                     <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Whitelist</h2>
//                      <div className="flex gap-2">
//                         <input type="text" value={newWhitelistItem} onChange={(e) => setNewWhitelistItem(e.target.value)} placeholder="Add domain or URL" className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
//                         <button onClick={() => { handleListChange('whitelist', newWhitelistItem, 'add'); setNewWhitelistItem(''); }} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Add</button>
//                     </div>
//                     <ul className="mt-2 space-y-1 max-h-24 overflow-y-auto">
//                         {(settings.whitelist || []).map(site => (
//                             <li key={site} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
//                                <span className="text-gray-700 dark:text-gray-200 break-all">{site}</span> 
//                                 <button onClick={() => handleListChange('whitelist', site, 'remove')} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 flex-shrink-0 ml-2">
//                                     <Trash2 size={16} />
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//                 <div className="pt-4 border-t dark:border-gray-700">
//                      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Strict Mode</h2>
//                      <div className="flex items-start bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-lg">
//                         <input id="strictMode" type="checkbox" name="strictMode" checked={settings.strictMode} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 mt-1" />
//                         <div className="ml-3">
//                            <label htmlFor="strictMode" className="block text-sm font-medium text-yellow-800 dark:text-yellow-200">Enable Strict Mode</label>
//                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Once a focus session starts, you cannot pause the timer or change the blocklists.</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Save Button */}
//                 <div className="pt-4 pb-6">
//                     <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all text-lg">
//                         Save Changes
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SettingsView;




import React, { useState, useEffect, useCallback } from 'react';
import browser from 'webextension-polyfill';
import { Trash2 } from 'lucide-react';

const SettingsView = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newBlacklistItem, setNewBlacklistItem] = useState('');
    const [newWhitelistItem, setNewWhitelistItem] = useState('');
    const [showSaveConfirm, setSaveConfirmKey] = useState(0);

    // **STRICT MODE FIX**: State to hold the current timer status
    const [timerStatus, setTimerStatus] = useState({ timerState: 'paused', sessionType: 'focus' });

    useEffect(() => {
        // Fetch both the settings and the current timer status when the page loads
        const loadData = async () => {
            const [settingsData, timerStateData] = await Promise.all([
                browser.storage.local.get(),
                browser.runtime.sendMessage({ command: 'getTimerState' })
            ]);
            setSettings(settingsData);
            setTimerStatus(timerStateData);
            setIsLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (showSaveConfirm > 0) {
            const timer = setTimeout(() => setSaveConfirmKey(0), 2000);
            return () => clearTimeout(timer);
        }
    }, [showSaveConfirm]);

    const handleSave = useCallback(async () => {
        if (!settings) return;
        await browser.storage.local.set(settings);
        await browser.runtime.sendMessage({ command: 'resetTimer' });
        setSaveConfirmKey(Date.now());
    }, [settings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value;
        setSettings(prev => ({ ...prev, [name]: val }));
    };

    const handleListChange = (listName, item, action) => {
        setSettings(currentSettings => {
            const currentList = currentSettings[listName] || [];
            if (action === 'add') {
                const trimmedItem = item.trim();
                if (!trimmedItem || currentList.includes(trimmedItem)) {
                    return currentSettings;
                }
                const newList = [...currentList, trimmedItem];
                const oppositeListName = listName === 'blacklist' ? 'whitelist' : 'blacklist';
                const oppositeList = currentSettings[oppositeListName]?.filter(i => i !== trimmedItem) || [];
                return { ...currentSettings, [listName]: newList, [oppositeListName]: oppositeList };
            } else {
                const newList = currentList.filter(i => i !== item);
                return { ...currentSettings, [listName]: newList };
            }
        });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><p className="dark:text-white">Loading...</p></div>;
    }

    // **STRICT MODE FIX**: This variable is true if a strict focus session is running
    const isLocked = settings.strictMode && timerStatus.timerState === 'running' && timerStatus.sessionType === 'focus';

    return (
        <div className="h-full flex flex-col relative">
             {showSaveConfirm > 0 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-sm font-semibold py-1 px-3 rounded-full shadow-lg z-50">
                    Changes saved!
                </div>
            )}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center flex-shrink-0">Blocker Settings</h1>
            
            {/* **STRICT MODE FIX**: The <fieldset> tag disables all inputs inside it when 'isLocked' is true */}
            <fieldset disabled={isLocked} className="flex-grow overflow-y-auto space-y-8 px-2 group">
                <div className="group-disabled:opacity-50 group-disabled:cursor-not-allowed transition-opacity">
                    {isLocked && (
                         <div className="p-3 mb-4 text-center bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">Settings are locked during a strict focus session.</p>
                        </div>
                    )}
                    
                    {/* All settings inputs are now wrapped and will be disabled */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Focus Mode Strategy</h2>
                        <select name="focusMode" value={settings.focusMode} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2">
                            <option value="blacklist">Block distracting sites (Blacklist)</option>
                            <option value="whitelist">Allow only specific sites (Whitelist)</option>
                        </select>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Blacklist</h2>
                        <div className="flex gap-2">
                            <input type="text" value={newBlacklistItem} onChange={(e) => setNewBlacklistItem(e.target.value)} placeholder="Add domain or URL" className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                            <button onClick={() => { handleListChange('blacklist', newBlacklistItem, 'add'); setNewBlacklistItem(''); }} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Add</button>
                        </div>
                        <ul className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                            {(settings.blacklist || []).map(site => (
                                <li key={site} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                    <span className="text-gray-700 dark:text-gray-200 break-all">{site}</span> 
                                    <button onClick={() => handleListChange('blacklist', site, 'remove')} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 flex-shrink-0 ml-2">
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Whitelist</h2>
                        <div className="flex gap-2">
                            <input type="text" value={newWhitelistItem} onChange={(e) => setNewWhitelistItem(e.target.value)} placeholder="Add domain or URL" className="flex-grow block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
                            <button onClick={() => { handleListChange('whitelist', newWhitelistItem, 'add'); setNewWhitelistItem(''); }} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Add</button>
                        </div>
                        <ul className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                            {(settings.whitelist || []).map(site => (
                                <li key={site} className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                <span className="text-gray-700 dark:text-gray-200 break-all">{site}</span> 
                                    <button onClick={() => handleListChange('whitelist', site, 'remove')} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600 flex-shrink-0 ml-2">
                                        <Trash2 size={16} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-4 border-t dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Strict Mode</h2>
                        <div className="flex items-start bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 p-3 rounded-lg">
                            <input id="strictMode" type="checkbox" name="strictMode" checked={settings.strictMode} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 focus:ring-blue-500 mt-1" />
                            <div className="ml-3">
                                <label htmlFor="strictMode" className="block text-sm font-medium text-yellow-800 dark:text-yellow-200">Enable Strict Mode</label>
                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">Once a focus session starts, you cannot pause the timer or change the blocklists.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 pb-6">
                        <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all text-lg">
                            Save Changes
                        </button>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default SettingsView;