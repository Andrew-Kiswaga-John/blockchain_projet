import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✓ WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('✗ WebSocket disconnected');
    });

    this.socket.on('transaction', (data) => {
      this.emit('transaction', data);
    });

    this.socket.on('vehicleUpdate', (data) => {
      this.emit('vehicleUpdate', data);
    });

    this.socket.on('emergencyAlert', (data) => {
      this.emit('emergencyAlert', data);
    });

    this.socket.on('blockCommitted', (data) => {
      this.emit('blockCommitted', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}

export default new WebSocketService();
