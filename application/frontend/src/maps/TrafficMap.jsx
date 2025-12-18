import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icon
const vehicleIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWiIgZmlsbD0iIzQyODVGNCIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjkiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Emergency icon
const emergencyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWiIgZmlsbD0iI0VBNDMzNSIvPgo8cGF0aCBkPSJNMTIgNkwxMyA5TDE2IDkuNUwxMyAxMUwxNCAxNEwxMiAxMkwxMCAxNEwxMSAxMUw4IDkuNUwxMSA5TDEyIDZaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const TrafficMap = ({ vehicles = [], emergencies = [], onMapClick }) => {
  const defaultCenter = [33.5731, -7.5898]; // Casablanca, Morocco
  const defaultZoom = 13;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render Vehicles */}
        {vehicles.map((vehicle) => (
          <Marker 
            key={vehicle.vehicleId} 
            position={[vehicle.location.latitude, vehicle.location.longitude]}
            icon={vehicleIcon}
          >
            <Popup>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                  🚗 {vehicle.vehicleId}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Type:</strong> {vehicle.type}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Owner:</strong> {vehicle.owner}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  <strong>Speed:</strong> {vehicle.speed || 0} km/h
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                  Last update: {new Date(vehicle.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Emergencies */}
        {emergencies.map((emergency) => (
          <React.Fragment key={emergency.emergencyId}>
            <Marker 
              position={[emergency.location.latitude, emergency.location.longitude]}
              icon={emergencyIcon}
            >
              <Popup>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#EA4335' }}>
                    🚨 {emergency.type}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '12px' }}>
                    <strong>ID:</strong> {emergency.emergencyId}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '12px' }}>
                    <strong>Severity:</strong> <span style={{ 
                      color: emergency.severity === 'CRITICAL' ? '#EA4335' : 
                             emergency.severity === 'HIGH' ? '#FF9800' : '#4CAF50'
                    }}>{emergency.severity}</span>
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '12px' }}>
                    <strong>Status:</strong> {emergency.status}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '12px' }}>
                    {emergency.location.address}
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[emergency.location.latitude, emergency.location.longitude]}
              radius={500}
              pathOptions={{ 
                color: '#EA4335', 
                fillColor: '#EA4335', 
                fillOpacity: 0.1 
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default TrafficMap;
