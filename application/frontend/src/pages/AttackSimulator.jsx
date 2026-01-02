import React, { useState } from 'react';
import { Terminal, Play, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const AttackSimulator = () => {
    const [logs, setLogs] = useState([]);
    const [isRunning, setIsRunning] = useState(false);

    const runAttack = async (attackType) => {
        setIsRunning(true);
        setLogs([`> Initializing ${attackType}...`]);

        // Simulating the console look
        try {
            const response = await fetch('http://localhost:3000/api/simulation/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attackType })
            });

            // In a real implementation with streaming, we'd read the stream.
            // For now, we'll confirm start.
            const result = await response.json();

            if (response.ok) {
                setLogs(prev => [...prev, `> [SUCCESS] Attack Started`, ...result.logs]);
                toast.success(`${attackType} Simulation Started! Check notifications.`);
            } else {
                setLogs(prev => [...prev, `> [ERROR] Failed to start: ${result.message}`]);
                toast.error(`Failed to launch ${attackType}`);
            }

        } catch (error) {
            setLogs(prev => [...prev, `> [CRITICAL] Connection Error: ${error.message}`]);
            toast.error("Backend Connection Error");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Cyber-Warfare Room</h2>
                    <p className="text-slate-400">Launch logic-layer attacks against the Smart City Blockchain to test resilience.</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 px-4 py-2 rounded text-red-400 text-sm flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Authorized Personnel Only
                </div>
            </div>

            {/* Attack Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <AttackCard
                    title="Lying Sensor"
                    desc="Submits physically impossible data (e.g. -10 cars) to test sanity checks."
                    icon={<AlertTriangle className="text-yellow-400" />}
                    onClick={() => runAttack('lyingSensor')}
                    isLoading={isRunning}
                    color="yellow"
                />

                <AttackCard
                    title="Imposter Hack"
                    desc="Attempts unauthorized actions using a fake MSP Identity Header."
                    icon={<ShieldCheck className="text-purple-400" />}
                    onClick={() => runAttack('imposterHack')}
                    isLoading={isRunning}
                    color="purple"
                />

                <AttackCard
                    title="Race Condition"
                    desc="Spams the same Traffic Light update simultaneously to break MVCC."
                    icon={<Zap className="text-orange-400" />}
                    onClick={() => runAttack('conflict')}
                    isLoading={isRunning}
                    color="orange"
                />

                <AttackCard
                    title="Traitor (Byzantine)"
                    desc="Simulates a node refusing to vote in the PBFT Consensus process."
                    icon={<Terminal className="text-red-400" />}
                    onClick={() => runAttack('traitor')}
                    isLoading={isRunning}
                    color="red"
                />
            </div>

            {/* Live Console */}
            <div className="bg-black/80 rounded-xl border border-slate-700 p-4 font-mono text-sm h-96 overflow-y-auto shadow-2xl relative">
                <div className="absolute top-2 right-4 text-xs text-slate-500">LIVE TERMINAL OUTPUT</div>
                {logs.length === 0 && <span className="text-slate-600 italic">Waiting for command...</span>}
                {logs.map((log, i) => (
                    <div key={i} className="mb-1">
                        <span className="text-green-500 mr-2">$</span>
                        <span className="text-slate-300">{log}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AttackCard = ({ title, desc, icon, onClick, isLoading, color }) => (
    <div className={`bg-[#1e293b] p-6 rounded-xl border border-slate-700 hover:border-${color}-500 transition-all duration-300 group relative overflow-hidden`}>
        <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${color}-500/10 rounded-full blur-2xl group-hover:bg-${color}-500/20 transition-all`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-slate-800 rounded-lg">{icon}</div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 relative z-10">{title}</h3>
        <p className="text-slate-400 text-sm mb-6 h-12 relative z-10">{desc}</p>

        <button
            onClick={onClick}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold uppercase tracking-wide text-xs transition-all relative z-10
                ${isLoading ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : `bg-${color}-600 hover:bg-${color}-500 text-white shadow-lg`}
            `}
        >
            {isLoading ? 'Executing...' : 'Launch Attack'}
        </button>
    </div>
);

export default AttackSimulator;
