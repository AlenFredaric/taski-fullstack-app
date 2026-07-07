// frontend/src/components/admin/TransactionList.jsx
import React, { useState } from 'react';
import { Activity, Download, Search } from 'lucide-react';

const TransactionList = ({ allTransactions = [], allBookings = [], exportToExcelSheet, formatRupees }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); 

  const combinedLogs = [
    ...(allTransactions || []).map(t => ({ 
        ...t, 
        category: 'WALLET', 
        userId: t.userId 
    })),
    ...(allBookings || []).map(b => ({ 
      ...b, 
      category: 'BOOKING', 
      type: b.status === 'CANCELLED' ? 'REFUND' : 'DEBIT', 
      amount: b.totalAmount || 0, 
      createdAt: b.createdAt, 
      userId: b.userId 
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredLogs = combinedLogs.filter(log => {
    const matchesSearch = log.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || log.category === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 animate-fadeIn">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#10B981]" /> Complete Global Ledger ({filteredLogs.length})
          </h2>
          <button 
            onClick={() => exportToExcelSheet(filteredLogs)} 
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 hover:bg-emerald-700 transition-all"
          >
            <Download className="h-4 w-4" /> Export All
          </button>
        </div>
        
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-4 py-3 bg-slate-50 border rounded-xl text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <select className="bg-slate-50 border rounded-xl px-4 text-sm font-bold" onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="WALLET">Wallet Only</option>
            <option value="BOOKING">Booking Only</option>
          </select>
        </div>
      </div>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase font-bold text-slate-400 border-b">
            <th className="p-3">Customer</th>
            <th className="p-3">Category</th>
            <th className="p-3">Amount</th>
            <th className="p-3 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y font-semibold">
          {filteredLogs.map((log) => (
            <tr key={log._id}>
              <td className="p-3">
                <div className="font-bold">{log.userId?.name || 'Guest'}</div>
                <div className="text-[10px] text-slate-400">{log.userId?.email || 'N/A'}</div>
              </td>
              <td className="p-3 text-xs uppercase">{log.category}</td>
              <td className={`p-3 ${log.type === 'DEBIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                {log.type === 'DEBIT' ? '-' : '+'} {formatRupees(log.amount)}
              </td>
              <td className="p-3 text-right text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;