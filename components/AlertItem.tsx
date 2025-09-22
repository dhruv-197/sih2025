import React from 'react';
import type { RockfallAlert, RiskLevel } from '../types';

interface AlertItemProps {
    alert: RockfallAlert;
}

const BellIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
);

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
    const riskStyles: Record<RiskLevel, { bg: string, text: string, border: string, animation?: string }> = {
        'Low': { bg: 'bg-low/10', text: 'text-low', border: 'border-low' },
        'Medium': { bg: 'bg-medium/10', text: 'text-medium', border: 'border-medium' },
    };

    const styles = riskStyles[alert.riskLevel];

    return (
        <div className={`p-4 rounded-lg border-l-4 ${styles.bg} ${styles.border} transition-shadow hover:shadow-lg ${styles.animation}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${styles.text}`}>{alert.riskLevel.toUpperCase()} ALERT</span>
                        <span className="text-sm text-text-secondary-light dark:text-text-secondary">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-text-primary-light dark:text-text-primary"><strong>Zone:</strong> {alert.zoneName} - {alert.message}</p>
                </div>
                <div className={`p-2 rounded-full ${styles.text}`}>
                  <BellIcon />
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border-light dark:border-border">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary"><strong>Suggested Action:</strong> {alert.suggestedAction}</p>
            </div>
        </div>
    );
};