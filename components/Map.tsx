
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
  showUserLocation?: boolean;
}

const Map: React.FC<MapProps> = ({ sessions, onMarkerClick, center, zoom = 2, singleMarkerPosition, showUserLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); 
  const userLocationMarkerRef = useRef<any>(null);

  useEffect(() => {
    // Safety check: Ensure container exists and map isn't already initialized
    if (mapContainerRef.current && !mapRef.current) {
      // Default to a central view if no center provided
      const initialCenter = center || [20, 0];
      
      try {
          const map = L.map(mapContainerRef.current).setView(initialCenter, zoom);
          mapRef.current = map;

          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
          }).addTo(map);
          
          // Force a resize check after mount to prevent gray tiles
          setTimeout(() => {
             map.invalidateSize();
          }, 100);

          const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
          });
          resizeObserver.observe(mapContainerRef.current);
      } catch (e) {
          console.error("Error initializing map:", e);
      }
    }

    return () => {
       if (mapRef.current) {
           mapRef.current.off();
           mapRef.current.remove();
           mapRef.current = null;
       }
    };
  }, []); // Empty dependency array: Initialize once

  // Update View when center changes
  useEffect(() => {
      if (mapRef.current && center && center[0] !== 0) {
          mapRef.current.setView(center, zoom);
          // Small timeout to allow container to resize if needed
          setTimeout(() => mapRef.current?.invalidateSize(), 50);
      }
  }, [center, zoom]);


  // Handle Markers
  useEffect(() => {
    const map = mapRef.current;
    if (map) {
      // Clear existing session markers (Keep user location if managed separately, but here we clear everything for simplicity then re-add)
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && layer !== userLocationMarkerRef.current) {
          map.removeLayer(layer);
        }
      });

      // Add markers for multiple sessions
      if (sessions && onMarkerClick) {
        sessions.forEach(session => {
          if (session.location.lat && session.location.lng) {
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
        
         // Remove old listeners before adding new ones
         map.off('popupopen');
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
      // Add Single Marker (for Details view)
      else if (singleMarkerPosition) {
         if (singleMarkerPosition[0] !== 0 || singleMarkerPosition[1] !== 0) {
            L.marker(singleMarkerPosition).addTo(map);
         }
      }
    }
  }, [sessions, onMarkerClick, singleMarkerPosition]);

  // User Location Logic
  useEffect(() => {
      const map = mapRef.current;
      if (map && showUserLocation) {
          const updateMarker = (lat: number, lng: number) => {
              if (userLocationMarkerRef.current) {
                  map.removeLayer(userLocationMarkerRef.current);
              }
              const dotIcon = L.divIcon({
                  className: 'custom-div-icon',
                  html: "<div style='background-color:#22d3ee; width: 16px; height: 16px; border-radius: 50%; border: 3px solid rgba(34, 211, 238, 0.4); box-shadow: 0 0 15px #22d3ee;'></div>",
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
              });
              userLocationMarkerRef.current = L.marker([lat, lng], { icon: dotIcon }).addTo(map);
          };
          
          // If in Field Mode, we usually pass location via center/singleMarkerPosition, 
          // but if we want to show the blue dot explicitly:
          if (singleMarkerPosition && singleMarkerPosition[0] !== 0) {
             updateMarker(singleMarkerPosition[0], singleMarkerPosition[1]);
          }
      }
  }, [showUserLocation, singleMarkerPosition]);

  return <div ref={mapContainerRef} className="w-full h-full bg-slate-800 z-0" />;
};

export default Map;
