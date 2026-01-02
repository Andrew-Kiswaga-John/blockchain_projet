import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const trafficLightIcon = (color) => new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`
});

const emergencyIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map clicks for location selection
const LocationMarker = ({ setLocation, isSelecting }) => {
    const map = useMap();
    useEffect(() => {
        if (!isSelecting) return;

        map.on('click', (e) => {
            setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        });

        // Clean up
        return () => {
            map.off('click');
        }
    }, [map, isSelecting]);

    return null;
}

const TrafficMap = ({ intersections = [], emergencies = [], onLocationSelect, isSelectingLocation }) => {
    const tangierCenter = [35.7767, -5.8039];

    return (
        <MapContainer center={tangierCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <LocationMarker setLocation={onLocationSelect} isSelecting={isSelectingLocation} />

            {/* Traffic Intersections */}
            {intersections.map((intersection) => (
                <Marker
                    key={intersection.intersectionId || intersection.id}
                    position={[intersection.location.latitude, intersection.location.longitude]}
                    icon={trafficLightIcon(intersection.trafficLightStatus === 'RED' ? 'red' : 'green')}
                >
                    <Popup>
                        <strong>{intersection.name}</strong><br />
                        Status: {intersection.trafficLightStatus}<br />
                        Vehicles: {intersection.vehicleCount}<br />
                        Congestion: {intersection.congestionLevel}
                    </Popup>
                </Marker>
            ))}

            {/* Emergencies */}
            {emergencies.map((emergency) => (
                <Marker
                    key={emergency.emergencyId}
                    position={[emergency.location.latitude, emergency.location.longitude]}
                    icon={emergencyIcon}
                >
                    <Popup>
                        <strong>{emergency.type} ALERT</strong><br />
                        Severity: {emergency.severity}<br />
                        Status: {emergency.status}<br />
                        {emergency.description}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default TrafficMap;
