import React, { useEffect, useRef } from 'react';
import type { MineData, RockfallEventType } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

// @ts-ignore - Leaflet is loaded from CDN
const L = window.L;

interface RiskMapViewProps {
    data: MineData | null;
}

const eventColors: Record<RockfallEventType, string> = {
    'Precipitation': '#3B82F6',
    'Crack propagation': '#F97316',
    'Blasting': '#8B5CF6',
    'Ground vibration': '#6366F1',
    'Thermal stress': '#EC4899',
    'Unknown': '#6B7280',
};

const getRadiusFromVolume = (volume: number) => {
    if (volume < 5) return 6;
    if (volume < 50) return 8;
    if (volume < 500) return 12;
    if (volume < 5000) return 18;
    if (volume < 50000) return 26;
    return 34;
};

const getHeatmapColor = (probability: number, volume: number): string => {
    // Normalize volume on a log scale to handle wide range, capped at 50,000
    const normalizedVolume = Math.log1p(volume) / Math.log1p(50000);
    // Combine probability and volume, giving more weight to probability
    const heat = probability * 0.7 + normalizedVolume * 0.3;

    if (heat > 0.4) return '#EF4444'; // red-500
    if (heat > 0.25) return '#F97316'; // orange-500
    if (heat > 0.1) return '#EAB308'; // yellow-500
    return '#22C55E'; // green-500
};


const TriggerLegend = () => (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md p-4 rounded-lg shadow-lg border border-black/10 dark:border-white/20">
        <h4 className="font-bold mb-2 text-sm text-text-primary-light dark:text-text-primary">Trigger Legend</h4>
        <ul className="space-y-1.5">
            {Object.entries(eventColors).map(([type, color]) => (
                <li key={type} className="flex items-center text-xs text-text-secondary-light dark:text-text-secondary">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color, border: '1px solid #F9FAFB' }}></span>
                    <span>{type}</span>
                </li>
            ))}
        </ul>
    </div>
);

const VolumeScale = () => {
    const volumes = [0.5, 5, 50, 500, 5000, 50000];
    return (
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md p-4 rounded-lg shadow-lg border border-black/10 dark:border-white/20">
            <h4 className="font-bold mb-2 text-sm text-text-primary-light dark:text-text-primary">Volume (cubic meters)</h4>
            <ul className="space-y-2.5">
                {volumes.map((vol, i) => (
                    <li key={vol} className="flex items-center text-xs text-text-secondary-light dark:text-text-secondary">
                        <span className="rounded-full mr-2.5" style={{ 
                            width: getRadiusFromVolume(vol) * 1.5, 
                            height: getRadiusFromVolume(vol) * 1.5, 
                            backgroundColor: '#9CA3AF',
                            display: 'inline-block'
                        }}></span>
                        <span>{vol.toLocaleString()} {volumes[i+1] ? `- ${volumes[i+1].toLocaleString()}`: '+'}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


export const RiskMapView: React.FC<RiskMapViewProps> = ({ data }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const eventsLayerRef = useRef<any>(null);
    const heatmapLayerRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current && data) {
            mapRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView([data.mine.lat, data.mine.lng], 15);
            L.control.zoom({ position: 'topleft' }).addTo(mapRef.current);

            // --- Define Base Layers ---
            const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });
            const terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            });

            satelliteLayer.addTo(mapRef.current); // Default base layer

            // --- Define Overlay Layers ---
            eventsLayerRef.current = L.layerGroup().addTo(mapRef.current); // Default overlay
            heatmapLayerRef.current = L.layerGroup();

            // --- Create Layer Control ---
            const baseMaps = {
                "Satellite": satelliteLayer,
                "Terrain": terrainLayer
            };
            const overlayMaps = {
                "Rockfall Events": eventsLayerRef.current,
                "Risk Heatmap": heatmapLayerRef.current,
            };

            L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(mapRef.current);
        }

        if (mapRef.current && eventsLayerRef.current && heatmapLayerRef.current && data) {
            mapRef.current.flyTo([data.mine.lat, data.mine.lng], 15);
            
            // Clear old data from layers
            eventsLayerRef.current.clearLayers();
            heatmapLayerRef.current.clearLayers();

            data.rockfallEvents.forEach(event => {
                // --- Add to Rockfall Events Layer ---
                const circle = L.circleMarker([event.lat, event.lng], {
                    radius: getRadiusFromVolume(event.volume),
                    color: '#F9FAFB', // white border
                    weight: 1,
                    fillColor: eventColors[event.type] || eventColors['Unknown'],
                    fillOpacity: 0.85,
                }).addTo(eventsLayerRef.current);

                circle.bindTooltip(`
                    <div style="font-family: Inter, sans-serif; font-size: 13px;">
                      <b>Trigger: ${event.type}</b><br/>
                      Volume: ${event.volume.toFixed(2)} m³<br/>
                      Probability: ${(event.probability * 100).toFixed(1)}%
                    </div>
                `, {
                    className: 'map-tooltip',
                    sticky: true
                });
                
                // --- Add to Heatmap Layer ---
                const heatColor = getHeatmapColor(event.probability, event.volume);
                const heatCircle = L.circle([event.lat, event.lng], {
                    radius: 40, // Fixed radius in meters for visual consistency
                    color: 'transparent', // No border
                    fillColor: heatColor,
                    fillOpacity: 0.4,
                }).addTo(heatmapLayerRef.current);

                heatCircle.bindTooltip(`
                    <div style="font-family: Inter, sans-serif; font-size: 13px;">
                      <b>Risk Influence</b><br/>
                      Prob: ${(event.probability * 100).toFixed(1)}% | Vol: ${event.volume.toFixed(2)} m³
                    </div>
                `, {
                    className: 'map-tooltip',
                    sticky: true,
                    offset: L.point(0, -10)
                });
            });
        }
        
        // Add a style block for custom UI appearance
        const styleId = 'custom-leaflet-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
              /* Light theme tooltip */
              .leaflet-tooltip.map-tooltip {
                background-color: rgba(255, 255, 255, 0.8);
                border: 1px solid #E2E8F0;
                color: #1E293B;
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              }
              /* Dark theme tooltip override */
              .dark .leaflet-tooltip.map-tooltip {
                background-color: rgba(31, 41, 55, 0.8);
                border: 1px solid #374151;
                color: #F9FAFB;
                box-shadow: 0 1px 3px rgba(0,0,0,0.5);
              }
              /* Light theme layer control */
              .leaflet-control-layers {
                background-color: rgba(255, 255, 255, 0.8) !important;
                backdrop-filter: blur(4px);
                border: 1px solid #E2E8F0 !important;
                color: #1E293B !important;
                border-radius: 6px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
              }
              /* Dark theme layer control override */
              .dark .leaflet-control-layers {
                background-color: rgba(31, 41, 55, 0.8) !important;
                border: 1px solid #374151 !important;
                color: #F3F4F6 !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.5) !important;
              }
               .leaflet-control-layers-selector {
                  vertical-align: middle;
               }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            mapRef.current?.invalidateSize();
        }, 100);

    }, [data]);

    if (!data) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }

    return (
        <div className="h-full w-full relative rounded-lg overflow-hidden">
            <div ref={mapContainerRef} className="h-full w-full z-0" />
            <div className="absolute top-4 left-14 flex flex-col space-y-4 z-10">
                <TriggerLegend />
            </div>
             <div className="absolute bottom-4 right-4 flex flex-col space-y-4 z-10">
                <VolumeScale />
            </div>
        </div>
    );
};