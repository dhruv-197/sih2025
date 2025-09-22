import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SensorDataPoint } from '../types';

interface SensorChartProps {
    data: SensorDataPoint[];
    color: string;
    legendName: string;
    unit: string;
}

export const SensorChart: React.FC<SensorChartProps> = ({ data, color, legendName, unit }) => {
    const formattedData = data.map(d => ({
        ...d,
        time: new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const isDarkMode = document.documentElement.classList.contains('dark');

    const tooltipStyle = {
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        borderColor: isDarkMode ? '#374151' : '#e2e8f0',
        borderRadius: '0.5rem',
        color: isDarkMode ? '#F9FAFB' : '#0f172a',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };

    const axisColor = isDarkMode ? '#9CA3AF' : '#475569';
    const gridColor = isDarkMode ? '#374151' : '#e2e8f0';

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="time" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip 
                    contentStyle={tooltipStyle} 
                    labelStyle={{ fontWeight: 'bold' }}
                    itemStyle={{ color: color }}
                    formatter={(value: number) => [`${value} ${unit}`, legendName]}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }}/>
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} activeDot={{ r: 6 }} name={legendName} />
            </LineChart>
        </ResponsiveContainer>
    );
};