import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import apiService from '../../services/apiService';
import websocketService from '../../services/websocketService';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    vehicles: 0,
    emergencies: 0,
    transactions: 0,
    networkHealth: 'Unknown'
  });
  const [loading, setLoading] = useState(true);
  const [trafficData, setTrafficData] = useState([]);
  const [emergencyData, setEmergencyData] = useState([]);

  useEffect(() => {
    loadDashboardData();
    websocketService.connect();

    websocketService.on('transaction', handleNewTransaction);
    websocketService.on('vehicleUpdate', handleVehicleUpdate);
    websocketService.on('emergencyAlert', handleEmergencyAlert);

    const interval = setInterval(loadDashboardData, 30000);

    return () => {
      clearInterval(interval);
      websocketService.off('transaction', handleNewTransaction);
      websocketService.off('vehicleUpdate', handleVehicleUpdate);
      websocketService.off('emergencyAlert', handleEmergencyAlert);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [networkInfo, vehicles, emergencies, transactions] = await Promise.all([
        apiService.getNetworkInfo(),
        apiService.getVehicles(),
        apiService.getEmergencies(),
        apiService.getTransactions(100)
      ]);

      setStats({
        vehicles: vehicles.length || 0,
        emergencies: emergencies.filter(e => e.status === 'active').length || 0,
        transactions: transactions.length || 0,
        networkHealth: networkInfo?.status || 'Unknown'
      });

      processTrafficData(transactions);
      processEmergencyData(emergencies);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const processTrafficData = (transactions) => {
    const hourlyData = {};
    transactions.forEach(tx => {
      const hour = new Date(tx.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = 0;
      }
      hourlyData[hour]++;
    });

    const chartData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: hourlyData[i] || 0
    }));

    setTrafficData(chartData);
  };

  const processEmergencyData = (emergencies) => {
    const typeCount = {};
    emergencies.forEach(em => {
      const type = em.type || 'unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const chartData = Object.keys(typeCount).map(type => ({
      type: type.toUpperCase(),
      count: typeCount[type]
    }));

    setEmergencyData(chartData);
  };

  const handleNewTransaction = (data) => {
    setStats(prev => ({ ...prev, transactions: prev.transactions + 1 }));
  };

  const handleVehicleUpdate = (data) => {
    loadDashboardData();
  };

  const handleEmergencyAlert = (data) => {
    setStats(prev => ({ ...prev, emergencies: prev.emergencies + 1 }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="dashboard">
      <Typography variant="h4" gutterBottom className="dashboard-title">
        Traffic Management Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Active Vehicles
                  </Typography>
                  <Typography variant="h4">
                    {stats.vehicles}
                  </Typography>
                </div>
                <DirectionsCarIcon style={{ fontSize: 48, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Active Emergencies
                  </Typography>
                  <Typography variant="h4">
                    {stats.emergencies}
                  </Typography>
                </div>
                <WarningIcon style={{ fontSize: 48, color: '#f44336' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Transactions
                  </Typography>
                  <Typography variant="h4">
                    {stats.transactions}
                  </Typography>
                </div>
                <ReceiptIcon style={{ fontSize: 48, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="stat-card">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <div>
                  <Typography color="textSecondary" gutterBottom>
                    Network Health
                  </Typography>
                  <Typography variant="h6">
                    {stats.networkHealth}
                  </Typography>
                </div>
                <NetworkCheckIcon style={{ fontSize: 48, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className="chart-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Traffic Activity (24h)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #4caf50' }} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#4caf50" strokeWidth={2} name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="chart-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Emergency Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emergencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="type" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #f44336' }} />
                  <Bar dataKey="count" fill="#f44336" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
