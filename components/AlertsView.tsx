import React from 'react';
import type { MineData } from '../types';
import { Card } from './Card';
import { AlertItem } from './AlertItem';
import { LoadingSpinner } from './LoadingSpinner';

interface AlertsViewProps {
    data: MineData | null;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ data }) => {
    if (!data) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }

    const { alerts } = data;

    return (
        <div className="space-y-6">
            <Card title={`Active Alerts (${alerts.length} total)`}>
                {alerts.length > 0 ? (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {alerts.map(alert => (
                            <AlertItem key={alert.id} alert={alert} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-text-secondary-light dark:text-text-secondary text-lg">No active alerts at this time.</p>
                        <p className="text-text-secondary-light dark:text-text-secondary mt-1">All systems are nominal.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};