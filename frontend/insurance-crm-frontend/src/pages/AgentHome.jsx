import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import api from "../services/api";
import { 
  LayoutDashboard, Users, PhoneCall, CheckSquare, 
  CircleDollarSign, BarChart3, Bell, Settings, 
  UserCircle, Headphones, Mic, PhoneOff, ChevronDown
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading } = useSelector((state) => state.dashboard);
  
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Sync check-in state when data arrives
  useEffect(() => {
    if (data?.is_checked_in) {
      setIsCheckedIn(true);
    }
  }, [data?.is_checked_in]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const res = await api.post("agent/check-in/");
      alert(res.data.message);
      setIsCheckedIn(true);
      dispatch(fetchDashboardStats()); 
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="flex h-screen items-center justify-center text-slate-500 font-medium">Syncing Dashboard...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-700">
      
      {/* Sidebar - As seen in image_19f1e1.jpg */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 flex items-center gap-2 bg-[#1e4eb8] text-white">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <PhoneCall size={18} />
          </div>
          <span className="font-bold text-lg leading-tight">Agent Dashboard</span>
          <ChevronDown size={16} className="ml-auto opacity-70" />
        </div>
        
        <nav className="mt-4">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem icon={<Users size={20}/>} label="Leads" onClick={() => navigate('/agent/leads')} />
          <NavItem icon={<PhoneCall size={20}/>} label="Call History" />
          <NavItem icon={<CheckSquare size={20}/>} label="Tasks" />
          <NavItem icon={<CircleDollarSign size={20}/>} label="My Earnings" />
          <NavItem icon={<BarChart3 size={20}/>} label="Reports" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Header Bar */}
        <header className="bg-[#1e4eb8] text-white p-4 flex justify-between items-center shadow-md">
          <h1 className="text-2xl font-semibold">Welcome, {data.agent_name || 'Sarah'}!</h1>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30"><Bell size={20} /></div>
            <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30"><Settings size={20} /></div>
            <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30"><UserCircle size={20} /></div>
          </div>
        </header>

        <div className="p-6">
          {/* Top Stats Bar */}
          <div className="mb-6 flex gap-6 text-[13px] items-center text-slate-600">
            <span className="opacity-80">Today's Stats:</span>
            <span className="font-semibold">Calls Made: <b className="text-lg ml-1">{data.header_stats?.calls || 0}</b></span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold">Sales Closed: <b className="text-lg ml-1">{data.header_stats?.sales || 0}</b></span>
            <span className="text-gray-300">|</span>
            <span className="font-semibold">Follow-ups: <b className="text-lg ml-1">{data.header_stats?.followups_completed || 0}</b></span>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard title="New Leads" value={data.cards?.new_leads || 0} onClick={() => navigate(`/agent/leads`, { state: { tab: 'New' } })} />
            <MetricCard title="Pending Follow-Ups" value={data.cards?.pending_followups || 0} onClick={() => navigate(`/agent/leads`, { state: { tab: 'Follow-Up' } })} />
            <MetricCard title="Today's Sales" value={`₹${data.revenue?.total_premium || 0}`} />
            
            {/* Target Progress Card */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Monthly Target Progress</p>
                <div className="w-28 h-2 bg-gray-100 rounded-full">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${data.cards?.target_progress || 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-gray-100" />
                  <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="5" fill="transparent" strokeDasharray={151} strokeDashoffset={151 - (151 * (data.cards?.target_progress || 0)) / 100} className="text-green-500" />
                </svg>
                <span className="absolute text-xs font-bold">{data.cards?.target_progress || 0}%</span>
              </div>
            </div>
          </div>

          {/* Call Status & Live Call Section */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-3 text-white text-sm font-bold">Call Status</div>
              <div className="p-8 flex justify-around items-center">
                <CircularGauge label="Connected Calls" value={data.call_metrics?.connected || 0} color="text-teal-400" />
                <CircularGauge label="Missed Calls" value={data.call_metrics?.no_answer || 0} color="text-orange-400" />
                <div className="text-center">
                    <div className="w-24 h-12 border-t-8 border-x-8 border-blue-500 rounded-t-full flex items-end justify-center pb-2">
                        <span className="text-xl font-bold">{data.call_metrics?.avg_duration || "0m"}</span>
                    </div>
                    <p className="text-[10px] mt-2 font-bold uppercase text-slate-500">Avg Call Duration</p>
                </div>
              </div>
            </div>

            {/* Live Call / Check-in Card */}
            <div className={`rounded-xl shadow-lg p-4 text-white relative transition-colors ${isCheckedIn ? 'bg-[#1e4eb8]' : 'bg-slate-700'}`}>
                <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div> 
                        {isCheckedIn ? 'Live Call' : 'Offline'}
                    </div>
                    <div className="flex gap-2 opacity-60"><Settings size={14}/> <ChevronDown size={14}/></div>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white/30">
                        {data.agent_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <p className="font-bold">{data.agent_name || 'Sarah'}</p>
                        <p className="text-xs opacity-70">{isCheckedIn ? "00:12" : "Not Checked In"}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isCheckedIn ? (
                        <button 
                            onClick={handleCheckIn}
                            disabled={checkInLoading}
                            className="w-full bg-orange-500 hover:bg-orange-600 py-2.5 rounded-lg text-xs font-bold"
                        >
                            {checkInLoading ? "Processing..." : "START SHIFT / CHECK-IN"}
                        </button>
                    ) : (
                        <>
                            <button className="flex-1 bg-green-500 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 uppercase"><Headphones size={14}/> Listen</button>
                            <button className="flex-1 bg-teal-500 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 uppercase"><Mic size={14}/> Whisper</button>
                            <button className="flex-1 bg-red-500 py-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 uppercase"><PhoneOff size={14}/> End Call</button>
                        </>
                    )}
                </div>
            </div>
          </div>

          {/* Bottom Grid: Tables and Lists */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Lead List Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-3 flex justify-between items-center border-b">
                    <span className="text-blue-800 font-bold text-[13px]">Lead List</span>
                    <div className="flex gap-2 text-gray-400"><Settings size={14}/> <ChevronDown size={14}/></div>
                </div>
                <table className="w-full text-[11px]">
                    <thead className="bg-gray-50 text-gray-400 uppercase font-bold">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Contact</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.recent_conversions || []).slice(0, 4).map((lead, i) => (
                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="p-3 font-bold">{lead.name}</td>
                                <td className="p-3 text-gray-500">9856231470</td>
                                <td className="p-3">
                                    <span className="bg-green-500 text-white px-2 py-0.5 rounded text-[9px] uppercase font-bold">New</span>
                                </td>
                                <td className="p-3">
                                    <button onClick={() => navigate(`/lead/${lead.id}`)} className="bg-[#1e4eb8] text-white px-3 py-1 rounded flex items-center gap-1 text-[9px] uppercase font-bold">
                                        <PhoneCall size={10}/> Call
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tasks & Script Section */}
            <div className="flex flex-col gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-blue-800 font-bold text-[13px]">Priority Saves</span>
                        <div className="flex gap-2 text-gray-400"><Settings size={14}/> <ChevronDown size={14}/></div>
                    </div>
                    <div className="space-y-3">
                        {(data.at_risk_leads || []).map((lead, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate(`/lead/${lead.id}`)}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${lead.is_overdue ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-700">{lead.name}</span>
                                </div>
                                <span className={`text-[9px] font-bold ${lead.is_overdue ? 'text-red-500' : 'text-orange-500'}`}>
                                    {lead.is_overdue ? 'OVERDUE' : `${lead.minutes_left}m`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <span className="text-blue-800 font-bold text-[13px] block mb-2">Script & Notes</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-2 italic">
                        "Hello, this is {data.agent_name} from Insurance. I wanted to talk..."
                    </p>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Note: Interested in term plan</div>
                </div>
            </div>

            {/* Performance Overview & Earnings */}
            <div className="flex flex-col gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <span className="text-blue-800 font-bold text-[13px] block mb-4">Performance Overview</span>
                    <div className="space-y-3 text-[11px]">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="font-bold">Today's Sales</span>
                            <span className="text-blue-600 font-bold text-sm">₹{data.revenue?.total_premium || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-500">Total Premium Collected</span>
                            <span className="font-bold text-slate-800">₹{data.revenue?.total_premium || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Pending Amount</span>
                            <span className="font-bold text-orange-500">₹{data.revenue?.pending_amount || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[#1e4eb8] p-2 text-white flex justify-between items-center text-[10px] font-bold uppercase">
                        <span className="flex items-center gap-2"><CircleDollarSign size={14}/> My Earnings</span>
                        <div className="flex gap-2 opacity-70"><Settings size={12}/> <ChevronDown size={12}/></div>
                    </div>
                    <div className="p-4 space-y-2 text-[12px]">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Commission Earned:</span> 
                            <span className="font-bold">₹{(data.revenue?.total_premium * 0.1).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Bonuses:</span> 
                            <span className="font-bold text-teal-600">₹0</span>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Atomic UI Components ---

const NavItem = ({ icon, label, active = false, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3.5 cursor-pointer transition-all ${
        active 
        ? 'bg-[#1e4eb8] text-white border-l-4 border-blue-300' 
        : 'text-slate-500 hover:bg-gray-50'
    }`}
  >
    {icon}
    <span className="text-[13px] font-bold">{label}</span>
  </div>
);

const MetricCard = ({ title, value, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:border-blue-300 transition-colors' : ''}`}
  >
    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 leading-none">{title}</p>
    <p className="text-3xl font-extrabold text-slate-800">{value}</p>
  </div>
);

const CircularGauge = ({ label, value, color }) => (
  <div className="text-center">
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-20 h-20 transform -rotate-90">
        <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
        <circle 
            cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" fill="transparent" 
            strokeDasharray={213} 
            strokeDashoffset={213 - (213 * 75) / 100} 
            className={color} 
        />
      </svg>
      <span className="absolute text-xl font-extrabold text-slate-800">{value}</span>
    </div>
    <p className="text-[10px] mt-2 font-bold uppercase text-slate-500">{label}</p>
  </div>
);

export default Dashboard;