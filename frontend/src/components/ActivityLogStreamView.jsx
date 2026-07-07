 // frontend/src/components/ActivityLogStreamView.jsx
import React, { useState, useEffect, useContext } from 'react';
import { ArrowDownLeft, Ticket, RefreshCcw, Info, CheckCircle2 } from 'lucide-react';
import { AuthContext } from '../App';

export default function ActivityLogStreamView() {
  const { api } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/activity/stream'); 
      setLogs(res.data);
    } catch (err) {
      console.error("Could not fetch activity streams", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [api]);

  const getIcon = (type) => {
    switch (type) {
      case 'WALLET_ADD': return <ArrowDownLeft className="h-5 w-5 text-emerald-600" />;
      case 'TICKET_BOOK': return <Ticket className="h-5 w-5 text-[#0EA5E9]" />;
      case 'TICKET_REFUND': return <RefreshCcw className="h-5 w-5 text-rose-600" />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-full p-4 sm:p-6 bg-slate-50/50 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full">
        
        {loading ? (
            <div className="flex justify-center py-20">
                <RefreshCcw className="h-8 w-8 text-[#0EA5E9] animate-spin" />
            </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
            <Info className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-3 text-slate-500 font-medium">No activity triggers recorded yet.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-10 space-y-6 before:absolute before:left-[23px] sm:before:left-[27px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
            {logs.map((log) => (
              <div key={log._id} className="relative group">
                <div className="absolute -left-[36px] sm:-left-[40px] top-1 p-1 bg-[#F8FAFC] border-2 border-[#0EA5E9] rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-[#0EA5E9]" />
                </div>
                
                <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all w-full">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">{getIcon(log.type)}</div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{log.message}</p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                              {new Date(log.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        </div>
                    </div>
                    <span className="hidden sm:block text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-3 py-1 rounded-lg">
                        {log.type.replace('_', ' ')}
                    </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}