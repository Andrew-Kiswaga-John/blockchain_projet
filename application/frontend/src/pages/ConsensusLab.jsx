import React, { useState } from 'react';
import { runConsensusTest } from '../services/api';
import { Play, Download, Activity, FileText, Zap, Shield, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ConsensusLab = () => {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(null); // 'RAFT' | 'POA' | 'PBFT' | null
    const [results, setResults] = useState([]);

    const runComparativeAnalysis = async () => {
        setLoading(true);
        setResults([]);

        const benchmarks = ['raft', 'poa', 'pbft'];
        const newResults = [];

        try {
            for (const type of benchmarks) {
                setProgress(type.toUpperCase());
                toast.loading(`Benchmarking ${type.toUpperCase()}...`, { id: 'benchmark' });

                const data = await runConsensusTest(type, { transactions: 100, intensity: 'high' });

                if (data.success) {
                    newResults.push({
                        name: type.toUpperCase(),
                        tps: parseFloat(data.metrics.tps) || 0,
                        latency: parseFloat(data.duration) || 0,
                        finality: type === 'pbft' ? data.duration : data.duration * 0.8,
                        complexity: data.metrics.complexity,
                        reliability: data.metrics.reliability,
                        faultTolerance: type === 'pbft' ? '3f+1 (BFT)' : type === 'raft' ? '2f+1 (CFT)' : 'N/2+1',
                    });
                } else {
                    toast.error(`${type.toUpperCase()} Failed: ${data.message}`, { id: 'benchmark' });
                }

                await new Promise(r => setTimeout(r, 1000));
            }

            setResults(newResults);
            toast.success("Benchmark Protocol Complete", { id: 'benchmark' });
        } catch (error) {
            toast.error("Benchmark Sequence Interrupted", { id: 'benchmark' });
        } finally {
            setLoading(false);
            setProgress(null);
        }
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(6, 182, 212); // Cyan
        doc.text("Distributed Ledger Consensus Benchmark", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        doc.text("Environment: Hyperledger Fabric v2.5 (Test Network)", 14, 33);

        const tableColumn = ["Metric", "RAFT", "PoA", "PBFT"];

        const getMetric = (name, key) => {
            const r = results.find(res => res.name === name);
            if (!r) return '-';
            return key === 'latency' ? `${r.latency}ms` : r[key];
        };

        const tableRows = [
            ["Throughput (TPS)", getMetric('RAFT', 'tps'), getMetric('POA', 'tps'), getMetric('PBFT', 'tps')],
            ["Latency (ms)", getMetric('RAFT', 'latency'), getMetric('POA', 'latency'), getMetric('PBFT', 'latency')],
            ["Fault Tolerance", "2f+1 (CFT)", "N/2+1 (Authority)", "3f+1 (BFT)"],
            ["Complexity", "O(n)", "O(k)", "O(n^2)"],
            ["Recomm. Uptime", "99.9%", "99.99%", "99.999%"]
        ];

        autoTable(doc, {
            startY: 40,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [22, 163, 74] },
            styles: { fontSize: 9 }
        });

        // Conclusion
        const finalY = doc.lastAutoTable?.finalY || 80;
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Analysis Summary", 14, finalY + 15);

        doc.setFontSize(10);
        doc.setTextColor(60);
        const conclusionText = `The data indicates that while RAFT/PoA offer lower latency suitable for high-frequency updates, PBFT is essential for critical state changes requiring Byzantine Fault Tolerance. The system is operating within expected parameters.`;

        doc.text(conclusionText, 14, finalY + 25, { maxWidth: 180 });

        doc.save("Consensus_Report.pdf");
        toast.success("PDF Downloaded");
    };

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Consensus Lab</h2>
                    <p className="text-slate-400">Scientific Benchmarking of Distributed Ledger Protocols</p>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={runComparativeAnalysis}
                        disabled={loading}
                        className={`flex items-center px-6 py-3 rounded-lg font-bold text-white transition-all
                            ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:scale-105 shadow-lg shadow-cyan-500/20'}`}
                    >
                        {loading ? <Activity className="animate-spin w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                        {loading ? `Testing ${progress}...` : 'Run Comparative Benchmark'}
                    </button>

                    <button
                        onClick={handleDownloadReport}
                        disabled={results.length < 3}
                        className="flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Download Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['RAFT', 'POA', 'PBFT'].map(name => (
                    <MetricCard
                        key={name}
                        title={name}
                        data={results.find(r => r.name === name)}
                        icon={name === 'RAFT' ? <Zap /> : name === 'POA' ? <Database /> : <Shield />}
                        color={name === 'RAFT' ? 'cyan' : name === 'POA' ? 'purple' : 'pink'}
                        loading={loading && progress === name}
                    />
                ))}
            </div>

            {results.length === 0 && !loading && (
                <div className="text-center text-slate-500 mt-20 italic">
                    Click "Run Comparative Benchmark" to generate scientific data points.
                </div>
            )}
        </div>
    );
};

const MetricCard = ({ title, data, icon, color, loading }) => (
    <div className={`bg-[#1e293b] p-6 rounded-xl border transition-all ${loading ? `border-${color}-500 shadow-[0_0_15px_rgba(var(--${color}-rgb),0.2)]` : 'border-slate-700'}`}>
        <div className="flex justify-between items-start mb-4">
            <h3 className={`text-xl font-bold text-${color}-400`}>{title}</h3>
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
                {loading ? <Activity className="animate-spin w-6 h-6" /> : icon}
            </div>
        </div>

        {data ? (
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-slate-400">Throughput</span>
                    <span className="text-white font-mono font-bold">{data.tps} TPS</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Latency</span>
                    <span className="text-white font-mono font-bold">{data.latency} ms</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Complexity</span>
                    <span className="text-white font-mono text-xs">{data.complexity}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <span className={`text-[10px] uppercase font-bold text-${color}-400`}>
                        {data.faultTolerance}
                    </span>
                </div>
            </div>
        ) : (
            <div className="h-32 flex items-center justify-center text-slate-600 italic">
                {loading ? 'Running Benchmark...' : 'Waiting for test run...'}
            </div>
        )}
    </div>
);

export default ConsensusLab;
