import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, FileJson, MapPinned, Zap } from 'lucide-react';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-[#0f172a] text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e293b] border-r border-[#334155] flex flex-col">
                {/* Logo Area */}
                <div className="p-6 flex items-center justify-center border-b border-[#334155]">
                    <Zap className="text-cyan-400 w-8 h-8 mr-2" />
                    <h1 className="text-xl font-bold tracking-wider text-cyan-400">SMART CITY<br /><span className="text-xs text-slate-400 font-normal">COMMAND CENTER</span></h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" />
                    <NavItem to="/network" icon={<Zap />} label="Network Control" />
                    <NavItem to="/consensus" icon={<ShieldAlert />} label="Consensus Lab" />
                    <NavItem to="/blockchain" icon={<FileJson />} label="Blockchain Inspector" />
                </nav>

                {/* Status Footer */}
                <div className="p-4 border-t border-[#334155] text-xs text-slate-500 text-center">
                    <p>System: ONLINE</p>
                    <p>Fabric Network: CONNECTED</p>
                    <p className="mt-2 text-[10px] opacity-50">v2.0.0 Cyberpunk Ed.</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-[#0f172a] relative">
                {/* Top Bar (Optional, can be added later) */}
                <div className="h-16 border-b border-[#334155] flex items-center justify-between px-8 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-slate-200">Operation Overview</h2>
                    <div className="flex items-center space-x-4">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-mono text-green-400">LIVE</span>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

// Helper Component for Links
const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/20'
                : 'text-slate-400 hover:bg-[#334155] hover:text-white'
            }`
        }
    >
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{label}</span>
    </NavLink>
);

export default DashboardLayout;
