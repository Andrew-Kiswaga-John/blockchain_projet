import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TrafficMap from './components/TrafficMap';
import EmergencyControl from './components/EmergencyControl';
import { getIntersections, getEmergencies, createEmergency, getTrafficStats } from './services/api';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [intersections, setIntersections] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [stats, setStats] = useState({});

  // Load initial data
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll every 5s (in addition to sockets)
    return () => clearInterval(interval);
  }, []);

  // WebSocket listeners
  useEffect(() => {
    socket.on('traffic:update', (data) => {
      // Optimistic update or refresh
      loadData();
    });

    socket.on('emergency:new', (data) => {
      setEmergencies(prev => [...prev, data]);
    });

    return () => {
      socket.off('traffic:update');
      socket.off('emergency:new');
    };
  }, []);

  const loadData = async () => {
    try {
      const intsResponse = await getIntersections();
      if (intsResponse.success && Array.isArray(intsResponse.data)) {
        setIntersections(intsResponse.data);
      }

      const emgsResponse = await getEmergencies();
      if (emgsResponse.success && Array.isArray(emgsResponse.data)) {
        setEmergencies(emgsResponse.data);
      }

      const statsResponse = await getTrafficStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setStats(prev => ({ ...prev, error: `Connection Error: ${error.message}` }));
    }
  };

  const handleCreateEmergency = async (data) => {
    try {
      await createEmergency({
        emergencyId: `EMG-${Date.now()}`,
        ...data,
        latitude: data.location.latitude,
        longitude: data.location.longitude
      });
      setShowEmergencyPanel(false);
      setSelectedLocation(null);
      loadData(); // Refresh immediate
    } catch (err) {
      console.error("Failed to create emergency:", err);
      alert("Failed to create emergency: " + err.message);
    }
  };

  const toggleEmergencyPanel = () => {
    setShowEmergencyPanel(!showEmergencyPanel);
    if (!showEmergencyPanel) {
      // If opening panel, reset selection
      setSelectedLocation(null);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🏙️ Traffic Core - Tangier</h1>
        <div className="header-stats">
          {stats.error ? (
            <span style={{ color: '#ff4444', fontWeight: 'bold' }}>⚠️ {stats.error}</span>
          ) : (
            <>
              <span>🚦 Intersections: {intersections.length}</span>
              <span>🚨 Active Emergencies: {emergencies.length}</span>
              <span>🚗 Traffic Speed: {stats.averageSpeed || 0} km/h</span>
            </>
          )}
        </div>
        <button
          className="emergency-btn"
          onClick={toggleEmergencyPanel}
          style={{ backgroundColor: showEmergencyPanel ? '#b71c1c' : '#d32f2f' }}
        >
          {showEmergencyPanel ? 'Cancel Deployment' : '⚠️ DEPLOY EMERGENCY'}
        </button>
      </header>

      <div className="map-wrapper" style={{ height: 'calc(100vh - 60px)', position: 'relative' }}>
        <TrafficMap
          intersections={intersections}
          emergencies={emergencies}
          onLocationSelect={setSelectedLocation}
          isSelectingLocation={showEmergencyPanel}
        />

        {showEmergencyPanel && (
          <EmergencyControl
            onDeploy={handleCreateEmergency}
            onClose={() => setShowEmergencyPanel(false)}
            selectedLocation={selectedLocation}
          />
        )}
      </div>
    </div>
  );
}

export default App;
