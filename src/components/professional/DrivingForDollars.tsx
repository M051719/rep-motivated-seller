// src/components/professional/DrivingForDollars.tsx
import React, { useState, useEffect } from 'react';

const DrivingForDollars: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    }
  }, []);

  const markProperty = () => {
    if (!currentLocation) return;
    
    const property = {
      id: Date.now(),
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      timestamp: new Date().toISOString(),
      notes: '',
      photos: [],
      condition: 'unknown',
      type: 'single-family'
    };
    
    setProperties([...properties, property]);
    
    // Save to local storage
    localStorage.setItem('driving-properties', JSON.stringify([...properties, property]));
  };

  const takePhoto = async (propertyId: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Implementation for photo capture
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">🚗 Driving for Dollars (Free)</h1>
      
      {/* Map View */}
      <div className="bg-gray-200 h-64 rounded-lg mb-4 relative">
        {currentLocation && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <p className="text-sm">Current Location:</p>
              <p className="font-mono text-xs">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Add Button */}
      <button
        onClick={markProperty}
        className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-bold mb-4"
      >
        📍 Mark Property
      </button>
      
      {/* Property List */}
      <div className="space-y-3">
        {properties.map(property => (
          <div key={property.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Property #{property.id}</p>
                <p className="text-xs text-gray-500">
                  {new Date(property.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => takePhoto(property.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
              >
                📷 Photo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrivingForDollars;