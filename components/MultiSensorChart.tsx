import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SensorDataPoint, SensorType } from '../types';

interface MultiSensorChartProps {
    data: SensorDataPoint[];
}

const SENSOR_COLORS: Record<SensorType, string> = {
    seismic: '#22C55E', // green-500
    gas: '#F97316',   // orange-500
    temperature: '#EF4444', // red-500
    'air-flow': '#14B8A6', // teal-500
    'wind-speed': '#F59E0B', // amber-500
    'displacement': '#8B5CF6', // violet-500
    'pore-pressure': '#3B82F6', // blue-500
};

export const MultiSensorChart: React.FC<MultiSensorChartProps> = ({ data }) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const tooltipStyle = {
        backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
        borderColor: isDarkMode ? '#374151' : '#e2e8f0',
        borderRadius: '0.5rem',
        color: isDarkMode ? '#F3F4F6' : '#0f172a',
    };
    const axisColor = isDarkMode ? '#9CA3AF' : '#475569';
    const gridColor = isDarkMode ? '#374151' : '#e2e8f0';


    const formattedData = React.useMemo(() => {
        const dataByTime: { [time: string]: { time: string;[key: string]: any } } = {};

        data.forEach(d => {
            const time = new Date(d.time).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            if (!dataByTime[time]) {
                dataByTime[time] = { time };
            }
            dataByTime[time][d.sensorType] = d.value;
        });

        return Object.values(dataByTime);
    }, [data]);


    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis 
                  dataKey="time" 
                  stroke={axisColor} 
                  fontSize={10} 
                  angle={-25}
                  textAnchor="end"
                  height={60}
                  />
                <YAxis stroke={axisColor} fontSize={12} yAxisId="left" orientation="left" />
                <Tooltip 
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: isDarkMode ? '#F3F4F6' : '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
                {Object.entries(SENSOR_COLORS).map(([type, color]) => (
                    <Line key={type} yAxisId="left" type="monotone" dataKey={type} stroke={color} strokeWidth={2} dot={false} name={type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};