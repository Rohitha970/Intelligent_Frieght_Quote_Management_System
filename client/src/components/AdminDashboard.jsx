import React, { useState } from 'react';
import { 
  Users, Activity, ShieldCheck, Database, 
  Search, Bell, Settings, LogOut, Menu, X, 
  TrendingUp, AlertTriangle, CheckCircle, RefreshCw,
  Truck, DollarSign, Package, FileText, Filter
} from 'lucide-react';

export default function AdminDashboard({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample operational statistics for Freight & Quote System
  const stats = [
    { title: "Total Shipments", value: "1,428", change: "+12.5%", icon: Truck, status: "up" },
    { title: "Active Quotes", value: "342", change: "+8.1%", icon: FileText, status: "up" },
    { title: "System Load", value: "34.2%", change: "Optimal", icon: Activity, status: "neutral" },
    { title: "Active JWT Sessions", value: "89", change: "Secure", icon: ShieldCheck, status: "up" },
  ];

  // Sample shipments data
  const [shipments, setShipments] = useState([
    { id: "SH-9082", client: "Acme Logistics", origin: "Mumbai", destination: "Chennai", status: "PENDING", date: "10 mins ago" },
    { id: "SH-9083", client: "Global Freight", origin: "Delhi", destination: "Bangalore", status: "IN TRANSIT", date: "45 mins ago" },
    { id: "SH-9084", client: "Express Cargo", origin: "Kolkata", destination: "Hyderabad", status: "COMPLETED", date: "2 hours ago" },
    { id: "SH-9085", client: "FastTrack Inc", origin: "Pune", destination: "Ahmedabad", status: "PENDING", date: "4 hours ago" },
  ]);

  // Sample user management data
  const users = [
    { id: 1, name: "Admin Operations", email: "admin@freight.com", role: "Admin", status: "Active" },
    { id: 2, name: "Dispatcher Alpha", email: "dispatch@freight.com", role: "User", status: "Active" },
    { id: 3, name: "Carrier Logistics", email: "carrier@partner.org", role: "User", status: "Pending" },
  ];

  const updateStatus = (id, newStatus) => {
    setShipments(shipments.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Truck className="text-blue-400" size={24} />
          <h1 className="text-lg font-bold text-white">Freight Admin</h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300 hover:text-white">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-800/95 backdrop-blur-md border-r border-slate-700 p-5 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Truck size={22} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent block">
              Freight Console
            </span>
            <span className="text-xs text-slate-400">Intelligent Management</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {["Overview", "Shipment Control", "User Management", "API & JWT Logs", "Settings"].map((item) => (
            <button
              key={item}
              onClick={() => { setActiveTab(item); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === item 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              <Activity size={18} />
              {item}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 py-2.5 rounded-lg border border-slate-600 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-white">{activeTab}</h2>
            <p className="text-xs text-slate-400 mt-1">Real-time quote engine monitoring and logistics dispatch management.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 w-48 sm:w-64" 
              />
            </div>
            <button className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full" />
            </button>
          </div>
        </div>

        {/* Analytics Key Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl shadow-sm hover:border-slate-600 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{s.value}</h3>
                  </div>
                  <div className="p-2.5 bg-slate-700/50 rounded-lg text-blue-400">
                    <Icon size={20} />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-xs font-medium text-emerald-400">
                  <TrendingUp size={14} className="mr-1" />
                  <span>{s.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Shipment Management Table */}
          <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Package className="text-blue-400" size={20} />
                <h3 className="text-base font-semibold text-white">Live Shipments</h3>
              </div>
              <button className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors">
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-700/40 text-slate-400 border-b border-slate-700">
                  <tr>
                    <th className="p-3">Shipment ID</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Route</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {shipments
                    .filter(s => s.id.toLowerCase().includes(searchTerm.toLowerCase()) || s.client.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-700/20">
                        <td className="p-3 font-mono text-xs text-blue-400">{s.id}</td>
                        <td className="p-3 font-medium text-white">{s.client}</td>
                        <td className="p-3 text-xs text-slate-400">{s.origin} &rarr; {s.destination}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            s.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            s.status === 'IN TRANSIT' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {s.status === 'PENDING' && (
                            <button 
                              onClick={() => updateStatus(s.id, 'IN TRANSIT')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
                            >
                              Dispatch
                            </button>
                          )}
                          {s.status !== 'COMPLETED' && (
                            <button 
                              onClick={() => updateStatus(s.id, 'COMPLETED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Audit & System Status Panel */}
          <div className="space-y-6">
            
            {/* Security Status Box */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={18} />
                JWT Access Security
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2.5">
                  <CheckCircle className="text-emerald-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-300">HttpOnly Cookies Active</h4>
                    <p className="text-xs text-emerald-400/80 mt-0.5">XSS token extraction protection enabled.</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-2.5">
                  <Activity className="text-blue-400 mt-0.5 shrink-0" size={16} />
                  <div>
                    <h4 className="text-xs font-semibold text-blue-300">Algorithm Check</h4>
                    <p className="text-xs text-blue-400/80 mt-0.5">HS256 encryption algorithm verified.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5">
              <h3 className="text-base font-semibold text-white mb-3">Quick Controls</h3>
              <div className="space-y-2">
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg font-medium transition-colors text-left px-3 flex justify-between items-center">
                  <span>Export System Audit Log</span>
                  <FileText size={14} />
                </button>
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg font-medium transition-colors text-left px-3 flex justify-between items-center">
                  <span>Manage Carrier Accounts</span>
                  <Users size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}