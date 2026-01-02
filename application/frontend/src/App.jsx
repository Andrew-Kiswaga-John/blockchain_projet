import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import io from 'socket.io-client';


import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import BlockchainInspector from './pages/BlockchainInspector';
import NetworkManager from './pages/NetworkManager';
import ConsensusLab from './pages/ConsensusLab';

function App() {

  // SOC Alert Listener
  useEffect(() => {
    const socket = io('http://localhost:3000'); // Connect to backend

    socket.on('soc:alert', (alert) => {
      // High-Tech Notification Sound here (optional)

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#1e293b] border-l-4 border-red-500 shadow-2xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <span className="h-10 w-10 text-2xl">🚨</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  SECURITY BREACH DETECTED
                </p>
                <p className="mt-1 text-sm text-red-400 font-bold">
                  {alert.type}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {alert.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 5000 });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <BrowserRouter>
      {/* Toast Container */}
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="network" element={<NetworkManager />} />
          <Route path="consensus" element={<ConsensusLab />} />
          <Route path="blockchain" element={<BlockchainInspector />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
