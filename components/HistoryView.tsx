import React, { useState, useEffect } from 'react';
import type { Mine, HistoricalData } from '../types';
import { getHistoricalData } from '../services/historyService';
import { exportSensorsToCsv, exportAlertsToJson } from '../services/exportService';
import { Card } from './Card';
import { AlertItem } from './AlertItem';
import { MultiSensorChart } from './MultiSensorChart';
import { LoadingSpinner } from './LoadingSpinner';
import { Csv, Json } from './Icons';

// Helper to get date string in 'YYYY-MM-DD' format
const toInputDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const HistoryView: React.FC<{ mine: Mine | null }> = ({ mine }) => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState<Date>(sevenDaysAgo);
    const [endDate, setEndDate] = useState<Date>(today);
    const [data, setData] = useState<HistoricalData>({ sensors: [], alerts: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (mine) {
            setIsLoading(true);
            const historicalData = getHistoricalData(mine.id, new Date(startDate), new Date(endDate));
            setData(historicalData);
            setIsLoading(false);
        }
    }, [mine, startDate, endDate]);

    const handleExportSensors = () => {
        if (!mine || data.sensors.length === 0) return;
        const start = toInputDateString(startDate);
        const end = toInputDateString(endDate);
        const filename = `${mine.id}_sensors_${start}_to_${end}.csv`;
        exportSensorsToCsv(filename, data.sensors);
    };

    const handleExportAlerts = () => {
        if (!mine || data.alerts.length === 0) return;
        const start = toInputDateString(startDate);
        const end = toInputDateString(endDate);
        const filename = `${mine.id}_alerts_${start}_to_${end}.json`;
        exportAlertsToJson(filename, data.alerts);
    };


    if (!mine) {
        return <div className="text-center p-8 text-critical">Error: No mine selected.</div>;
    }

    return (
        <div className="space-y-6">
            <Card title="Query Historical Data">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary mb-1">Start Date</label>
                        <input
                            type="date"
                            id="start-date"
                            value={toInputDateString(startDate)}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                            className="w-full bg-primary-light dark:bg-primary p-2 rounded-md border border-border-light dark:border-border focus:ring-accent focus:border-accent"
                            aria-label="Start date for historical data"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary mb-1">End Date</label>
                        <input
                            type="date"
                            id="end-date"
                            value={toInputDateString(endDate)}
                            onChange={(e) => setEndDate(new Date(e.target.value))}
                            className="w-full bg-primary-light dark:bg-primary p-2 rounded-md border border-border-light dark:border-border focus:ring-accent focus:border-accent"
                            aria-label="End date for historical data"
                        />
                    </div>
                </div>
                 <div className="mt-4 pt-4 border-t border-border-light dark:border-border flex flex-col md:flex-row gap-4 items-center justify-end">
                     <h4 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary mr-auto md:mr-4">Export Data</h4>
                     <button
                        onClick={handleExportSensors}
                        disabled={data.sensors.length === 0}
                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-accent to-secondary-accent text-white rounded-lg hover:from-accent-hover hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full md:w-auto font-semibold"
                        aria-label="Export sensor data to CSV"
                     >
                        <Csv />
                        Export Sensors (CSV)
                     </button>
                      <button
                        onClick={handleExportAlerts}
                        disabled={data.alerts.length === 0}
                        className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-accent to-secondary-accent text-white rounded-lg hover:from-accent-hover hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full md:w-auto font-semibold"
                        aria-label="Export alerts data to JSON"
                     >
                        <Json />
                        Export Alerts (JSON)
                     </button>
                </div>
            </Card>

            <Card title="Historical Sensor Trends" fullHeight>
                <div className="h-96">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
                    ) : data.sensors.length > 0 ? (
                        <MultiSensorChart data={data.sensors} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary">
                            <p>No sensor data found for the selected period.</p>
                        </div>
                    )}
                </div>
            </Card>
            
            <Card title={`Alerts (${data.alerts.length} found)`}>
                 {isLoading ? (
                    <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
                 ) : data.alerts.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                       {data.alerts.map(alert => <AlertItem key={alert.id} alert={alert} />)}
                    </div>
                 ) : (
                    <div className="text-center py-8 text-text-secondary-light dark:text-text-secondary">
                        <p>No alerts found for the selected period.</p>
                    </div>
                 )}
            </Card>
        </div>
    );
};