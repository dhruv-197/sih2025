import React, { useState, useEffect, useRef } from 'react';
import { Back, Refresh, SunIcon, MoonIcon, AlertIcon } from './Icons';
import { AlertItem } from './AlertItem';
import type { MineData } from '../types';

interface HeaderProps {
  title: string;
  onRefresh: () => void;
  isLoading: boolean;
  isLive: boolean;
  setIsLive: (isLive: boolean) => void;
  onChangeMine: () => void;
  theme: string;
  onToggleTheme: () => void;
  mineData: MineData | null;
}

const LiveIndicator: React.FC = () => (
  <div className="flex items-center space-x-2">
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-low opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-low"></span>
    </span>
    <span className="font-semibold text-sm text-low">LIVE</span>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ title, onRefresh, isLoading, isLive, setIsLive, onChangeMine, theme, onToggleTheme, mineData }) => {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const alertButtonRef = useRef<HTMLButtonElement>(null);
  
  const alerts = mineData?.alerts || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        alertsRef.current &&
        !alertsRef.current.contains(event.target as Node) &&
        alertButtonRef.current &&
        !alertButtonRef.current.contains(event.target as Node)
      ) {
        setIsAlertsOpen(false);
      }
    };

    if (isAlertsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAlertsOpen]);


  return (
    <header className="bg-sidebar-light/80 dark:bg-sidebar/80 backdrop-blur-sm p-4 border-b border-border-light dark:border-border flex justify-between items-center z-20 flex-shrink-0">
      <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary">{title}</h2>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-4">
          {isLive && <LiveIndicator />}
          <label htmlFor="live-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" id="live-toggle" className="sr-only" checked={isLive} onChange={() => setIsLive(!isLive)} />
              <div className="block bg-primary-light dark:bg-primary w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white dark:bg-slate-300 w-6 h-6 rounded-full transition-transform ${isLive ? 'transform translate-x-6 bg-gradient-to-r from-accent to-secondary-accent' : ''}`}></div>
            </div>
          </label>
        </div>

        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-primary-light dark:bg-primary text-text-primary-light dark:text-text-primary font-semibold rounded-lg hover:bg-opacity-80 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Refresh data for the current mine"
        >
          <Refresh isLoading={isLoading} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>

        <button 
          onClick={onChangeMine} 
          className="flex items-center px-4 py-2 bg-gradient-to-r from-accent to-secondary-accent text-white font-semibold rounded-lg hover:from-accent-hover hover:to-accent transition-all"
        >
          <Back />
          Change Mine
        </button>

        <div className="flex items-center space-x-2">
            <div className="relative">
                <button
                  ref={alertButtonRef}
                  onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary-light dark:bg-primary text-text-primary-light dark:text-text-primary hover:bg-opacity-80 transition-colors"
                  aria-label="Toggle alerts panel"
                  title="View active alerts"
                >
                  <AlertIcon />
                </button>

                {isAlertsOpen && (
                    <div ref={alertsRef} className="absolute top-14 right-0 w-96 bg-card-light dark:bg-card rounded-lg shadow-2xl border border-border-light dark:border-border z-30 animate-fade-in">
                        <div className="p-4 border-b border-border-light dark:border-border">
                            <h4 className="font-bold text-text-primary-light dark:text-text-primary">Active Alerts</h4>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {alerts.length > 0 ? (
                                <div className="space-y-4">
                                    {alerts.map(alert => (
                                        <AlertItem key={alert.id} alert={alert} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-secondary-light dark:text-text-secondary">
                                    <p>No active alerts at this time.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <button
              onClick={onToggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-light dark:bg-primary text-text-primary-light dark:text-text-primary hover:bg-opacity-80 transition-colors"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
        </div>
      </div>
    </header>
  );
};