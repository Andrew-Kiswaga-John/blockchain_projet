import axios from 'axios';

const API_BASE_URL = '/api';

export const trafficAPI = {
    // Intersections
    getAllIntersections: () => axios.get(`${API_BASE_URL}/traffic/intersections`),
    createIntersection: (data) => axios.post(`${API_BASE_URL}/traffic/intersections`, data),
    getIntersectionHistory: (id) => axios.get(`${API_BASE_URL}/traffic/intersections/${id}/history`),
    
    // Traffic Data
    recordTrafficData: (data) => axios.post(`${API_BASE_URL}/traffic/data`, data),
    updateTrafficLight: (data) => axios.put(`${API_BASE_URL}/traffic/light`, data),
    getStatistics: () => axios.get(`${API_BASE_URL}/traffic/statistics`),
};

export const emergencyAPI = {
    getStatistics: () => axios.get(`${API_BASE_URL}/emergency/statistics`),
    createEmergency: (data) => axios.post(`${API_BASE_URL}/emergency/create`, data),
    getActiveEmergencies: () => axios.get(`${API_BASE_URL}/emergency/active`),
    getEmergency: (id) => axios.get(`${API_BASE_URL}/emergency/${id}`),
    updateStatus: (data) => axios.put(`${API_BASE_URL}/emergency/status`, data),
    assignVehicle: (data) => axios.post(`${API_BASE_URL}/emergency/assign-vehicle`, data),
};
