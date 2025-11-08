"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./LocationPicker.module.css";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

// Component to handle map clicks
function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
}) => {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number]>([
    latitude,
    longitude,
  ]);
  const markerRef = useRef<L.Marker>(null);

  // Only render map on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position when props change
  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const handleLocationChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  // Don't render on server
  if (!mounted) {
    return (
      <div
        className={styles.mapPlaceholder}
        style={{ height }}
      >
        <div className={styles.loading}>Loading map...</div>
      </div>
    );
  }

  return (
    <div className={styles.locationPickerContainer}>
      <div className={styles.instructions}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Click anywhere on the map to set the location</span>
      </div>

      <div className={styles.mapWrapper} style={{ height }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%", borderRadius: "10px" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationChange={handleLocationChange} />
          <Marker position={position} ref={markerRef} />
        </MapContainer>
      </div>

      <div className={styles.coordinates}>
        <div className={styles.coordItem}>
          <span className={styles.coordLabel}>Latitude:</span>
          <span className={styles.coordValue}>{latitude.toFixed(6)}</span>
        </div>
        <div className={styles.coordItem}>
          <span className={styles.coordLabel}>Longitude:</span>
          <span className={styles.coordValue}>{longitude.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
