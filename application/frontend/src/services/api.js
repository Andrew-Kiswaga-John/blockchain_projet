import axios from 'axios';

const API_BASE_URL = '/api';

export const trafficAPI = {
    // Vehicles
    getAllVehicles: () => axios.get(`${API_BASE_URL}/traffic/vehicles`),
    registerVehicle: (data) => axios.post(`${API_BASE_URL}/traffic/vehicles/register`, data),
    updateVehiclePosition: (data) => axios.put(`${API_BASE_URL}/traffic/vehicles/position`, data),
    queryVehiclesByArea: (lat, lng, radius) => 
        axios.get(`${API_BASE_URL}/traffic/vehicles/area?latitude=${lat}&longitude=${lng}&radius=${radius}`),
    
    // Traffic monitoring
    getStatistics: () => axios.get(`${API_BASE_URL}/traffic/statistics`),
    updateIntersection: (data) => axios.put(`${API_BASE_URL}/traffic/intersections`, data),
    reportCongestion: (data) => axios.post(`${API_BASE_URL}/traffic/congestion`, data),
};

export const emergencyAPI = {
    getStatistics: () => axios.get(`${API_BASE_URL}/emergency/statistics`),
    createEmergency: (data) => axios.post(`${API_BASE_URL}/emergency/create`, data),
    getActiveEmergencies: () => axios.get(`${API_BASE_URL}/emergency/active`),
    getEmergency: (id) => axios.get(`${API_BASE_URL}/emergency/${id}`),
    updateStatus: (data) => axios.put(`${API_BASE_URL}/emergency/status`, data),
    assignVehicle: (data) => axios.post(`${API_BASE_URL}/emergency/assign-vehicle`, data),
};
