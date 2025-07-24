import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import TimerView from './views/TimerView';
import SettingsView from './views/SettingsView';
import StatsView from './views/StatsView';
import { Timer, Settings, BarChart3 } from 'lucide-react';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`p-4 transition-colors ${isActive ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500'}`}>
      {children}
    </Link>
  );
};

const ThemeManager = () => {
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      document.documentElement.classList.toggle('dark', mediaQuery.matches);
    };
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  return null;
};

const App = () => {
  return (
    <HashRouter>
      <ThemeManager />
      {/* Removed "overflow-hidden" from this div to allow the confirmation toast to appear */}
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col font-sans">
        <main className="flex-1 p-4 overflow-y-auto">
          <Routes>
            <Route path="/" element={<TimerView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/stats" element={<StatsView />} />
          </Routes>
        </main>
        <nav className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex justify-around items-center h-16">
            <NavLink to="/"><Timer size={28} /></NavLink>
            <NavLink to="/stats"><BarChart3 size={28} /></NavLink>
            <NavLink to="/settings"><Settings size={28} /></NavLink>
          </div>
        </nav>
      </div>
    </HashRouter>
  );
};

export default App;