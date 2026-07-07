// frontend/src/components/WalletView.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Wallet, AlertTriangle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { AuthContext } from '../App';

export default function WalletView() {
    const { user, refreshUserWallet, api } = useContext(AuthContext);
    const [depositAmount, setDepositAmount] = useState('');
    const [customKey, setCustomKey] = useState('');
    const [simReplay, setSimReplay] = useState(false);
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const formatRupees = (paise) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
    };

    const fetchLedger = async () => {
        try {
            const data = await refreshUserWallet();
            if (data && data.transactions) {
                setLedger(data.transactions);
            } else if (data && data.wallet && data.wallet.transactions) {
                setLedger(data.wallet.transactions);
            } else {
                const res = await api.get('/wallet/details');
                if (res.data && res.data.transactions) setLedger(res.data.transactions);
            }
        } catch (err) {
            setError('Could not retrieve ledger transactions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateNewIdempotencyKey();
        fetchLedger();
    }, []);

    const generateNewIdempotencyKey = () => {
        const key = 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase() + '-' + Date.now().toString().slice(-4);
        setCustomKey(key);
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        const amountInPaise = Math.round(parseFloat(depositAmount) * 100);
        if (isNaN(amountInPaise) || amountInPaise <= 0) {
            setError('Please input a valid positive capital amount.');
            setActionLoading(false);
            return;
        }

       
        
        try {
            if (simReplay) {
                const currentKey = customKey;
                api.post('/wallet/add', { amount: amountInPaise, idempotencyKey: currentKey }).catch(() => {});
                
                await api.post('/wallet/add', { amount: amountInPaise, idempotencyKey: currentKey });
                
                console.log("Replay request processed successfully (Should not happen if blocking works)");
            } else {
                await api.post('/wallet/add', { amount: amountInPaise, idempotencyKey: customKey });
                setSuccess(`Successfully authorized! Credited ${formatRupees(amountInPaise)} to account ledger.`);
                setDepositAmount('');
                generateNewIdempotencyKey();
            }
            await fetchLedger();
        } catch (err) {
            if (simReplay && err.response?.status === 409) {
                setSuccess(`Idempotency Protection Confirmed! Replay request blocked safely: "${err.response.data.message || 'Concurrency lock active.'}"`);
                setDepositAmount('');
                generateNewIdempotencyKey();
                await fetchLedger();
            } else {
                setError(err.response?.data?.message || 'Transaction failed in core wallet node engine.');
            }
        
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
                <p className="text-base font-semibold text-slate-500">Loading Double-Entry Account Records...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-8 items-start md:h-[calc(100vh-170px)]">

                <div className="w-full md:w-[380px] shrink-0">
                    <div className="sticky top-6">
                        <div className="bg-white border border-slate-100 shadow-lg rounded-2xl p-5 sm:p-7">
                            <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center space-x-2.5">
                                <Wallet className="h-6 w-6 text-[#0EA5E9]" />
                                <span>Capital Ledger</span>
                            </h2>

                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6">
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Available Liquidity</p>
                                <h3 className="text-3xl sm:text-4xl font-black text-emerald-600 mt-2 tracking-tight">
                                    {formatRupees(user?.walletBalance || 0)}
                                </h3>
                            </div>

                            {error && (
                                <div className="mb-5 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl text-sm font-medium text-rose-700 flex items-start space-x-2 animate-shake">
                                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <span className="break-words w-full">{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="mb-5 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-sm font-medium text-emerald-700 flex items-start space-x-2">
                                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                    <span className="break-words w-full">{success}</span>
                                </div>
                            )}

                            <form onSubmit={handleDeposit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Deposit Amount (₹ INR)
                                    </label>
                                    <div className="relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-slate-500 text-base font-bold">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            required
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-base font-semibold focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
                                            placeholder="100.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-bold text-slate-700">
                                            Unique Idempotency Key
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateNewIdempotencyKey}
                                            className="text-xs font-bold text-[#0EA5E9] hover:underline flex items-center space-x-1"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            <span>Regen</span>
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        readOnly
                                        value={customKey}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono focus:outline-none tracking-wide"
                                    />
                                </div>

                                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                                    <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={simReplay}
                                            onChange={(e) => setSimReplay(e.target.checked)}
                                            className="rounded text-[#0EA5E9] focus:ring-[#0EA5E9] h-4 w-4"
                                        />
                                        <span className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                                            Simulate Double Replay Attack
                                        </span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full flex justify-center items-center py-3 px-5 border border-transparent rounded-xl text-sm font-extrabold text-white bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 active:scale-[0.99] transition-all shadow-md shadow-[#0EA5E9]/10 disabled:opacity-50 cursor-pointer"
                                >
                                    {actionLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Authorize Credit Ledger'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="w-full md:flex-1 h-full min-h-0">
                    <div className="bg-white border border-slate-100 shadow-lg rounded-2xl p-5 sm:p-7 h-full flex flex-col overflow-hidden">
                        <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center space-x-2.5">
                            <RefreshCw className="h-6 w-6 text-[#0EA5E9]" />
                            <span>Double-Entry Ledger Log</span>
                        </h2>

                        {ledger.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Info className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-3 text-base font-bold text-slate-700">No ledger entries found</h3>
                                <p className="text-sm text-slate-400 mt-1">Add money to begin credit ledger transactions.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
                                <table className="min-w-full divide-y divide-slate-100 table-auto">
                                    <thead>
                                        <tr className="text-left text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                                            <th className="pb-4 pr-3">Type</th>
                                            <th className="pb-4 pr-3">Value</th>
                                            <th className="pb-4 pr-3">Ref ID / Booking</th>
                                            <th className="pb-4 whitespace-nowrap">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-800">
                                        {ledger.map((tx) => (
                                            <tr key={tx._id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-4 pr-3">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ${tx.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className={`py-4 font-bold pr-3 text-base ${tx.type === 'DEBIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                    {tx.type === 'DEBIT' ? '-' : '+'}{formatRupees(tx.amount)}
                                                </td>
                                                <td className="py-4 font-mono text-xs text-slate-500 max-w-[150px] truncate pr-3">
                                                    {tx.bookingId ? `Booking #${tx.bookingId._id?.slice(-6).toUpperCase() || tx.bookingId?.slice(-6).toUpperCase()}` : 'Deposit Capital'}
                                                </td>
                                                <td className="py-4 text-slate-500 font-medium whitespace-nowrap">
                                                    {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}