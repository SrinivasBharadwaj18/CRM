import React from 'react';
import { 
  LayoutDashboard, Users, PhoneCall, CheckSquare, 
  Wallet, Settings, Bell, ChevronDown, Calendar, 
  ExternalLink 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Week 1', value: 3500 },
  { name: 'Week 2', value: 4200 },
  { name: 'Week 3', value: 4500 },
  { name: 'Week 4', value: 5100 },
  { name: 'Week 5', value: 6200 },
];

const MyEarnings = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:block">
        <div className="p-6 flex items-center gap-2 text-blue-600">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
             <span className="text-white text-xs font-bold italic">PH</span>
          </div>
          <h1 className="font-bold text-lg">Agent Dashboard</h1>
        </div>
        
        <nav className="mt-4 px-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: Users, label: 'Leads' },
            { icon: PhoneCall, label: 'Call History' },
            { icon: CheckSquare, label: 'Tasks' },
            { icon: Wallet, label: 'My Earnings', active: true },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-blue-600 flex items-center justify-between px-8 text-white">
          <h2 className="text-xl font-semibold">My Earnings</h2>
          <div className="flex items-center gap-4">
            <Bell size={20} className="cursor-pointer hover:opacity-80" />
            <Settings size={20} className="cursor-pointer hover:opacity-80" />
            <div className="w-8 h-8 bg-white/20 rounded-full border border-white/30" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-600 shadow-sm">
              <Calendar size={16} className="text-blue-600" />
              <span>Apr 1 2024 - Apr 30 2024</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-600 shadow-sm cursor-pointer">
              <LayoutDashboard size={16} className="text-blue-600" />
              <span>Monthly</span>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* Top Row: Chart & Total */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-slate-500 text-sm font-medium">Total Earnings</h3>
                  <p className="text-3xl font-bold text-blue-900 mt-1">₹25,500</p>
                  <div className="flex gap-8 mt-4">
                    <div>
                      <span className="text-xs text-slate-400">Salary</span>
                      <p className="font-semibold text-orange-400">₹20,000</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Incentives</span>
                      <p className="font-semibold text-slate-700">₹5,500</p>
                    </div>
                  </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button className="px-4 py-1.5 text-xs font-bold bg-white rounded-md shadow-sm">Weekly</button>
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-500">Monthly</button>
                </div>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Incentives Checklist */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Incentives</h3>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  Apr 2024 <ChevronDown size={12} />
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Monthly Target Achieved', amount: '₹3,000', checked: true },
                  { label: 'Weekly Bonus', amount: '₹500', checked: true, date: 'Apr 06' },
                  { label: 'Weekly Bonus', amount: '₹500', checked: true, date: 'Apr 13' },
                  { label: 'Weekly Bonus', amount: '₹500', checked: true, date: 'Apr 20' },
                  { label: 'Performance Bonus', amount: '₹500', checked: true, date: 'Apr 27' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                        {item.checked && <CheckSquare size={12} className="text-white" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        {item.date && <span className="text-[10px] text-slate-400">{item.date}</span>}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Recent Incentives</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Week</th>
                  <th className="px-6 py-4">Incentive</th>
                  <th className="px-6 py-4">Earnings</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { week: 'Week 4', title: 'Monthly Target Achieved', val: '₹3,000' },
                  { week: 'Week 4', title: 'Weekly Bonus', val: '₹500' },
                  { week: 'Week 3', title: 'Weekly Bonus', val: '₹500' },
                  { week: 'Week 2', title: 'Weekly Bonus', val: '₹500' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{row.week}</td>
                    <td className="px-6 py-4 text-slate-600">{row.title}</td>
                    <td className="px-6 py-4 font-bold">{row.val}</td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded">
                        <ExternalLink size={12} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 flex justify-center border-t border-slate-100">
               <div className="flex gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded border bg-blue-600 text-white text-xs">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border hover:bg-slate-50 text-xs">2</button>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyEarnings;