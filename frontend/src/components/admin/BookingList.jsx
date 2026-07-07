// // frontend/src/components/admin/BookingList.jsx
import React from 'react';
import { Ticket, Filter, Download } from 'lucide-react';

const BookingList = ({
  filteredBookings,
  exportToExcelSheet,
  statusFilter,
  setStatusFilter,
  formatRupees,
  handleCancelAndRefund,
  cancellingId
}) => {
  return (
    <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 overflow-hidden animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-black text-slate-950 flex items-center gap-2"><Ticket className="h-5 w-5 text-indigo-500" /><span>Complete Booking Archive Ledger ({filteredBookings.length})</span></h2>
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button onClick={() => exportToExcelSheet('bookings')} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Download className="h-4 w-4" /> Export Excel Sheet
          </button>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            <Filter className="h-4 w-4 text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none cursor-pointer">
              <option value="ALL">All States</option>
              <option value="CONFIRMED">Confirmed Only</option>
              <option value="CANCELLED">Cancelled Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-base text-slate-700">
          <thead>
            <tr className="text-left text-xs uppercase font-bold text-slate-400 border-b border-slate-100"><th className="pb-3">User Workspace</th><th className="pb-3">Event Location</th><th className="pb-3">Units</th><th className="pb-3">Value</th><th className="pb-3">Status</th><th className="pb-3 text-right">System Overrides</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold">
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-slate-50/40">
                <td className="py-4">
                  <div className="font-black text-slate-900">{booking.userId?.name || 'Deleted User'}</div>
                  <div className="text-sm text-slate-400">{booking.userId?.email || 'N/A'}</div>
                </td>
                <td className="py-4 font-black text-slate-900">{booking.eventId?.title || 'Unknown Scope'}</td>
                <td className="py-4 font-mono font-bold text-[#0EA5E9]">{booking.seats.map(s => s.seatNumber).join(', ')}</td>
                <td className="py-4 font-black text-slate-900">{formatRupees(booking.totalAmount)}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-[#10B981]' : 'bg-rose-50 text-rose-600'}`}>{booking.status}</span>
                </td>
                <td className="py-4 text-right">
                  {booking.status === 'CONFIRMED' ? (
                    <button onClick={() => handleCancelAndRefund(booking._id)} disabled={cancellingId === booking._id} className="px-4 py-1.5 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-extrabold transition-all">Cancel & Refund</button>
                  ) : <span className="text-xs text-slate-400 italic font-bold">Settled / Rolled Back</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingList;