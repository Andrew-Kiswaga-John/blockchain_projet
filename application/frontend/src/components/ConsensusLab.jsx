import React, { useState, useEffect } from 'react';
import { runConsensusTest, exportConsensusReport } from '../services/api';

function ConsensusLab({ onClose }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allResults, setAllResults] = useState([]);
    const [lastResult, setLastResult] = useState(null);

    const addLog = (msg) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const runTest = async (type, silent = false) => {
        if (!silent) {
            setLoading(true);
            setLastResult(null);
            addLog(`Starting ${type.toUpperCase()} Consensus Test...`);
        }

        try {
            const response = await runConsensusTest(type, { data: `Scientific Test Data for ${type}` });
            if (response && response.success) {
                if (!silent) {
                    addLog(`${type.toUpperCase()} Test Completed! TPS: ${response.metrics.tps}`);
                    setLastResult(response);
                }
                return response;
            } else {
                addLog(`Test Failed: ${response?.error || 'Unknown error'}`);
            }
        } catch (error) {
            addLog(`Error during ${type}: ${error.message}`);
        } finally {
            if (!silent) setLoading(false);
        }
        return null;
    };

    const runComparativeStudy = async () => {
        setLoading(true);
        setAllResults([]);
        setLogs([]);
        addLog("🚀 Launching Scientific Comparative Study...");

        const types = ['raft', 'poa', 'pbft'];
        const results = [];

        for (const type of types) {
            addLog(`Benchmarking ${type.toUpperCase()}...`);
            const res = await runTest(type, true);
            if (res) {
                results.push(res);
                addLog(`✅ ${type.toUpperCase()} Finished: ${res.metrics.tps} TPS`);
            }
        }

        setAllResults(results);
        addLog("🏁 Study Complete. Metrics generated.");
        setLoading(false);
    };

    const handleExport = async () => {
        if (allResults.length === 0) return;
        setLoading(true);
        addLog("📤 Exporting scientific report to server...");
        try {
            const response = await exportConsensusReport(allResults);
            if (response.success) {
                addLog(`✅ Success: ${response.message}`);

                // Also trigger browser download for convenience
                const blob = new Blob([`# Consensus Report\n\n${JSON.stringify(allResults, null, 2)}`], { type: 'text/markdown' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = response.fileName;
                a.click();
            }
        } catch (error) {
            addLog(`Export Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="consensus-lab-panel" style={{
            position: 'absolute', top: 20, right: 20, width: '450px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', zIndex: 1000,
            backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#1a237e' }}>🔬 Scientific Consensus Lab</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}>✖</button>
            </div>

            <p style={{ fontSize: '0.85em', color: '#666', marginBottom: '15px' }}>
                Empirical performance analysis of Hyperledger Fabric ordering mechanisms.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                    onClick={runComparativeStudy}
                    disabled={loading}
                    style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {loading ? 'RUNNING...' : '⚡ RUN COMPARATIVE STUDY'}
                </button>
                {allResults.length > 0 && (
                    <button
                        onClick={handleExport}
                        style={{ flex: 1, padding: '12px', backgroundColor: '#00c853', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        💾 EXPORT
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                {['raft', 'poa', 'pbft'].map(t => (
                    <button key={t} onClick={() => runTest(t)} disabled={loading} style={{ flex: 1, fontSize: '0.75em', padding: '5px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer' }}>
                        {t.toUpperCase()}
                    </button>
                ))}
            </div>

            {allResults.length > 0 && (
                <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.8em', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Mechanism</th>
                                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>TPS</th>
                                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Latency</th>
                                <th style={{ padding: '8px', borderBottom: '2px solid #ddd' }}>Security</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allResults.map(r => (
                                <tr key={r.consensusType}>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}><strong>{r.consensusType}</strong></td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #eee', color: '#2e7d32' }}>{r.metrics.tps}</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{r.duration}ms</td>
                                    <td style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '0.9em' }}>{r.metrics.complexity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{
                height: '150px', overflowY: 'auto', backgroundColor: '#000', color: '#00ff00',
                padding: '10px', borderRadius: '6px', fontSize: '0.75em', fontFamily: 'monospace'
            }}>
                {logs.length === 0 ? <div style={{ color: '#008800' }}>{'>'} System Ready. Expecting instructions...</div> : logs.map((log, i) => (
                    <div key={i}>{'>'} {log}</div>
                ))}
            </div>
        </div>
    );
}

export default ConsensusLab;
