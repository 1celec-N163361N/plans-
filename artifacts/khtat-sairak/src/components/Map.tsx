import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Stop } from '@workspace/api-client-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pendingIcon = new L.DivIcon({
  html: `
    <div style="
      width: 32px; height: 32px;
      background: rgba(99,102,241,0.9);
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 20px rgba(99,102,241,0.6);
      animation: pulse 1.5s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.7); }
        70% { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
      }
    </style>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [8, 32],
});

interface MapProps {
  stops: Stop[];
  onMapClick?: (lat: number, lng: number, name?: string) => void;
  interactive?: boolean;
  pendingPoint?: { lat: number; lng: number } | null;
}

function MapCursor({ interactive }: { interactive: boolean }) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = interactive ? 'crosshair' : '';
    return () => { container.style.cursor = ''; };
  }, [map, interactive]);
  return null;
}

function CenterOnStops({ stops }: { stops: Stop[] }) {
  const map = useMap();
  const centered = useRef(false);
  useEffect(() => {
    if (centered.current) return;
    const valid = stops.filter(s => s.lat && s.lng);
    if (valid.length === 1) {
      map.setView([valid[0].lat!, valid[0].lng!], 14);
      centered.current = true;
    } else if (valid.length > 1) {
      const bounds = L.latLngBounds(valid.map(s => [s.lat!, s.lng!] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
      centered.current = true;
    }
  }, [stops, map]);
  return null;
}

function MapClickHandler({ onClick, interactive }: { onClick?: (lat: number, lng: number, name?: string) => void; interactive: boolean }) {
  useMapEvents({
    async click(e) {
      if (!interactive || !onClick) return;
      const { lat, lng } = e.latlng;
      onClick(lat, lng, undefined);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
        const data = await res.json();
        const name =
          data.address?.amenity ||
          data.address?.road ||
          data.address?.neighbourhood ||
          data.address?.suburb ||
          data.address?.city_district ||
          data.address?.city ||
          data.display_name?.split(',')[0] ||
          '';
        if (name) onClick(lat, lng, name);
      } catch {
      }
    },
  });
  return null;
}

export function Map({ stops, onMapClick, interactive = true, pendingPoint }: MapProps) {
  const defaultCenter: [number, number] = [24.7136, 46.6753];
  const polylinePoints = stops
    .filter(s => s.lat && s.lng)
    .sort((a, b) => a.order - b.order)
    .map(s => [s.lat!, s.lng!] as [number, number]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-0">
      {interactive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md text-white text-sm px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
            انقر على الخريطة لإضافة نقطة توقف
          </div>
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCursor interactive={interactive} />
        <CenterOnStops stops={stops} />
        <MapClickHandler onClick={onMapClick} interactive={interactive} />

        {polylinePoints.length > 1 && (
          <Polyline
            positions={polylinePoints}
            color="#c9a227"
            weight={3}
            opacity={0.7}
            dashArray="8, 6"
          />
        )}

        {stops.filter(s => s.lat && s.lng).map((stop, idx) => (
          <Marker
            key={stop.id}
            position={[stop.lat!, stop.lng!]}
            icon={goldIcon}
          >
            <Popup className="font-sans" dir="rtl">
              <div className="p-2 text-right min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-base">{stop.name}</h4>
                </div>
                {stop.notes && <p className="text-gray-500 text-sm mt-1">{stop.notes}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {pendingPoint && (
          <Marker
            position={[pendingPoint.lat, pendingPoint.lng]}
            icon={pendingIcon}
          >
            <Popup dir="rtl">
              <div className="text-right text-sm font-bold p-1">نقطة جديدة — جارٍ التعرف...</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
