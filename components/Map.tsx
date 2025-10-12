import React, { useEffect, useRef } from 'react';
import { SoundscapeSession } from '../types';

// Declare Leaflet in the global scope to avoid TypeScript errors
declare const L: any;

interface MapProps {
  sessions?: SoundscapeSession[];
  onMarkerClick?: (sessionId: string) => void;
  center?: [number, number];
  zoom?: number;
  singleMarkerPosition?: [number, number];
}

const Map: React.FC<MapProps> = ({ sessions, onMarkerClick, center, zoom = 2, singleMarkerPosition }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // To hold the map instance

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const initialCenter = center || [20, 0];
      
      const map = L.map(mapContainerRef.current).setView(initialCenter, zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Add a resize observer to invalidate map size on container resize
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
      
      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapRef.current = null;
      };
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add markers for multiple sessions (global map view)
      if (sessions && onMarkerClick) {
        sessions.forEach(session => {
          if (session.location.lat !== 0 && session.location.lng !== 0) {
            const marker = L.marker([session.location.lat, session.location.lng]).addTo(map);
            const popupContent = `
              <div class="p-1">
                <h3 class="font-bold text-lg text-slate-800">${session.title}</h3>
                <p class="text-slate-600">${session.location.name}</p>
                <button class="view-details-btn mt-2 w-full text-center bg-cyan-500 text-white font-semibold py-1 px-3 rounded-md hover:bg-cyan-600 transition-colors" data-id="${session.id}">View Details</button>
              </div>
            `;
            marker.bindPopup(popupContent);
          }
        });
        
        // Add click listener for popups
         map.on('popupopen', (e: any) => {
            const btn = e.popup._container.querySelector('.view-details-btn');
            if(btn) {
                btn.addEventListener('click', () => {
                   const sessionId = btn.getAttribute('data-id');
                   if(sessionId) {
                       onMarkerClick(sessionId);
                   }
                });
            }
        });

      } 
      // Add a single marker (detail view)
      else if (singleMarkerPosition) {
         if (singleMarkerPosition[0] !== 0 || singleMarkerPosition[1] !== 0) {
            L.marker(singleMarkerPosition).addTo(map);
         }
      }
    }
     return () => {
        if(mapRef.current) {
            mapRef.current.off('popupopen');
        }
    }
  }, [sessions, onMarkerClick, singleMarkerPosition]);

  return <div ref={mapContainerRef} className="w-full h-full bg-slate-800" />;
};

export default Map;
