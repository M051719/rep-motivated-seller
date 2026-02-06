import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, AlertCircle } from "lucide-react";

interface PropertyLocation {
  address: string;
  latitude: number;
  longitude: number;
  isMainProperty?: boolean;
}

interface PropertyMapProps {
  mainProperty: PropertyLocation;
  comparables?: PropertyLocation[];
  height?: string;
  showControls?: boolean;
}

const PropertyMap: React.FC<PropertyMapProps> = ({
  mainProperty,
  comparables = [],
  height = "400px",
  showControls = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Mapbox token is configured
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

    if (!mapboxToken) {
      setMapError(
        "Mapbox token not configured. Add VITE_MAPBOX_TOKEN to your .env file.",
      );
      setIsLoading(false);
      return;
    }

    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = mapboxToken;

    try {
      // Create map centered on main property
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [mainProperty.longitude, mainProperty.latitude],
        zoom: 13,
        attributionControl: false,
      });

      // Add navigation controls
      if (showControls) {
        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
      }

      // Add main property marker (larger, different color)
      const mainMarkerEl = document.createElement("div");
      mainMarkerEl.className = "custom-marker main-property";
      mainMarkerEl.style.width = "40px";
      mainMarkerEl.style.height = "40px";
      mainMarkerEl.style.borderRadius = "50%";
      mainMarkerEl.style.backgroundColor = "#3B82F6";
      mainMarkerEl.style.border = "4px solid white";
      mainMarkerEl.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
      mainMarkerEl.style.cursor = "pointer";

      const mainMarker = new mapboxgl.Marker(mainMarkerEl)
        .setLngLat([mainProperty.longitude, mainProperty.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div style="padding: 8px;">
                <strong style="color: #3B82F6; font-size: 14px;">Main Property</strong>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">${mainProperty.address}</p>
              </div>
            `),
        )
        .addTo(map.current);

      // Add comparable property markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([mainProperty.longitude, mainProperty.latitude]);

      comparables.forEach((comp, index) => {
        const compMarkerEl = document.createElement("div");
        compMarkerEl.className = "custom-marker comparable";
        compMarkerEl.style.width = "30px";
        compMarkerEl.style.height = "30px";
        compMarkerEl.style.borderRadius = "50%";
        compMarkerEl.style.backgroundColor = "#10B981";
        compMarkerEl.style.border = "3px solid white";
        compMarkerEl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
        compMarkerEl.style.cursor = "pointer";
        compMarkerEl.style.display = "flex";
        compMarkerEl.style.alignItems = "center";
        compMarkerEl.style.justifyContent = "center";
        compMarkerEl.style.color = "white";
        compMarkerEl.style.fontSize = "12px";
        compMarkerEl.style.fontWeight = "bold";
        compMarkerEl.textContent = (index + 1).toString();

        new mapboxgl.Marker(compMarkerEl)
          .setLngLat([comp.longitude, comp.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <div style="padding: 8px;">
                  <strong style="color: #10B981; font-size: 14px;">Comparable #${index + 1}</strong>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #6B7280;">${comp.address}</p>
                </div>
              `),
          )
          .addTo(map.current!);

        bounds.extend([comp.longitude, comp.latitude]);
      });

      // Fit map to show all markers
      if (comparables.length > 0) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        });
      }

      map.current.on("load", () => {
        setIsLoading(false);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapError(
          "Failed to load map. Please check your internet connection.",
        );
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(
        error instanceof Error ? error.message : "Failed to initialize map",
      );
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mainProperty, comparables, showControls]);

  // Error state
  if (mapError) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600 text-center px-4 mb-2 font-semibold">
          Map Unavailable
        </p>
        <p className="text-sm text-gray-500 text-center px-4 max-w-md">
          {mapError}
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md">
          <p className="text-xs text-blue-800">
            <strong>To enable maps:</strong>
            <br />
            1. Get a free token at{" "}
            <a
              href="https://www.mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              mapbox.com
            </a>
            <br />
            2. Add{" "}
            <code className="bg-blue-100 px-1 rounded">
              VITE_MAPBOX_TOKEN=your_token
            </code>{" "}
            to your .env file
            <br />
            3. Restart the dev server
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <div ref={mapContainer} style={{ height }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white"></div>
          <span className="text-gray-700">Main Property</span>
        </div>
        {comparables.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
            <span className="text-gray-700">Comparables</span>
          </div>
        )}
      </div>

      {/* Property count badge */}
      {comparables.length > 0 && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-semibold text-gray-700">
          <MapPin className="w-4 h-4 inline mr-1" />
          {comparables.length + 1} Properties
        </div>
      )}
    </div>
  );
};

export default PropertyMap;
