import React, { useState, useEffect } from 'react';
// We still import the base types to extend them
import type { NotificationSettings as BaseNotificationSettings, RiskLevel as BaseRiskLevel } from '../types';
import { Card } from './Card';

const SETTINGS_KEY = 'mineSafe_notificationSettings';

// --- Local Type Extension ---
// By creating extended types within this component, we avoid changing shared files like `types.ts`.
type ExtendedRiskLevel = BaseRiskLevel | 'High' | 'Critical';

interface NotificationSettings extends Omit<BaseNotificationSettings, 'notifyOn'> {
    notifyOn: Record<ExtendedRiskLevel, boolean>;
}
// --- End Local Type Extension ---


const defaultSettings: NotificationSettings = {
    email: '',
    phone: '',
    notifyOn: {
        Low: false,
        Medium: false,
        High: true,
        Critical: true,
    },
};

export const SettingsView: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_KEY);
            if (savedSettings) {
                const loaded = JSON.parse(savedSettings);
                // Create a full settings object, merging saved data with the new default
                // to ensure High and Critical keys are present.
                const fullSettings: NotificationSettings = {
                  email: loaded.email || '',
                  phone: loaded.phone || '',
                  notifyOn: {
                      ...defaultSettings.notifyOn, // Start with all keys
                      ...loaded.notifyOn, // Overwrite with any saved values
                  }
                };
                setSettings(fullSettings);
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage:", error);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        setIsSaved(false);
    };

    // The handler now uses the local ExtendedRiskLevel type
    const handleCheckboxChange = (level: ExtendedRiskLevel) => {
        setSettings(prev => ({
            ...prev,
            notifyOn: {
                ...prev.notifyOn,
                [level]: !prev.notifyOn[level],
            },
        }));
        setIsSaved(false);
    };

    const handleSave = () => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
        } catch (error) {
            console.error("Failed to save settings to localStorage:", error);
            alert("Error: Could not save settings.");
        }
    };
    
    const handleTestAlert = () => {
        if (!settings.email && !settings.phone) {
            alert("Please enter an email or phone number to send a test alert.");
            return;
        }
        const destinations = [settings.email, settings.phone].filter(Boolean).join(' and ');
        alert(`This is a test notification.\nIn a real system, an alert for a MEDIUM event would be sent to: ${destinations}`);
    };

    // All levels are now fully functional. The `isDummy` concept is removed.
    const allDisplayLevels: ExtendedRiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card title="Notification Preferences">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={settings.email}
                            onChange={handleInputChange}
                            placeholder="e.g., manager@mine.com"
                            className="w-full bg-primary-light dark:bg-primary p-2 rounded-md border border-border-light dark:border-border focus:ring-accent focus:border-accent"
                        />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary mb-1">Phone Number (for SMS Alerts)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={settings.phone}
                            onChange={handleInputChange}
                            placeholder="e.g., +919876543210"
                            className="w-full bg-primary-light dark:bg-primary p-2 rounded-md border border-border-light dark:border-border focus:ring-accent focus:border-accent"
                        />
                    </div>
                </div>
            </Card>

            <Card title="Trigger Levels">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary mb-4">Select the risk levels for which you want to receive notifications.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {allDisplayLevels.map((level) => (
                         <label
                            key={level}
                            className="flex items-center space-x-3 p-3 bg-primary-light dark:bg-primary rounded-md border border-border-light dark:border-border transition-colors cursor-pointer hover:bg-border-light dark:hover:bg-border"
                        >
                            <input
                                type="checkbox"
                                checked={settings.notifyOn[level]}
                                onChange={() => handleCheckboxChange(level)}
                                className="h-5 w-5 rounded bg-background-light dark:bg-background border-border-light dark:border-border text-accent focus:ring-accent"
                            />
                            <span className="font-medium text-text-primary-light dark:text-text-primary">{level}</span>
                        </label>
                    ))}
                </div>
            </Card>

            <div className="flex justify-end items-center gap-4">
                {isSaved && <p className="text-low transition-opacity duration-300">Settings saved successfully!</p>}
                <button
                    onClick={handleTestAlert}
                    className="px-6 py-2 bg-primary-light dark:bg-primary text-text-primary-light dark:text-text-primary font-semibold rounded-lg hover:bg-opacity-80 transition-colors"
                >
                    Send Test Alert
                </button>
                 <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-gradient-to-r from-accent to-secondary-accent text-white font-semibold rounded-lg hover:from-accent-hover hover:to-accent transition-all"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};