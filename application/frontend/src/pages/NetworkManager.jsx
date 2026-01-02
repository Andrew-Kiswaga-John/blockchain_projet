import React, { useState } from 'react';
import { createIntersection, createEmergency } from '../services/api';
import { MapPin, AlertOctagon, Plus, BadgeAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const NetworkManager = () => {
    const [intName, setIntName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddIntersection = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Random location near Tangier center for demo if not specified
            const baseLat = 35.77;
            const baseLng = -5.80;
            const randomOffset = () => (Math.random() - 0.5) * 0.05;

            await createIntersection({
                id: `INT-${Math.floor(Math.random() * 1000)}`,
                name: intName,
                location: {
                    latitude: baseLat + randomOffset(),
                    longitude: baseLng + randomOffset()
                }
            });
            toast.success("Intersection Added to Fabric Ledger");
            setIntName('');
        } catch (error) {
            toast.error("Failed to add intersection");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmergency = async (type) => {
        const toastId = toast.loading("Dispatching Emergency...");
        try {
            await createEmergency({
                id: `EMG-${Date.now()}`,
                type,
                severity: 'HIGH',
                location: { latitude: 35.7767, longitude: -5.8039 }, // Default center
                status: 'ACTIVE'
            });
            toast.success(`${type} Alert Broadcasted!`, { id: toastId });
        } catch (error) {
            toast.error("Dispatch Failed", { id: toastId });
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white mb-2">Network Control</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Infrastructure Management */}
                <div className="bg-[#1e293b] p-8 rounded-xl border border-slate-700">
                    <div className="flex items-center mb-6">
                        <MapPin className="text-cyan-400 w-6 h-6 mr-3" />
                        <h3 className="text-xl font-bold text-white">Infrastructure Expansion</h3>
                    </div>

                    <form onSubmit={handleAddIntersection} className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Intersection Name</label>
                            <input
                                type="text"
                                value={intName}
                                onChange={(e) => setIntName(e.target.value)}
                                placeholder="e.g. Hassan II Ave"
                                className="w-full bg-[#0f172a] border border-slate-600 rounded p-3 text-white focus:border-cyan-500 outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded font-bold transition-all flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Deploy Smart Intersection
                        </button>
                    </form>
                </div>

                {/* Emergency Controls */}
                <div className="bg-[#1e293b] p-8 rounded-xl border border-slate-700">
                    <div className="flex items-center mb-6">
                        <BadgeAlert className="text-red-500 w-6 h-6 mr-3" />
                        <h3 className="text-xl font-bold text-white">Emergency Override</h3>
                    </div>
                    <p className="text-slate-400 mb-6 text-sm">
                        Broadcast high-priority emergency signals to the blockchain. All traffic lights will automatically synchronize to green for the path.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleCreateEmergency('AMBULANCE')}
                            className="p-4 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-400 rounded-xl flex flex-col items-center justify-center transition-all"
                        >
                            <BadgeAlert className="w-8 h-8 mb-2" />
                            <span className="font-bold">AMBULANCE</span>
                        </button>

                        <button
                            onClick={() => handleCreateEmergency('FIRE')}
                            className="p-4 bg-orange-500/10 border border-orange-500/50 hover:bg-orange-500/20 text-orange-400 rounded-xl flex flex-col items-center justify-center transition-all"
                        >
                            <AlertOctagon className="w-8 h-8 mb-2" />
                            <span className="font-bold">FIRE DEPT</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkManager;
