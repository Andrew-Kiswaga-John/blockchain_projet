import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TrafficMap from './maps/TrafficMap';
import { trafficAPI, emergencyAPI } from './services/api';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [stats, setStats] = useState({ traffic: {}, emergency: {} });
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // WebSocket listeners
  useEffect(() => {
    socket.on('vehicle:position', (data) => {
      setVehicles(prev => {
        const index = prev.findIndex(v => v.vehicleId === data.vehicleId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data };
          return updated;
        }
        return [...prev, data];
      });
    });

    socket.on('emergency:new', (data) => {
      setEmergencies(prev => [...prev, data]);
    });

    return () => {
      socket.off('vehicle:position');
      socket.off('emergency:new');
    };
  }, []);

  const loadData = async () => {
    try {
      const [vehiclesRes, emergenciesRes, trafficStatsRes, emergencyStatsRes] = await Promise.all([
        trafficAPI.getAllVehicles().catch(() => ({ data: { data: [] } })),
        emergencyAPI.getActiveEmergencies().catch(() => ({ data: { data: [] } })),
        trafficAPI.getStatistics().catch(() => ({ data: { data: {} } })),
        emergencyAPI.getStatistics().catch(() => ({ data: { data: {} } }))
      ]);

      if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
      if (emergenciesRes.data.success) setEmergencies(emergenciesRes.data.data);
      setStats({
        traffic: trafficStatsRes.data.data || {},
        emergency: emergencyStatsRes.data.data || {}
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddVehicle = async () => {
    setLoading(true);
    try {
      const vehicleId = `VEH-${Date.now()}`;
      const lat = 33.5731 + (Math.random() - 0.5) * 0.1;
      const lng = -7.5898 + (Math.random() - 0.5) * 0.1;
      
      await trafficAPI.registerVehicle({
        vehicleId,
        type: 'CAR',
        owner: 'TrafficAuthorityMSP'
      });

      await trafficAPI.updateVehiclePosition({
        vehicleId,
        latitude: lat,
        longitude: lng,
        speed: Math.floor(Math.random() * 60),
        heading: Math.floor(Math.random() * 360)
      });

      await loadData();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleAddEmergency = async () => {
    setLoading(true);
    try {
      const emergencyId = `EMG-${Date.now()}`;
      const lat = 33.5731 + (Math.random() - 0.5) * 0.1;
      const lng = -7.5898 + (Math.random() - 0.5) * 0.1;
      
      await emergencyAPI.createEmergency({
        emergencyId,
        type: 'FIRE',
        severity: 'HIGH',
        latitude: lat,
        longitude: lng,
        address: 'Test Location',
        description: 'Test emergency incident'
      });

      await loadData();
    } catch (error) {
      console.error('Error adding emergency:', error);
      alert('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>🏙️ Smart City Traffic Core</h1>
        <div className="header-stats">
          <div className="stat-badge">
            <span>🚗 Vehicles</span>
            <strong>{vehicles.length}</strong>
          </div>
          <div className="stat-badge emergency">
            <span>🚨 Emergencies</span>
            <strong>{emergencies.length}</strong>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={activeTab === 'map' ? 'active' : ''} 
          onClick={() => setActiveTab('map')}
        >
          Map View
        </button>
        <button 
          className={activeTab === 'stats' ? 'active' : ''} 
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={activeTab === 'controls' ? 'active' : ''} 
          onClick={() => setActiveTab('controls')}
        >
          Controls
        </button>
      </div>

      {/* Main Content */}
      <div className="content">
        {activeTab === 'map' && (
          <div className="map-container">
            <TrafficMap vehicles={vehicles} emergencies={emergencies} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-panel">
            <div className="stats-grid">
              <div className="stats-card">
                <h3>Traffic Statistics</h3>
                <pre>{JSON.stringify(stats.traffic, null, 2)}</pre>
              </div>
              <div className="stats-card">
                <h3>Emergency Statistics</h3>
                <pre>{JSON.stringify(stats.emergency, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="controls-panel">
            <h2>Simulation Controls</h2>
            
            <div className="control-section">
              <h3>Vehicles</h3>
              <button onClick={handleAddVehicle} disabled={loading}>
                {loading ? 'Adding...' : '➕ Add Random Vehicle'}
              </button>
            </div>

            <div className="control-section">
              <h3>Emergency Scenarios</h3>
              <button onClick={handleAddEmergency} disabled={loading}>
                {loading ? 'Creating...' : '🚨 Trigger Emergency'}
              </button>
            </div>

            <div className="control-section">
              <h3>Network Info</h3>
              <div className="info-box">
                <p><strong>Channel:</strong> city-traffic-global</p>
                <p><strong>Emergency Channel:</strong> emergency-ops</p>
                <p><strong>Consensus:</strong> RAFT</p>
                <p><strong>Organizations:</strong> 5 peer orgs + 1 orderer</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
