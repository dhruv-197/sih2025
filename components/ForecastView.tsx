import React, { useState, useEffect, useRef } from 'react';
import type { MineData, ForecastData, RockfallEventType, RockfallEvent, RiskLevel } from '../types';
import { getForecastData } from '../services/geminiService';
import { Card } from './Card';
import { AlertItem } from './AlertItem';
import { LoadingSpinner } from './LoadingSpinner';
import { LightbulbIcon, WarningIcon } from './Icons';

// @ts-ignore
const L = window.L;

interface ForecastViewProps {
    mineData: MineData | null;
}

const riskStyles: Record<RiskLevel, { bg: string, text: string, border: string, gradient: string, animation?: string }> = {
    'Low': { bg: 'bg-low/10', text: 'text-low', border: 'border-low', gradient: 'from-low/30' },
    'Medium': { bg: 'bg-medium/10', text: 'text-medium', border: 'border-medium', gradient: 'from-medium/30' },
};

const eventColors: Record<RockfallEventType, string> = {
    'Precipitation': '#3B82F6',
    'Crack propagation': '#F97316',
    'Blasting': '#8B5CF6',
    'Ground vibration': '#6366F1',
    'Thermal stress': '#EC4899',
    'Unknown': '#6B7280',
};

// Forecast Map Component
const ForecastMap: React.FC<{ mineData: MineData, forecastEvents: RockfallEvent[] }> = ({ mineData, forecastEvents }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const forecastLayerRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView([mineData.mine.lat, mineData.mine.lng], 15);
            L.control.zoom({ position: 'topleft' }).addTo(mapRef.current);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(mapRef.current);
            forecastLayerRef.current = L.layerGroup().addTo(mapRef.current);
        }

        if (mapRef.current && forecastLayerRef.current) {
            forecastLayerRef.current.clearLayers();

            forecastEvents.forEach(event => {
                const isHighRisk = event.probability > 0.4;
                const iconHtml = `<div class="relative flex h-4 w-4">
                    ${isHighRisk ? `<div class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: ${eventColors[event.type]};"></div>` : ''}
                    <div class="relative inline-flex rounded-full h-4 w-4 border-2 border-white" style="background-color: ${eventColors[event.type]};"></div>
                </div>`;
                
                const forecastIcon = L.divIcon({
                    html: iconHtml,
                    className: 'bg-transparent border-0',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                const marker = L.marker([event.lat, event.lng], { icon: forecastIcon }).addTo(forecastLayerRef.current);
                marker.bindTooltip(`
                    <div style="font-family: Inter, sans-serif; font-size: 13px;">
                      <b>Predicted Trigger: ${event.type}</b><br/>
                      Volume: ${event.volume.toFixed(2)} m³<br/>
                      Predicted Probability: <b>${(event.probability * 100).toFixed(1)}%</b>
                    </div>
                `, { className: 'map-tooltip' });
            });
        }
        
        setTimeout(() => mapRef.current?.invalidateSize(), 100);

    }, [mineData, forecastEvents]);

    return <div ref={mapContainerRef} className="h-full w-full rounded-lg" />;
};


export const ForecastView: React.FC<ForecastViewProps> = ({ mineData }) => {
    const [hours, setHours] = useState(6);
    const [forecastData, setForecastData] = useState<ForecastData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateForecast = async () => {
        if (!mineData) return;
        setIsLoading(true);
        setError(null);
        setForecastData(null);
        try {
            const result = await getForecastData(mineData, hours);
            setForecastData(result);
        } catch (err) {
            setError('Failed to generate AI forecast. Please try refreshing the page.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mineData) {
        return <div className="text-center p-8"><p className="text-text-secondary-light dark:text-text-secondary">Current mine data is not available. Cannot generate forecast.</p></div>;
    }

    const styles = forecastData ? riskStyles[forecastData.predictedOverallRisk] : riskStyles['Low'];
    
    return (
        <div className="space-y-6">
            <Card title="AI Risk Forecast Generator">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="forecast-hours" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary mb-2">
                            Forecast Period: <span className="font-bold text-lg text-accent">{hours} hours</span>
                        </label>
                        <input
                            id="forecast-hours"
                            type="range"
                            min="1"
                            max="24"
                            step="1"
                            value={hours}
                            onChange={(e) => setHours(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-primary-light dark:bg-primary rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>
                    <button
                        onClick={handleGenerateForecast}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-gradient-to-r from-accent to-secondary-accent text-white font-bold rounded-lg hover:from-accent-hover hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                    >
                        {isLoading ? 'Generating Forecast...' : `Generate ${hours}-Hour Forecast`}
                    </button>
                </div>
            </Card>

            {isLoading && (
                <div className="flex flex-col items-center justify-center h-64">
                    <LoadingSpinner />
                </div>
            )}
            
            {error && <div className="text-center text-critical text-lg p-8">{error}</div>}

            {forecastData && (
                <div className="space-y-6 animate-fade-in">
                    <Card>
                        <div className={`p-6 rounded-lg border-l-4 ${styles.border} bg-gradient-to-r ${styles.gradient} to-card-light dark:to-card flex flex-col md:flex-row justify-between items-center gap-6 ${styles.animation}`}>
                            <div className="text-center md:text-left">
                                <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary uppercase tracking-wider">{hours}-Hour Forecasted Risk</p>
                                <p className={`text-6xl font-extrabold ${styles.text}`}>{forecastData.predictedOverallRisk.toUpperCase()}</p>
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-bold text-text-primary-light dark:text-text-primary mb-2">Forecast Summary</h4>
                                <p className="text-text-secondary-light dark:text-text-secondary">{forecastData.summary.assessment}</p>
                            </div>
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Key Forecast Drivers">
                            <ul className="space-y-3 text-text-primary-light dark:text-text-primary">
                                {forecastData.summary.keyDrivers.map((driver, index) => (
                                    <li key={index} className="flex items-start p-3 bg-primary-light/40 dark:bg-primary/40 rounded-lg">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-accent/20 flex items-center justify-center mr-4">
                                            <span className="text-secondary-accent"><LightbulbIcon /></span>
                                        </div>
                                        <span className="pt-1">{driver}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card title="Potential Outcomes">
                           <ul className="space-y-3 text-text-primary-light dark:text-text-primary">
                                {forecastData.summary.potentialOutcomes.map((outcome, index) => (
                                    <li key={index} className="flex items-start p-3 bg-primary-light/40 dark:bg-primary/40 rounded-lg">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                                           <span className="text-accent"><WarningIcon /></span>
                                        </div>
                                        <span className="pt-1">{outcome}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Predicted Risk Map" fullHeight>
                           <div className="h-96 lg:h-[30rem]">
                             <ForecastMap mineData={mineData} forecastEvents={forecastData.predictedRockfallEvents} />
                           </div>
                        </Card>
                         <Card title="Predicted New Alerts" fullHeight>
                            {forecastData.predictedAlerts.length > 0 ? (
                                <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                                    {forecastData.predictedAlerts.map(alert => (
                                        <AlertItem key={alert.id} alert={alert} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary">
                                    <p>No new high-risk alerts are predicted in this period.</p>
                                </div>
                            )}
                        </Card>
                    </div>

                </div>
            )}
        </div>
    );
};