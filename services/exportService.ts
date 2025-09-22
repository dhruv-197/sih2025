import type { SensorDataPoint, RockfallAlert } from '../types';

/**
 * Converts an array of sensor data objects to a CSV string.
 * @param data The array of objects to convert.
 * @returns A CSV formatted string.
 */
const convertToCSV = (data: SensorDataPoint[]): string => {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            // Escape double quotes by doubling them, and wrap value in double quotes
            const escaped = ('' + (row as any)[header]).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
};

/**
 * Triggers a file download in the browser.
 * @param filename The name of the file to download.
 * @param content The content of the file.
 * @param mimeType The MIME type of the file.
 */
const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

/**
 * Exports sensor data to a CSV file.
 * @param filename The desired name for the CSV file.
 * @param data The array of SensorDataPoint objects.
 */
export const exportSensorsToCsv = (filename: string, data: SensorDataPoint[]): void => {
    const csvContent = convertToCSV(data);
    downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
};

/**
 * Exports alerts data to a JSON file.
 * @param filename The desired name for the JSON file.
 * @param data The array of RockfallAlert objects.
 */
export const exportAlertsToJson = (filename: string, data: RockfallAlert[]): void => {
    const jsonContent = JSON.stringify(data, null, 2); // Pretty print JSON
    downloadFile(filename, jsonContent, 'application/json;charset=utf-8;');
};