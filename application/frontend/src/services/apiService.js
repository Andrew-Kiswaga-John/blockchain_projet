import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const apiService = {
  // Network info
  getNetworkInfo: async () => {
    const response = await axios.get(`${API_BASE_URL}/network/info`);
    return response.data;
  },

  // Traffic
  getVehicles: async () => {
    const response = await axios.get(`${API_BASE_URL}/traffic/vehicles`);
    return response.data;
  },

  submitVehicleUpdate: async (vehicleData) => {
    const response = await axios.post(`${API_BASE_URL}/traffic/update`, vehicleData);
    return response.data;
  },

  // Emergency
  getEmergencies: async () => {
    const response = await axios.get(`${API_BASE_URL}/emergency/list`);
    return response.data;
  },

  createEmergency: async (emergencyData) => {
    const response = await axios.post(`${API_BASE_URL}/emergency/create`, emergencyData);
    return response.data;
  },

  // Transactions
  getTransactions: async (limit = 50) => {
    const response = await axios.get(`${API_BASE_URL}/transactions?limit=${limit}`);
    return response.data;
  },

  // Query chaincode
  queryChaincode: async (channelId, chaincodeId, functionName, args = []) => {
    const response = await axios.post(`${API_BASE_URL}/query`, {
      channelId,
      chaincodeId,
      functionName,
      args
    });
    return response.data;
  }
};

export default apiService;
