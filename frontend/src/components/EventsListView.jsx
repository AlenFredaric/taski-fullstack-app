// frontend/src/components/EventsListView.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Calendar, RefreshCw, Cpu } from 'lucide-react';
import { AuthContext } from '../App';

export default function EventsListView() {
    const { setSelectedEvent, setCurrentView, api } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/events')
            .then(res => {

                const now = new Date();
                const upcomingEvents = res.data.filter(event => new Date(event.date) >= now);
                setEvents(upcomingEvents);
            })
            .catch(err => console.error("Error fetching events:", err))
            .finally(() => setLoading(false));
    }, [api]);

    const parseEventTitle = (fullTitle, databaseId) => {
        const match = fullTitle.match(/(.*?)\s*(\d{10,15})$/);
        if (match) {
            return {
                displayTitle: match[1].trim() || "Live Concert Production",
                idBadge: match[2]
            };
        }

        return {
            displayTitle: fullTitle,
            idBadge: databaseId ? databaseId.slice(-6).toUpperCase() : "SYS-LN"
        };
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-10 w-10 animate-spin text-[#0EA5E9]" />
                <p className="text-base font-black text-slate-400">Loading live deployments...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 animate-fadeIn">

            {events.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm mt-4">
                    <Calendar className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-700">No active deployments found</h3>
                    <p className="text-xs text-slate-400 mt-1">Check back later or switch privileges to initialize a venue.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
                    {events.map(event => {
                        const { displayTitle, idBadge } = parseEventTitle(event.title, event._id);

                        return (
                            <div
                                key={event._id}
                                onClick={() => { setSelectedEvent(event); setCurrentView('seat-select'); }}
                                className="bg-white rounded-2xl border-2 border-slate-100 hover:border-[#0EA5E9]/40 shadow-sm hover:shadow-xl hover:shadow-sky-500/5 cursor-pointer overflow-hidden group transition-all duration-300 flex flex-col justify-between min-h-[260px] relative"
                            >
                                <div className="absolute top-0 inset-x-0 h-[4px] bg-slate-100 group-hover:bg-[#0EA5E9] transition-colors duration-300"></div>

                                <div className="p-6 sm:p-8">
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <h3 className="font-black text-xl sm:text-2xl text-slate-900 group-hover:text-[#0EA5E9] transition-colors duration-200 line-clamp-2 tracking-tight leading-tight" title={displayTitle}>
                                            {displayTitle}
                                        </h3>
                                        <span className="bg-emerald-50 text-[#10B981] border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                                            Live
                                        </span>
                                    </div>

                                    {idBadge && (
                                        <div className="inline-flex items-center gap-1.5 bg-slate-100/80 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold mb-4">
                                            <Cpu className="h-3 w-3 text-[#0EA5E9]" />
                                            <span>REF ID: {idBadge}</span>
                                        </div>
                                    )}

                                    <p className="text-sm sm:text-base text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed min-h-[44px]">
                                        {event.description || "No specific deployment logs provided for this event location layout matrix."}
                                    </p>

                                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 group-hover:bg-sky-50/40 group-hover:border-[#0EA5E9]/10 px-4 py-3 rounded-xl text-xs sm:text-sm text-slate-700 font-black transition-all duration-300">
                                        <Calendar className="h-4.5 w-4.5 text-[#0EA5E9] shrink-0" />
                                        <span className="truncate">
                                            {new Date(event.date).toLocaleString('en-IN', {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="px-6 sm:px-8 py-6 bg-slate-50/40 border-t border-slate-100 group-hover:bg-slate-50 flex justify-between items-center text-xs sm:text-sm font-black text-slate-800 transition-colors duration-300">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <span>Pool:</span>
                                        <span className="text-slate-900 font-black">{event.totalSeats} units</span>
                                    </div>
                                    <span className="text-[#0EA5E9] group-hover:translate-x-1.5 transition-transform duration-300 flex items-center gap-1 font-extrabold">
                                        <span>Book Seats</span>
                                        <span>&rarr;</span>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}