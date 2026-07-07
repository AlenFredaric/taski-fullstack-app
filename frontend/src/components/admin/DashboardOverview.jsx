// frontend/src/components/admin/DashboardOverview.jsx
import React from 'react';
import { DollarSign, Ticket, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardOverview = ({
  formatRupees,
  totalRevenue,
  totalTicketsBooked,
  events,
  filteredBookings,
  allTransactions = [], 
}) => {
  
  const chartData = allTransactions
    .filter(tx => tx.type === 'CREDIT' || tx.type === 'REFUND')
    .slice(-10) 
    .map(tx => {
      const txDate = new Date(tx.createdAt);
      
      const dateString = txDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
      const timeString = txDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      return {
        dateTime: `${dateString} ${timeString}`, 
        revenue: tx.amount / 100
      };
    });

  return (
    <div className="animate-fadeIn space-y-8">
  
      <div className="mb-2">
        <h2 className="text-xl font-black text-slate-950">System Performance Overview</h2>
        <p className="text-sm text-slate-500">Real-time financial and operational status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="h-7 w-7" /></div>
          <div>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Total Revenue</span>
            <span className="text-2xl font-black text-slate-950">{formatRupees(totalRevenue || 0)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-sky-50 text-[#0EA5E9] rounded-2xl"><Ticket className="h-7 w-7" /></div>
          <div>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Booked Units</span>
            <span className="text-2xl font-black text-slate-950">{totalTicketsBooked || 0} Units</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Calendar className="h-7 w-7" /></div>
          <div>
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Active Venues</span>
            <span className="text-2xl font-black text-slate-950">{events?.length || 0} Deployments</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black text-slate-950 mb-6">Revenue Performance Trend</h3>
        <div className="h-[340px] w-full"> 
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ bottom: 25, left: 10, right: 10 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="dateTime" 
                stroke="#94a3b8" 
                fontSize={10} 
                angle={-15} 
                textAnchor="end" 
                height={50} 
              />
              
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => formatRupees(value * 100)} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-950 mb-4 flex items-center gap-2"><Calendar className="h-5 w-5 text-amber-500" />Active Venues</h2>
          <table className="min-w-full text-sm">
            <tbody className="divide-y divide-slate-50">
              {events?.slice(0, 3).map((e) => (
                <tr key={e._id}>
                  <td className="py-4 font-bold">{e.title}</td>
                  <td className="py-4 text-slate-500 text-right">{new Date(e.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6">
          <h2 className="text-lg font-black text-slate-950 mb-4 flex items-center gap-2"><Ticket className="h-5 w-5 text-indigo-500" />Recent Bookings</h2>
          <table className="min-w-full text-sm">
            <tbody className="divide-y divide-slate-50">
              {filteredBookings?.slice(0, 3).map((b) => (
                <tr key={b._id}>
                  <td className="py-4 font-bold">{b.userId?.name || 'Customer'}</td>
                  <td className="py-4 text-slate-500 text-right">{formatRupees(b.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;