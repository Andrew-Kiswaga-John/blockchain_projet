import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const BlockchainInspector = () => {
    const [blocks, setBlocks] = useState([]);
    const [selectedBlock, setSelectedBlock] = useState(null);

    // Initial dummy data for look & feel before socket connection
    useEffect(() => {
        // Connect to socket in real implementation
        const socket = io('http://localhost:3000');

        socket.on('new-block', (block) => {
            // Map backend data to frontend expected format
            const enrichedBlock = {
                ...block,
                id: block.blockNumber,
                hash: block.currentHash || '0x' + Math.random().toString(16).substr(2, 64), // Fallback if missing
                status: 'VALID'
            };
            setBlocks(prev => [enrichedBlock, ...prev].slice(0, 50));
        });

        // Initial empty state (or fetch existing from API if needed)
        // setBlocks([]);

        return () => socket.disconnect();
    }, []);

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6">
            {/* Left: Feed */}
            <div className="w-1/3 flex flex-col space-y-4 overflow-y-auto pr-2">
                <h2 className="text-2xl font-bold text-white mb-2">Ledger Feed</h2>
                {blocks.map(block => (
                    <div
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedBlock?.id === block.id
                            ? 'bg-slate-700 border-cyan-500'
                            : 'bg-[#1e293b] border-slate-700 hover:border-slate-500'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-mono text-cyan-400 text-sm">#{block.id}</span>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${block.status === 'VALID' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {block.status}
                            </span>
                        </div>
                        <div className="text-xs text-slate-400 break-all font-mono mb-2">
                            {block.hash}
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                            <span>{block.txCount} txs</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right: Inspector */}
            <div className="flex-1 bg-[#1e293b] rounded-xl border border-slate-700 p-6 flex flex-col relative overflow-hidden">
                {selectedBlock ? (
                    <>
                        <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

                        <h2 className="text-2xl font-bold text-white mb-6 z-10">Block #{selectedBlock.id} Details</h2>

                        <div className="grid grid-cols-2 gap-6 mb-8 z-10">
                            <DetailRow label="Status" value={selectedBlock.status} isStatus />
                            <DetailRow label="Timestamp" value={selectedBlock.timestamp} />
                            <DetailRow label="Previous Hash" value={selectedBlock.prevHash} />
                            <DetailRow label="Current Hash" value={selectedBlock.hash} />
                        </div>

                        <div className="flex-1 z-10">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Raw Payload</h3>
                            <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 h-full overflow-auto border border-slate-700">
                                {JSON.stringify(selectedBlock, null, 2)}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 italic">
                        Select a block from the feed to inspect signatures.
                    </div>
                )}
            </div>
        </div>
    );
};

const DetailRow = ({ label, value, isStatus }) => (
    <div>
        <div className="text-xs text-slate-500 uppercase mb-1">{label}</div>
        <div className={`text-sm font-mono break-all ${isStatus ? (value === 'VALID' ? 'text-green-400' : 'text-red-400') : 'text-slate-200'}`}>
            {value}
        </div>
    </div>
);

export default BlockchainInspector;
