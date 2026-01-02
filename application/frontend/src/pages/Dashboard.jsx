import React, { useEffect, useState } from 'react';
import TrafficMap from '../components/TrafficMap';
import { getTrafficStats, getIntersections, getEmergencies } from '../services/api';
import { Activity, Car, Zap } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ tps: 0, vehicles: 0, errors: 0 });
    const [intersections, setIntersections] = useState([]);
    const [emergencies, setEmergencies] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getTrafficStats();
                if (data.success) setStats(data.data);

                const ints = await getIntersections();
                if (ints.success) setIntersections(ints.data);

                const emgs = await getEmergencies();
                if (emgs.success) setEmergencies(emgs.data);
            } catch (e) { console.error(e) }
        };
        fetchStats();
        const int = setInterval(fetchStats, 5000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Car className="text-cyan-400" />}
                    label="Active Vehicles"
                    value={stats.totalVehicles || 0}
                />
                <StatCard
                    icon={<Activity className="text-green-400" />}
                    label="Avg Field Speed"
                    value={`${stats.averageSpeed || 0} km/h`}
                    sub="Network Average"
                />
                <StatCard
                    icon={<Zap className="text-yellow-400" />}
                    label="Active Alerts"
                    value={emergencies.length + (stats.congestionBreakdown?.CRITICAL || 0)}
                    sub="Emergencies & Critical Jams"
                />
            </div>

            {/* Map Area */}
            <div className="h-[600px] w-full bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden relative shadow-2xl">
                <div className="absolute top-4 left-4 z-10 bg-black/80 text-white px-3 py-1 rounded text-xs font-bold border border-slate-600">
                    LIVE TRAFFIC FEED
                </div>
                {/* Reusing existing component but styled */}
                <div className="w-full h-full opacity-90 invert-[.9] hue-rotate-180 contrast-125">
                    <TrafficMap intersections={intersections} emergencies={emergencies} />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, sub }) => (
    <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 flex items-center space-x-4">
        <div className="p-3 bg-slate-800 rounded-lg">{icon}</div>
        <div>
            <div className="text-slate-400 text-sm">{label}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
    </div>
);

export default Dashboard;