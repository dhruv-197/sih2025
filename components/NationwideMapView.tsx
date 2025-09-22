import React, { useEffect, useRef } from 'react';
import type { Mine } from '../types';
import { mines } from './mines';
// @ts-ignore - Leaflet is loaded from CDN
const L = window.L;

interface NationwideMapViewProps {
    onSelectMine: (mine: Mine) => void;
}

export const NationwideMapView: React.FC<NationwideMapViewProps> = ({ onSelectMine }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            mapRef.current = L.map(mapContainerRef.current, { zoomControl: false }).setView([22.5, 82.5], 5); // Center of India
            L.control.zoom({ position: 'topleft' }).addTo(mapRef.current);
            
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(mapRef.current);

            const mineIcon = L.divIcon({
                html: `<div class="relative flex h-5 w-5">
                            <div class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style="background-color: #EAB308;"></div>
                            <div class="relative inline-flex rounded-full h-5 w-5 border-2 border-white" style="background-color: #F97316;"></div>
                       </div>`,
                className: 'bg-transparent border-0',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            mines.forEach(mine => {
                const marker = L.marker([mine.lat, mine.lng], { icon: mineIcon }).addTo(mapRef.current);
                marker.bindTooltip(`
                  <div style="font-family: Inter, sans-serif; font-size: 13px;">
                    <b>${mine.name}</b><br/>
                    ${mine.location}<br/>
                    <i>Click to view dashboard</i>
                  </div>
                `, {
                    className: 'map-tooltip',
                    sticky: true
                });
                marker.on('click', () => {
                    onSelectMine(mine);
                });
            });
             const style = document.createElement('style');
             style.innerHTML = `
               /* Light theme tooltip */
               .leaflet-tooltip.map-tooltip {
                 background-color: rgba(255, 255, 255, 0.8);
                 backdrop-filter: blur(4px);
                 border: 1px solid #E2E8F0;
                 color: #1E293B;
                 border-radius: 6px;
                 box-shadow: 0 1px 3px rgba(0,0,0,0.2);
               }
               /* Dark theme tooltip override */
               .dark .leaflet-tooltip.map-tooltip {
                 background-color: rgba(30, 41, 59, 0.8);
                 border: 1px solid #334155;
                 color: #F1F5F9;
                 box-shadow: 0 1px 3px rgba(0,0,0,0.5);
               }
             `;
             document.head.appendChild(style);

             // Fix for map rendering only in half the screen
             setTimeout(() => {
                mapRef.current?.invalidateSize();
            }, 100);
        }
        
         return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };

    }, [onSelectMine]);

    return (
        <div className="h-screen w-screen flex flex-col bg-background-light dark:bg-background text-text-primary-light dark:text-text-primary">
            <header className="p-6 bg-gray-900 dark:bg-gray-900 z-10 text-center">
                <h1 className="text-3xl font-bold text-white">MineSafe - National Oversight</h1>
                <p className="text-white/80 mt-2 text-lg">Select a mine site to view its real-time risk dashboard.</p>
            </header>
            <main ref={mapContainerRef} className="flex-grow z-0"></main>
        </div>
    );
};