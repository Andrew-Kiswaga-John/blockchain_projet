import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TrafficMap from './maps/TrafficMap';
import { trafficAPI, emergencyAPI } from './services/api';
import './App.css';

const socket = io('http://localhost:3000');

function App() {
  const [intersections, setIntersections] = useState([]);
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
    socket.on('traffic:update', (data) => {
      setIntersections(prev => {
        const index = prev.findIndex(i => i.intersectionId === data.intersectionId);
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
      socket.off('traffic:update');
      socket.off('emergency:new');
    };
  }, []);

  const loadData = async () => {
    try {
      const [intersectionsRes, emergenciesRes, trafficStatsRes, emergencyStatsRes] = await Promise.all([
        trafficAPI.getAllIntersections().catch(() => ({ data: { data: [] } })),
        emergencyAPI.getActiveEmergencies().catch(() => ({ data: { data: [] } })),
        trafficAPI.getStatistics().catch(() => ({ data: { data: {} } })),
        emergencyAPI.getStatistics().catch(() => ({ data: { data: {} } }))
      ]);

      if (intersectionsRes.data.success) setIntersections(intersectionsRes.data.data);
      if (emergenciesRes.data.success) setEmergencies(emergenciesRes.data.data);
      setStats({
        traffic: trafficStatsRes.data.data || {},
        emergency: emergencyStatsRes.data.data || {}
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddIntersection = async () => {
    setLoading(true);
    try {
      const intersectionId = `INT-${Date.now()}`;
      const lat = 33.5731 + (Math.random() - 0.5) * 0.1;
      const lng = -7.5898 + (Math.random() - 0.5) * 0.1;
      
      await trafficAPI.createIntersection({
        intersectionId,
        name: `Intersection ${intersectionId}`,
        latitude: lat,
        longitude: lng
      });

      await loadData();
    } catch (error) {
      console.error('Error adding intersection:', error);
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
            <span>� Intersections</span>
            <strong>{intersections.length}</strong>
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
            <TrafficMap intersections={intersections} emergencies={emergencies} />
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
              <h3>Intersections</h3>
              <button onClick={handleAddIntersection} disabled={loading}>
                {loading ? 'Adding...' : '➕ Add Random Intersection'}
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
