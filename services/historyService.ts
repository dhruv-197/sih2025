import type { MineData, HistoricalData } from '../types';

const getHistoryKey = (mineId: string) => `history_${mineId}`;

export const saveMineDataToHistory = (mineId: string, data: MineData): void => {
    try {
        const key = getHistoryKey(mineId);
        const existingHistoryRaw = localStorage.getItem(key);
        const history: HistoricalData = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : { sensors: [], alerts: [] };

        // To avoid duplicates, create sets of existing timestamps/ids
        const existingSensorTimestamps = new Set(history.sensors.map(s => `${s.sensorId}-${s.time}`));
        const existingAlertIds = new Set(history.alerts.map(a => a.id));

        const newSensors = data.sensors.filter(s => !existingSensorTimestamps.has(`${s.sensorId}-${s.time}`));
        const newAlerts = data.alerts.filter(a => !existingAlertIds.has(a.id));

        if (newSensors.length === 0 && newAlerts.length === 0) {
            return; // No new data to save
        }

        history.sensors.push(...newSensors);
        history.alerts.push(...newAlerts);

        // Sort to keep data organized
        history.sensors.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        history.alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        localStorage.setItem(key, JSON.stringify(history));

    } catch (error) {
        console.error("Failed to save data to localStorage:", error);
    }
};

export const getHistoricalData = (mineId: string, startDate: Date, endDate: Date): HistoricalData => {
    try {
        const key = getHistoryKey(mineId);
        const historyRaw = localStorage.getItem(key);
        if (!historyRaw) {
            return { sensors: [], alerts: [] };
        }

        const history: HistoricalData = JSON.parse(historyRaw);
        
        // Set end of day for endDate to include the whole day
        endDate.setHours(23, 59, 59, 999);
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();

        const filteredSensors = history.sensors.filter(sensor => {
            const sensorTime = new Date(sensor.time).getTime();
            return sensorTime >= startTime && sensorTime <= endTime;
        });

        const filteredAlerts = history.alerts.filter(alert => {
            const alertTime = new Date(alert.timestamp).getTime();
            return alertTime >= startTime && alertTime <= endTime;
        });

        return {
            sensors: filteredSensors,
            alerts: filteredAlerts,
        };

    } catch (error) {
        console.error("Failed to retrieve data from localStorage:", error);
        return { sensors: [], alerts: [] };
    }
};
