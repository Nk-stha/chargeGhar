"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import styles from "./LocationPicker.module.css";
import { FiSearch, FiX, FiMapPin, FiNavigation } from "react-icons/fi";

// Google Maps libraries to load
const libraries: ("places")[] = ["places"];

// Nepal bounds for restricting search
const NEPAL_BOUNDS = {
  north: 30.447,
  south: 26.347,
  east: 88.201,
  west: 80.058,
};

// Default center (Kathmandu)
const DEFAULT_CENTER = { lat: 27.7172, lng: 85.324 };

// Map container style
const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "12px",
};

// Map options for dark theme
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#1d1d1d" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1d1d1d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3d3d3d" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#6a6a6a" }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#2d2d2d" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2d2d2d" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a3d1a" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#4a8a4a" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#3d3d3d" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9a9a9a" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4a4a4a" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0b0b0" }] },
    { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2d2d2d" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0d2d4d" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4a6a8a" }] },
  ],
  restriction: {
    latLngBounds: NEPAL_BOUNDS,
    strictBounds: false,
  },
};

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number }>({
    lat: latitude || DEFAULT_CENTER.lat,
    lng: longitude || DEFAULT_CENTER.lng,
  });
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "",
    libraries,
  });

  // Update marker when props change
  useEffect(() => {
    if (latitude && longitude) {
      const newPos = { lat: latitude, lng: longitude };
      setMarker(newPos);
      if (map) {
        map.panTo(newPos);
      }
    }
  }, [latitude, longitude, map]);

  // Handle map load
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  // Handle map click
  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      onLocationChange(lat, lng);
      setSearchValue("");
    }
  }, [onLocationChange]);

  // Handle autocomplete load
  const onAutocompleteLoad = useCallback((auto: google.maps.places.Autocomplete) => {
    setAutocomplete(auto);
  }, []);

  // Handle place selection
  const onPlaceChanged = useCallback(() => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMarker({ lat, lng });
        onLocationChange(lat, lng);
        setSearchValue(place.name || place.formatted_address || "");
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(17);
        }
      }
    }
  }, [autocomplete, map, onLocationChange]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Check if within Nepal bounds
        if (lat >= NEPAL_BOUNDS.south && lat <= NEPAL_BOUNDS.north &&
            lng >= NEPAL_BOUNDS.west && lng <= NEPAL_BOUNDS.east) {
          setMarker({ lat, lng });
          onLocationChange(lat, lng);
          if (map) {
            map.panTo({ lat, lng });
            map.setZoom(17);
          }
        } else {
          alert("Your current location is outside Nepal. Please select a location within Nepal.");
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please select manually.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [map, onLocationChange]);

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  // Loading state
  if (loadError) {
    return (
      <div className={styles.errorContainer} style={{ height }}>
        <div className={styles.errorMessage}>
          <FiMapPin size={24} />
          <p>Failed to load Google Maps</p>
          <span>Please check your internet connection</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={styles.mapPlaceholder} style={{ height }}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading Google Maps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.locationPickerContainer}>
      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
            options={{
              componentRestrictions: { country: "np" },
              fields: ["geometry", "name", "formatted_address"],
              types: ["establishment", "geocode"],
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search any place in Nepal..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Autocomplete>
          {searchValue && (
            <button className={styles.clearBtn} onClick={handleClearSearch} type="button">
              <FiX />
            </button>
          )}
        </div>
        
        <button
          className={styles.locationBtn}
          onClick={getCurrentLocation}
          disabled={isLocating}
          type="button"
          title="Use my current location"
        >
          <FiNavigation className={isLocating ? styles.locating : ""} />
        </button>
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <FiMapPin size={14} />
        <span>Search a place or click on the map to set location</span>
      </div>

      {/* Map */}
      <div className={styles.mapWrapper} style={{ height }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={marker}
          zoom={15}
          options={mapOptions}
          onLoad={onMapLoad}
          onClick={onMapClick}
        >
          <Marker
            position={marker}
            animation={google.maps.Animation.DROP}
          />
        </GoogleMap>
      </div>

      {/* Coordinates Display */}
      <div className={styles.coordinates}>
        <div className={styles.coordItem}>
          <span className={styles.coordLabel}>Latitude</span>
          <span className={styles.coordValue}>{marker.lat.toFixed(6)}</span>
        </div>
        <div className={styles.coordItem}>
          <span className={styles.coordLabel}>Longitude</span>
          <span className={styles.coordValue}>{marker.lng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
