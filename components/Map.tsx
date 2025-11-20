import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SoundscapeSession } from '../types';

interface MapProps {
  sessions?: SoundscapeSession[];
  onLocationSelect?: (lat: number, lng: number, placeName?: string) => void;
  onMarkerClick?: (sessionId: string) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

// You need to set your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

const Map: React.FC<MapProps> = ({
  sessions = [],
  onLocationSelect,
  onMarkerClick,
  center = [0, 0],
  zoom = 2,
  height = '400px',
  className = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.current.addControl(geolocate);

    // Add click handler for location selection
    if (onLocationSelect) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Add markers for sessions
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    sessions.forEach(session => {
      if (session.location && session.location.lat && session.location.lng) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '16px';
        
        // Set marker color and icon based on sound type
        const soundTypeConfig = {
          Forest: { color: '#22c55e', icon: '🌲' },
          Urban: { color: '#3b82f6', icon: '🏙️' },
          Marine: { color: '#06b6d4', icon: '🌊' },
          Desert: { color: '#f59e0b', icon: '🏜️' },
          Industrial: { color: '#6b7280', icon: '🏭' },
        };
        
        const config = soundTypeConfig[session.soundType as keyof typeof soundTypeConfig] || 
                      { color: '#8b5cf6', icon: '🎵' };
        
        el.style.backgroundColor = config.color;
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
        el.innerHTML = config.icon;

        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([session.location.lng, session.location.lat])
          .addTo(map.current!);

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #1f2937;">${session.title}</h3>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${session.location.name}</p>
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">${config.icon} ${session.soundType}</p>
              ${onMarkerClick ? `
                <button 
                  onclick="window.handleMarkerClick('${session.id}')"
                  style="
                    width: 100%; 
                    padding: 6px 12px; 
                    background: #06b6d4; 
                    color: white; 
                    border: none; 
                    border-radius: 6px; 
                    cursor: pointer;
                    font-weight: 500;
                  "
                >
                  Ver Detalles
                </button>
              ` : ''}
            </div>
          `);

        marker.setPopup(popup);
        markers.current.push(marker);
      }
    });

    // Set up global click handler for marker buttons
    if (onMarkerClick) {
      (window as any).handleMarkerClick = (sessionId: string) => {
        onMarkerClick(sessionId);
      };
    }

  }, [sessions, onMarkerClick]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map.current && center) {
      map.current.setCenter(center);
    }
  }, [center]);

  return (
    <div 
      ref={mapContainer} 
      className={`mapbox-container ${className}`}
      style={{ 
        width: '100%', 
        height: height,
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};

export default Map;
