import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiService from '../../services/apiService';
import websocketService from '../../services/websocketService';
import './TrafficMap.css';

// Fix default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const TrafficMap = () => {
  const [vehicles, setVehicles] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [center] = useState([33.5731, -7.5898]); // Casablanca
  const mapRef = useRef(null);

  useEffect(() => {
    loadMapData();
    websocketService.connect();

    websocketService.on('vehicleUpdate', handleVehicleUpdate);
    websocketService.on('emergencyAlert', handleEmergencyAlert);

    const interval = setInterval(loadMapData, 10000);

    return () => {
      clearInterval(interval);
      websocketService.off('vehicleUpdate', handleVehicleUpdate);
      websocketService.off('emergencyAlert', handleEmergencyAlert);
    };
  }, []);

  const loadMapData = async () => {
    try {
      const [vehiclesData, emergenciesData] = await Promise.all([
        apiService.getVehicles(),
        apiService.getEmergencies()
      ]);

      setVehicles(vehiclesData || []);
      setEmergencies(emergenciesData?.filter(e => e.status === 'active') || []);
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  const handleVehicleUpdate = (data) => {
    setVehicles(prev => {
      const index = prev.findIndex(v => v.id === data.vehicleId);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...data };
        return updated;
      }
      return [...prev, data];
    });
  };

  const handleEmergencyAlert = (data) => {
    setEmergencies(prev => [...prev, data]);
  };

  const getVehicleIcon = (vehicle) => {
    const color = vehicle.isEmergency ? '#f44336' : '#4caf50';
    return L.divIcon({
      className: 'custom-vehicle-marker',
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const getEmergencyIcon = (emergency) => {
    return L.divIcon({
      className: 'custom-emergency-marker',
      html: `<div style="background-color: #ff9800; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #f44336; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">!</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div className="traffic-map">
      <Box mb={2}>
        <Typography variant="h4" gutterBottom className="map-title">
          Real-Time Traffic Map
        </Typography>
        <Box display="flex" gap={2}>
          <Chip label={`${vehicles.length} Vehicles`} color="success" />
          <Chip label={`${emergencies.length} Emergencies`} color="error" />
        </Box>
      </Box>

      <Card className="map-card">
        <CardContent style={{ padding: 0, height: '70vh' }}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {vehicles.map((vehicle, index) => (
              vehicle.latitude && vehicle.longitude && (
                <Marker
                  key={`vehicle-${vehicle.id || index}`}
                  position={[vehicle.latitude, vehicle.longitude]}
                  icon={getVehicleIcon(vehicle)}
                >
                  <Popup>
                    <div>
                      <strong>Vehicle ID:</strong> {vehicle.id || 'Unknown'}<br />
                      <strong>Type:</strong> {vehicle.type || 'Normal'}<br />
                      <strong>Speed:</strong> {vehicle.speed || 0} km/h<br />
                      <strong>Status:</strong> {vehicle.status || 'Active'}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {emergencies.map((emergency, index) => (
              emergency.latitude && emergency.longitude && (
                <Marker
                  key={`emergency-${emergency.id || index}`}
                  position={[emergency.latitude, emergency.longitude]}
                  icon={getEmergencyIcon(emergency)}
                >
                  <Popup>
                    <div>
                      <strong>Emergency ID:</strong> {emergency.id || 'Unknown'}<br />
                      <strong>Type:</strong> {emergency.type || 'Unknown'}<br />
                      <strong>Severity:</strong> {emergency.severity || 'Unknown'}<br />
                      <strong>Status:</strong> {emergency.status || 'Active'}
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {vehicles.filter(v => v.route).map((vehicle, index) => (
              <Polyline
                key={`route-${vehicle.id || index}`}
                positions={vehicle.route}
                color={vehicle.isEmergency ? '#f44336' : '#2196f3'}
                weight={3}
                opacity={0.7}
              />
            ))}
          </MapContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficMap;
