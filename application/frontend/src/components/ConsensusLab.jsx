import React, { useState, useEffect } from 'react';
import { runConsensusTest } from '../services/api';

function ConsensusLab({ onClose }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);

    const addLog = (msg) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const runTest = async (type) => {
        setLoading(true);
        setResults(null);
        setLogs([]);
        addLog(`Starting ${type} Consensus Test...`);

        try {
            const startTime = Date.now();
            const response = await runConsensusTest(type, { data: `Test Data for ${type}` });

            const endTime = Date.now();
            const clientDuration = endTime - startTime;

            if (response && response.success) {
                addLog(`${type} Test Completed Successfully!`);
                addLog(`Server Duration: ${response.duration}ms`);
                addLog(`Client Duration: ${clientDuration}ms`);
                setResults(response);
            } else {
                addLog(`Test Failed: ${response?.error || 'Unknown error'}`);
            }
        } catch (error) {
            addLog(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="consensus-lab-panel" style={{
            position: 'absolute', top: 20, right: 20, width: '400px',
            backgroundColor: 'white', padding: '20px', borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 1000
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h2>🔬 Consensus Lab</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => runTest('raft')}
                    disabled={loading}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    RAFT (Baseline)
                </button>
                <button
                    onClick={() => runTest('poa')}
                    disabled={loading}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#9c27b0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    PoA
                </button>
                <button
                    onClick={() => runTest('pbft')}
                    disabled={loading}
                    style={{ flex: 1, padding: '10px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    PBFT
                </button>
            </div>

            {results && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                    <h4>📊 Results</h4>
                    <p><strong>Type:</strong> {results.consensusType}</p>
                    <p><strong>Latency:</strong> {results.duration}ms</p>
                    {results.transactionCount && <p><strong>Transactions:</strong> {results.transactionCount}</p>}
                    <p style={{ fontSize: '0.9em', color: '#666' }}>{results.message}</p>
                </div>
            )}

            <div style={{
                height: '200px', overflowY: 'auto', backgroundColor: '#f5f5f5',
                padding: '10px', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace'
            }}>
                {logs.length === 0 ? <p style={{ color: '#999', textAlign: 'center' }}>Ready to run tests...</p> : logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </div>
        </div>
    );
}

export default ConsensusLab;
