// frontend/src/components/PurchasedTicketsView.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Search, Ticket, Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { AuthContext } from '../App';

export default function PurchasedTicketsView() {
    const { user, api } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!user || !user._id) return;

        setLoading(true);
        api.get('/bookings')
            .then(res => {
                const rawBookings = Array.isArray(res.data) ? res.data : [];

                const userBookings = rawBookings.filter(b => {
                    if (!b.userId) return false;
                    const bookingUserId = typeof b.userId === 'object' ? (b.userId._id || b.userId) : b.userId;
                    return bookingUserId.toString() === user._id.toString();
                });

                const mappedTickets = userBookings.map(b => {
                    const eventData = b.eventId || {};
                    const eventDate = new Date(eventData.date || Date.now());
                    const now = new Date();

                    let processedSeats = [];
                    if (Array.isArray(b.seats)) {
                        processedSeats = b.seats.map(s => {
                            if (typeof s === 'object' && s !== null) {
                                return s.seatNumber || s.id || 'Slot';
                            }
                            return s.toString();
                        });
                    } else if (b.seats) {
                        processedSeats = [b.seats.toString()];
                    }

                    let status = 'upcoming';
                    if (b.status === 'CANCELLED') {
                        status = 'cancelled';
                    } else if (eventDate < now) {
                        status = 'past';
                    }

                    return {
                        id: b._id,
                        title: eventData.title || 'Live Event Production',
                        date: eventDate,
                        seats: processedSeats,
                        status: status
                    };
                });

                setTickets(mappedTickets);
            })
            .catch(err => {
                console.error("Error matching dynamic booking history nodes:", err);
                toast.error("Could not synchronize purchase history.");
            })
            .finally(() => setLoading(false));
    }, [api, user]);

    const filteredTickets = tickets.filter(t =>
        t.status === activeTab &&
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin text-[#0EA5E9]" />
                <p className="text-sm font-bold text-slate-400">Synchronizing secure pass tokens...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn w-full">
            <div className="bg-white border border-slate-100 rounded-3xl p-4 sm:p-8 shadow-xl shadow-slate-100/40">

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-5 mb-6">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start w-full sm:w-auto">
                        {['upcoming', 'past', 'cancelled'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-none transition-all"
                                style={{
                                    backgroundColor: activeTab === tab ? '#0EA5E9' : '#F8FAFC',
                                    color: activeTab === tab ? 'white' : '#94A3B8'
                                }}
                            >
                                {tab === 'upcoming' ? 'Active / Upcoming' : tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by title..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:border-[#0EA5E9] transition-all"
                        />
                    </div>
                </div>

                {filteredTickets.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-sm font-bold">
                        No active purchase records found inside the "{activeTab}" section capsule.
                    </div>
                ) : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        {filteredTickets.map(ticket => (
                            <div key={ticket.id} className="border-2 border-slate-100 rounded-2xl p-5 flex justify-between items-center bg-white shadow-sm hover:border-[#0EA5E9]/20 transition-all group">
                                <div className="min-w-0 flex-1 pr-3">
                                    <h3 className="font-black text-base text-slate-900 group-hover:text-[#0EA5E9] transition-colors truncate">{ticket.title}</h3>

                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-2">
                                        <span>Allocated Units:</span>
                                        <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                                            {ticket.seats.length > 0 ? ticket.seats.join(', ') : 'Confirmed'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{ticket.date.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                                    </div>
                                </div>

                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0 border ${ticket.status === 'cancelled'
                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                        : 'bg-sky-50 text-[#0EA5E9] border-sky-100'
                                    }`}>
                                    {ticket.status === 'cancelled' ? 'Revoked' : 'Verified'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}