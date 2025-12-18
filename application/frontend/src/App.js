import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import TrafficMap from './components/TrafficMap/TrafficMap';
import EmergencyPanel from './components/EmergencyPanel/EmergencyPanel';
import TransactionFeed from './components/TransactionFeed/TransactionFeed';
import NetworkStats from './components/NetworkStats/NetworkStats';
import apiService from './services/apiService';

function App() {
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await apiService.getNetworkInfo();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>🏙️ Traffic Core - Smart City Blockchain</h1>
          </div>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/map">Traffic Map</Link>
            <Link to="/emergency">Emergency</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/network">Network</Link>
          </div>
          <div className={`connection-status ${connectionStatus}`}>
            <span className="status-dot"></span>
            {connectionStatus}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<TrafficMap />} />
          <Route path="/emergency" element={<EmergencyPanel />} />
          <Route path="/transactions" element={<TransactionFeed />} />
          <Route path="/network" element={<NetworkStats />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
