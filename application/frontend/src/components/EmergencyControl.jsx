import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, MenuItem, Box, IconButton } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

const EmergencyControl = ({ onDeploy, onClose, selectedLocation }) => {
    const [type, setType] = useState('ACCIDENT');
    const [severity, setSeverity] = useState('HIGH');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onDeploy({
            type,
            severity,
            description,
            location: selectedLocation
        });
    };

    return (
        <Paper
            elevation={3}
            className="emergency-panel"
            sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 1000,
                padding: 3,
                width: 300,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderLeft: '5px solid #d32f2f'
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="error" />
                    <Typography variant="h6" color="error">
                        Emergency Dispatch
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {!selectedLocation ? (
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Please clicking a location on the map to deploy emergency services.
                </Typography>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: '#ffebee', borderRadius: 1 }}>
                        📍 Lat: {selectedLocation.latitude.toFixed(4)}, Lng: {selectedLocation.longitude.toFixed(4)}
                    </Typography>

                    <TextField
                        select
                        fullWidth
                        label="Type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        margin="dense"
                        size="small"
                    >
                        <MenuItem value="ACCIDENT">Accident</MenuItem>
                        <MenuItem value="FIRE">Fire</MenuItem>
                        <MenuItem value="MEDICAL">Medical</MenuItem>
                        <MenuItem value="POLICE">Police</MenuItem>
                        <MenuItem value="NATURAL_DISASTER">Natural Disaster</MenuItem>
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label="Severity"
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        margin="dense"
                        size="small"
                    >
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="CRITICAL">Critical</MenuItem>
                    </TextField>

                    <TextField
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={2}
                        margin="dense"
                        size="small"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="error"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        🚀 Deploy Unit
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default EmergencyControl;
