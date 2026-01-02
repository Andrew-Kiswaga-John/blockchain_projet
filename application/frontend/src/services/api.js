import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

export const getIntersections = async () => {
    const response = await api.get('/traffic/intersections');
    return response.data;
};

export const createIntersection = async (intersectionData) => {
    const response = await api.post('/traffic/intersections', intersectionData);
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

export const runConsensusTest = async (type, payload) => {
    // type: 'raft', 'poa', 'pbft'
    const response = await api.post(`/consensus/${type}`, payload);
    return response.data;
};

export const exportConsensusReport = async (results) => {
    const response = await api.post('/consensus/export-report', { results });
    return response.data;
};

export const updateSimulationConfig = async (config) => {
    const response = await api.post('/traffic/config', config);
    return response.data;
};

export const getSimulationConfig = async () => {
    const response = await api.get('/traffic/config');
    return response.data;
};

