// frontend/src/components/TransactionsView.jsx
import React, { useState, useEffect, useContext } from 'react';
import { RefreshCw } from 'lucide-react';
import { AuthContext } from '../App';

export default function TransactionsView() {
  const { api } = useContext(AuthContext);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wallet/details').then(res => {
      setLedger(res.data.transactions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [api]);

  const formatRupees = (paise) => `₹${(paise / 100).toFixed(2)}`;

  if (loading) return <div className="p-8 flex justify-center"><RefreshCw className="animate-spin text-[#0EA5E9]" /></div>;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-100/40 animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 font-extrabold pb-3">
              <th className="pb-3">Type</th>
              <th className="pb-3">Value Amount</th>
              <th className="pb-3">Transaction Context</th>
              <th className="pb-3 whitespace-nowrap">Timestamp Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {ledger.map(tx => (
              <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black ${tx.type === 'CREDIT' || tx.type === 'REFUND' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                    {tx.type}
                  </span>
                </td>
                <td className={`py-4 font-bold text-base ${tx.type === 'DEBIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {tx.type === 'DEBIT' ? '-' : '+'}{formatRupees(tx.amount)}
                </td>
                <td className="py-4 text-xs font-mono text-slate-500">
                  {tx.bookingId ? `Ticket Booking Allocation` : 'Capital Core Wallet Deposit'}
                </td>
                <td className="py-4 text-slate-400 font-medium whitespace-nowrap">
                  {new Date(tx.createdAt).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}