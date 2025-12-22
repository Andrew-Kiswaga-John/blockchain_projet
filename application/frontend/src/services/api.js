import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

export const getIntersections = async () => {
    const response = await api.get('/traffic/intersections');
    return response.data;
};

export const getEmergencies = async () => {
    const response = await api.get('/emergency/active');
    return response.data;
};

export const createEmergency = async (emergencyData) => {
    const response = await api.post('/emergency/create', emergencyData);
    return response.data;
};

export const getTrafficStats = async () => {
    const response = await api.get('/traffic/statistics');
    return response.data;
};
