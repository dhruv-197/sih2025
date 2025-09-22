import React from 'react';
import { Card } from './Card';
import { SensorChart } from './SensorChart';
import type { MineData, RiskLevel } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { DataIcons } from './Icons';

interface DashboardProps {
    data: MineData | null;
}

const riskStyles: Record<RiskLevel, { bg: string, text: string, border: string, gradient: string, animation?: string }> = {
    'Low': { bg: 'bg-low/10', text: 'text-low', border: 'border-low', gradient: 'from-low/30' },
    'Medium': { bg: 'bg-medium/10', text: 'text-medium', border: 'border-medium', gradient: 'from-medium/30' },
};

const DataPoint: React.FC<{ label: keyof typeof DataIcons; value: string | number; unit?: string }> = ({ label, value, unit }) => {
    const Icon = DataIcons[label];
    return (
        <div className="flex flex-col items-center justify-center text-center p-4 bg-background-light/50 dark:bg-background/50 rounded-lg">
            <div className="text-secondary-accent mb-2">
                <Icon />
            </div>
            {/* FIX: Explicitly cast `label` to a string before using string methods to satisfy TypeScript. */}
            <p className="text-sm text-text-secondary-light dark:text-text-secondary">{String(label).charAt(0).toUpperCase() + String(label).slice(1).replace('-', ' ')}</p>
            <p className="text-xl font-bold text-text-primary-light dark:text-text-primary">{value} <span className="text-base font-normal text-text-secondary-light dark:text-text-secondary">{unit}</span></p>
        </div>
    );
};


export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    if (!data) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }

    const { overallRisk, sensors } = data;
    const styles = riskStyles[overallRisk];

    const getSensorData = (type: string) => sensors.filter(s => s.sensorType === type);
    const getLatestValue = (sensorData: any[]) => sensorData.length > 0 ? sensorData[sensorData.length - 1].value.toFixed(2) : 'N/A';

    const seismicData = getSensorData('seismic');
    const gasData = getSensorData('gas');
    const temperatureData = getSensorData('temperature');
    const airflowData = getSensorData('air-flow');
    const windSpeedData = getSensorData('wind-speed');
    const displacementData = getSensorData('displacement');
    const porePressureData = getSensorData('pore-pressure');

    return (
        <div className="space-y-6">
            <Card>
                <div className={`p-6 rounded-lg border-l-4 ${styles.border} bg-gradient-to-r ${styles.gradient} to-card-light dark:to-card flex flex-col md:flex-row justify-between items-center gap-6 ${styles.animation}`}>
                    <div className="text-center md:text-left">
                        <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary uppercase tracking-wider">Current Risk Level</p>
                        <p className={`text-6xl font-extrabold ${styles.text}`}>{overallRisk.toUpperCase()}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 w-full md:w-auto flex-grow">
                       <DataPoint label="seismic" value={getLatestValue(seismicData)} unit="μm/s" />
                       <DataPoint label="displacement" value={getLatestValue(displacementData)} unit="mm" />
                       <DataPoint label="pore-pressure" value={getLatestValue(porePressureData)} unit="kPa" />
                       <DataPoint label="gas" value={getLatestValue(gasData)} unit="ppm" />
                       <DataPoint label="temperature" value={getLatestValue(temperatureData)} unit="°C" />
                       <DataPoint label="air-flow" value={getLatestValue(airflowData)} unit="m/s" />
                       <DataPoint label="wind-speed" value={getLatestValue(windSpeedData)} unit="m/s" />
                    </div>
                </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Seismic Activity Trend">
                    <div className="h-64">
                      <SensorChart data={seismicData} color="#22C55E" legendName="Activity" unit="μm/s" />
                    </div>
                </Card>
                 <Card title="Ground Displacement Trend">
                    <div className="h-64">
                        <SensorChart data={displacementData} color="#8B5CF6" legendName="Movement" unit="mm" />
                    </div>
                </Card>
                 <Card title="Pore Water Pressure Trend">
                    <div className="h-64">
                        <SensorChart data={porePressureData} color="#3B82F6" legendName="Pressure" unit="kPa" />
                    </div>
                </Card>
                 <Card title="Gas Levels Trend">
                    <div className="h-64">
                        <SensorChart data={gasData} color="#F97316" legendName="Level" unit="ppm" />
                    </div>
                </Card>
                 <Card title="Temperature Trend">
                    <div className="h-64">
                        <SensorChart data={temperatureData} color="#EF4444" legendName="Temp" unit="°C" />
                    </div>
                </Card>
                 <Card title="Air Flow Trend">
                    <div className="h-64">
                        <SensorChart data={airflowData} color="#14B8A6" legendName="Flow" unit="m/s" />
                    </div>
                </Card>
                <Card title="Wind Speed Trend">
                    <div className="h-64">
                        <SensorChart data={windSpeedData} color="#F59E0B" legendName="Speed" unit="m/s" />
                    </div>
                </Card>
            </div>
        </div>
    );
};