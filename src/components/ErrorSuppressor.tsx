"use client";

import { useEffect } from "react";

/**
 * Global error suppressor for Google Maps and other third-party library errors
 * This component suppresses console errors and warnings from external libraries
 */
export function ErrorSuppressor() {
  useEffect(() => {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Override console.error
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Suppress Google Maps errors
      if (
        message.includes("Google Maps") ||
        message.includes("ApiProjectMapError") ||
        message.includes("places.Autocomplete") ||
        message.includes("maps.googleapis.com") ||
        message.includes("migration guide")
      ) {
        return;
      }
      
      // Call original for other errors
      originalError.apply(console, args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Suppress Google Maps warnings
      if (
        message.includes("Google Maps") ||
        message.includes("places.Autocomplete") ||
        message.includes("PlaceAutocompleteElement") ||
        message.includes("migration guide") ||
        message.includes("maps.googleapis.com")
      ) {
        return;
      }
      
      // Call original for other warnings
      originalWarn.apply(console, args);
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
