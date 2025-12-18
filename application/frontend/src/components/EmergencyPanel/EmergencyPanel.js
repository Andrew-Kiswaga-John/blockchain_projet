import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Typography, Box, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, Chip, Grid, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import apiService from '../../services/apiService';
import websocketService from '../../services/websocketService';
import './EmergencyPanel.css';

const EmergencyPanel = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newEmergency, setNewEmergency] = useState({
    type: '',
    severity: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadEmergencies();
    websocketService.connect();

    websocketService.on('emergencyAlert', handleNewEmergency);

    const interval = setInterval(loadEmergencies, 15000);

    return () => {
      clearInterval(interval);
      websocketService.off('emergencyAlert', handleNewEmergency);
    };
  }, []);

  const loadEmergencies = async () => {
    try {
      const data = await apiService.getEmergencies();
      setEmergencies(data || []);
    } catch (error) {
      console.error('Error loading emergencies:', error);
    }
  };

  const handleNewEmergency = (data) => {
    setEmergencies(prev => [data, ...prev]);
    setAlert({ severity: 'error', message: `New emergency alert: ${data.type}` });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiService.createEmergency(newEmergency);
      setAlert({ severity: 'success', message: 'Emergency reported successfully' });
      setOpenDialog(false);
      setNewEmergency({ type: '', severity: '', location: '', description: '' });
      loadEmergencies();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to report emergency' });
    }
    setLoading(false);
    setTimeout(() => setAlert(null), 5000);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'error';
      case 'resolved': return 'success';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="emergency-panel">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" className="panel-title">
          Emergency Management
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Report Emergency
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card className="emergency-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Emergencies ({emergencies.filter(e => e.status === 'active').length})
              </Typography>
              <List>
                {emergencies.length === 0 ? (
                  <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                    No emergencies reported
                  </Typography>
                ) : (
                  emergencies.map((emergency, index) => (
                    <ListItem
                      key={emergency.id || index}
                      className="emergency-item"
                      divider
                    >
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1">
                              {emergency.type || 'Unknown Type'}
                            </Typography>
                            <Chip
                              label={emergency.severity || 'Unknown'}
                              color={getSeverityColor(emergency.severity)}
                              size="small"
                            />
                            <Chip
                              label={emergency.status || 'Unknown'}
                              color={getStatusColor(emergency.status)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Location:</strong> {emergency.location || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <strong>Description:</strong> {emergency.description || 'No description'}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Reported: {emergency.timestamp ? new Date(emergency.timestamp).toLocaleString() : 'Unknown'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report New Emergency</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Emergency Type"
              select
              SelectProps={{ native: true }}
              value={newEmergency.type}
              onChange={(e) => setNewEmergency({ ...newEmergency, type: e.target.value })}
              fullWidth
            >
              <option value="">Select Type</option>
              <option value="fire">Fire</option>
              <option value="accident">Accident</option>
              <option value="medical">Medical</option>
              <option value="hazard">Hazard</option>
              <option value="other">Other</option>
            </TextField>

            <TextField
              label="Severity"
              select
              SelectProps={{ native: true }}
              value={newEmergency.severity}
              onChange={(e) => setNewEmergency({ ...newEmergency, severity: e.target.value })}
              fullWidth
            >
              <option value="">Select Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </TextField>

            <TextField
              label="Location"
              value={newEmergency.location}
              onChange={(e) => setNewEmergency({ ...newEmergency, location: e.target.value })}
              fullWidth
            />

            <TextField
              label="Description"
              value={newEmergency.description}
              onChange={(e) => setNewEmergency({ ...newEmergency, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={loading || !newEmergency.type || !newEmergency.severity}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmergencyPanel;
