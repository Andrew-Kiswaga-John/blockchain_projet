import React, { useState } from 'react';
import { Paper, Typography, Button, TextField, Box, IconButton } from '@mui/material';
import TrafficIcon from '@mui/icons-material/Traffic';
import CloseIcon from '@mui/icons-material/Close';

const IntersectionControl = ({ onCreate, onClose, selectedLocation }) => {
    const [intersectionId, setIntersectionId] = useState(`INT-${Date.now()}`);
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({
            intersectionId,
            name,
            location: selectedLocation
        });
    };

    return (
        <Paper
            elevation={3}
            className="intersection-panel"
            sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 1000,
                padding: 3,
                width: 300,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderLeft: '5px solid #2e7d32'
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                    <TrafficIcon color="success" />
                    <Typography variant="h6" color="success">
                        New Intersection
                    </Typography>
                </Box>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {!selectedLocation ? (
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Please click a location on the map to place the intersection.
                </Typography>
            ) : (
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="body2" sx={{ mb: 2, p: 1, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                        📍 Lat: {selectedLocation.latitude.toFixed(4)}, Lng: {selectedLocation.longitude.toFixed(4)}
                    </Typography>

                    <TextField
                        fullWidth
                        label="Intersection ID"
                        value={intersectionId}
                        onChange={(e) => setIntersectionId(e.target.value)}
                        margin="dense"
                        size="small"
                        required
                    />

                    <TextField
                        fullWidth
                        label="Intersection Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Main St & 5th Ave"
                        margin="dense"
                        size="small"
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Create Intersection
                    </Button>
                </Box>
            )}
        </Paper>
    );
};

export default IntersectionControl;
