import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { createIntersection, createEmergency, updateSimulationConfig, getSimulationConfig, getTrafficStats, getEmergencies } from '../services/api';
import { MapPin, AlertOctagon, Plus, BadgeAlert, Shield, Lock, Sliders, Activity, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const IDENTITIES = {
    AUTHORITY: { label: 'Traffic Authority', role: 'ADMIN', color: 'cyan', msp: 'TrafficAuthorityMSP' },
    EMERGENCY: { label: 'Emergency Services', role: 'EMERGENCY', color: 'red', msp: 'EmergencyServicesMSP' },
    OPERATOR: { label: 'Infrastructure Operator', role: 'OBSERVER', color: 'purple', msp: 'InfrastructureOperatorMSP' }
};

const MapClickHandler = ({ onSelect }) => {
    useMapEvents({
        click: (e) => onSelect(e.latlng)
    });
    return null;
};

const NetworkManager = () => {
    const [identity, setIdentity] = useState('AUTHORITY');
    const [intName, setIntName] = useState('');
    const [selectedPos, setSelectedPos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [density, setDensity] = useState(1.0);
    const [stats, setStats] = useState({ totalVehicles: 0, activeEmergencies: 0, load: 0 });

    const tangierCenter = [35.7767, -5.8039];

    useEffect(() => {
        // Load config
        getSimulationConfig().then(config => {
            if (config?.density) setDensity(config.density);
        });

        // Load metrics
        const fetchMetrics = async () => {
            try {
                const [statRes, emgRes] = await Promise.all([getTrafficStats(), getEmergencies()]);
                const s = statRes.data;
                setStats({
                    totalVehicles: s.totalVehicles || 0,
                    activeEmergencies: emgRes.data?.length || 0,
                    load: Math.min(100, Math.floor(((s.totalVehicles || 0) / 500) * 100))
                });
            } catch (e) { console.error("Metrics fail", e); }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 10000);
        return () => clearInterval(interval);
    }, []);

    const currentId = IDENTITIES[identity];

    const handleDensityChange = async (e) => {
        const newVal = parseFloat(e.target.value);
        setDensity(newVal);
        try {
            await updateSimulationConfig({ density: newVal });
            toast.success(`Traffic Density: ${(newVal * 100).toFixed(0)}%`);
        } catch (error) { toast.error("Config update failed"); }
    };

    const handleAddIntersection = async (e) => {
        e.preventDefault();
        if (!selectedPos) return toast.error("Select location on map first!");

        setLoading(true);
        try {
            await createIntersection({
                id: `INT-${Math.floor(Math.random() * 1000)}`,
                name: intName,
                location: {
                    latitude: selectedPos.lat,
                    longitude: selectedPos.lng
                }
            });
            toast.success("Intersection Deployed to Ledger");
            setIntName('');
            setSelectedPos(null);
        } catch (error) { toast.error("Deployment Failed"); }
        finally { setLoading(false); }
    };

    const handleEmergency = async (type) => {
        if (!selectedPos) return toast.error("Click map to set emergency epicenter!");
        const tid = toast.loading("Dispatching...");
        try {
            await createEmergency({
                id: `EMG-${Date.now()}`,
                type,
                severity: 'CRITICAL',
                location: { latitude: selectedPos.lat, longitude: selectedPos.lng },
                status: 'ACTIVE'
            });
            toast.success(`${type} Unit Dispatched`, { id: tid });
            setSelectedPos(null);
        } catch (e) { toast.error("Dispatch Failed", { id: tid }); }
    };

    return (
        <div className="space-y-6">
            {/* 1. Identity & Live Metrics Header */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                <div className="flex-1 bg-[#1e293b] p-4 rounded-xl border border-slate-700 flex flex-wrap gap-6 items-center">
                    <Metric icon={<Zap className="text-yellow-400" />} label="Network Load" value={`${stats.load}%`} />
                    <Metric icon={<Users className="text-cyan-400" />} label="Active Agents" value={stats.totalVehicles} />
                    <Metric icon={<BadgeAlert className="text-red-500" />} label="Incident Queue" value={stats.activeEmergencies} />

                    <div className="ml-auto flex bg-[#0f172a] p-1 rounded-lg border border-slate-700">
                        {Object.entries(IDENTITIES).map(([key, id]) => (
                            <button
                                key={key}
                                onClick={() => setIdentity(key)}
                                className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center ${identity === key ? `bg-${id.color}-500/20 text-${id.color}-400` : 'text-slate-500'
                                    }`}
                            >
                                {identity === key && <Shield className="w-3 h-3 mr-1" />}
                                {id.label.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Map Selector (Left 2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-[#1e293b] p-2 rounded-xl border border-slate-700 h-[500px] relative overflow-hidden group">
                        <MapContainer center={tangierCenter} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                            <MapClickHandler onSelect={setSelectedPos} />
                            {selectedPos && <Marker position={selectedPos} />}
                        </MapContainer>
                        <div className="absolute top-4 left-4 z-[1000] bg-black/80 px-4 py-2 rounded-lg border border-cyan-500/30 text-xs text-cyan-400 font-mono flex items-center">
                            <Activity className="w-3 h-3 mr-2 animate-pulse" />
                            CLICK MAP TO SET COORDINATES
                        </div>
                    </div>

                    {/* Density Slider */}
                    <div className={`p-6 rounded-xl border transition-all ${currentId.role === 'ADMIN' ? 'bg-cyan-500/5 border-cyan-500/30' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Sliders className="w-5 h-5 text-cyan-400" />
                                <span className="font-bold text-white uppercase tracking-wider text-sm">Traffic Density Controller</span>
                            </div>
                            {currentId.role !== 'ADMIN' && <Lock className="w-4 h-4 text-slate-500" />}
                        </div>
                        <input
                            type="range" min="0.2" max="3" step="0.2" value={density}
                            onChange={handleDensityChange}
                            disabled={currentId.role !== 'ADMIN'}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono uppercase">
                            <span>Ghost Town (20%)</span>
                            <span>Standard (100%)</span>
                            <span>Critical Chaos (300%)</span>
                        </div>
                    </div>
                </div>

                {/* 3. Terminal/Forms (Right 1/3) */}
                <div className="space-y-6">
                    {/* Form 1: Infrastructure */}
                    <div className={`p-6 rounded-xl border transition-all relative ${currentId.role === 'ADMIN' ? 'bg-[#1e293b] border-slate-700' : 'bg-[#1e293b] border-slate-800 opacity-75'}`}>
                        <div className="flex items-center mb-4 text-cyan-400">
                            <MapPin className="w-5 h-5 mr-2" />
                            <h3 className="font-bold">Expansion Protocol</h3>
                        </div>
                        <form onSubmit={handleAddIntersection} className="space-y-4">
                            <input
                                type="text" placeholder="Intersection Name" value={intName}
                                onChange={e => setIntName(e.target.value)}
                                className="w-full bg-black/40 border border-slate-700 rounded p-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                                required
                            />
                            <div className="p-3 bg-black/40 border border-slate-800 rounded text-[10px] space-y-1 font-mono">
                                <div className="text-slate-500 uppercase">Target Coordinates</div>
                                <div className="text-cyan-400">{selectedPos ? `${selectedPos.lat.toFixed(6)}, ${selectedPos.lng.toFixed(6)}` : 'NOT SELECTED'}</div>
                            </div>
                            <button
                                type="submit" disabled={loading || currentId.role !== 'ADMIN'}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 py-3 rounded font-bold transition-all uppercase text-xs"
                            >
                                {loading ? 'Processing...' : 'Deploy Smart Light'}
                            </button>
                        </form>
                    </div>

                    {/* Form 2: Emergency */}
                    <div className={`p-6 rounded-xl border transition-all ${currentId.role === 'EMERGENCY' ? 'bg-red-500/5 border-red-500/30 shadow-lg shadow-red-500/5' : 'bg-[#1e293b] border-slate-800 opacity-75'}`}>
                        <div className="flex items-center mb-4 text-red-500">
                            <BadgeAlert className="w-5 h-5 mr-2" />
                            <h3 className="font-bold text-white">Emergency Override</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <EmergencyBtn icon={<Shield className="w-4 h-4" />} title="POLICE" onClick={() => handleEmergency('POLICE')} disabled={currentId.role !== 'EMERGENCY'} color="blue" />
                            <EmergencyBtn icon={<Zap className="w-4 h-4" />} title="MEDICAL" onClick={() => handleEmergency('AMBULANCE')} disabled={currentId.role !== 'EMERGENCY'} color="red" />
                        </div>
                        <p className="mt-4 text-[10px] text-slate-500 italic">Blockchain locks all signals on target path to GREEN for override.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Metric = ({ icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-lg">{icon}</div>
        <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{label}</div>
            <div className="text-lg font-mono font-bold text-white">{value}</div>
        </div>
    </div>
);

const EmergencyBtn = ({ icon, title, onClick, disabled, color }) => (
    <button
        onClick={onClick} disabled={disabled}
        className={`flex flex-col items-center justify-center p-4 rounded-lg border border-${color}-500/30 bg-black/40 hover:bg-${color}-500/10 transition-all group disabled:opacity-50`}
    >
        <div className={`text-${color}-500 mb-2 group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className="text-[10px] font-bold text-white">{title}</span>
    </button>
);

export default NetworkManager;
