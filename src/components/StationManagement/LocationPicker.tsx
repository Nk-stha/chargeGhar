"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./LocationPicker.module.css";
import { FiSearch, FiX, FiMapPin } from "react-icons/fi";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
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

// Component to update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, {
      duration: 1.5,
    });
  }, [center, map]);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Geocoding search function using Nominatim
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&addressdetails=1`,
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(value);
      }, 500);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectLocation = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    handleLocationChange(lat, lng);
    setSearchQuery(result.display_name);
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Don't render on server
  if (!mounted) {
    return (
      <div className={styles.mapPlaceholder} style={{ height }}>
        <div className={styles.loading}>Loading map...</div>
      </div>
    );
  }

  return (
    <div className={styles.locationPickerContainer}>
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a location (e.g., Kathmandu, Nepal)"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              className={styles.clearBtn}
              onClick={handleClearSearch}
              type="button"
            >
              <FiX />
            </button>
          )}
          {isSearching && (
            <div className={styles.searchSpinner}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                className={styles.searchResultItem}
                onClick={() => handleSelectLocation(result)}
                type="button"
              >
                <FiMapPin className={styles.resultIcon} />
                <span className={styles.resultText}>{result.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && !isSearching && (
          <div className={styles.noResults}>
            <p>No locations found. Try a different search term.</p>
          </div>
        )}
      </div>

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
        <span>
          Search for a location or click anywhere on the map to set it
        </span>
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
          <MapUpdater center={position} />
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
