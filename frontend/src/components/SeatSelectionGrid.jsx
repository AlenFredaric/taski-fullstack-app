// frontend/src/components/SeatSelectionGrid.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { AuthContext } from "../App";

const SeatSelectionGrid = () => {
  const { selectedEvent, setSelectedEvent, setCurrentView, user, refreshUserWallet, api } = useContext(AuthContext);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reservation, setReservation] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(null); 
  const countdownTimer = useRef(null);

  const SEAT_PRICE_PAISE = 50000; 

  const formatRupees = (paise) => `₹${(paise / 100).toFixed(2)}`;

  const fetchSeats = async () => {
    if (!selectedEvent) return;
    try {
      const res = await api.get(`/events/${selectedEvent._id}/seats`);
      setSeats(res.data);

      const now = new Date();
      const myActiveLocks = res.data.filter(seat => 
        seat.status === 'RESERVED' && 
        seat.lockedBy && 
        seat.lockedBy.toString() === user._id.toString() && 
        new Date(seat.lockedUntil) > now
      );

      if (myActiveLocks.length > 0) {
        const myLockedSeatNumbers = myActiveLocks.map(s => s.seatNumber);
        setSelectedSeats(myLockedSeatNumbers);

        const maxLockedUntil = new Date(Math.max(...myActiveLocks.map(s => new Date(s.lockedUntil))));
        const diffMs = maxLockedUntil.getTime() - Date.now();
        const diffSecs = Math.max(0, Math.floor(diffMs / 1000));

        setReservation({
          lockedUntil: maxLockedUntil,
          seats: myLockedSeatNumbers
        });
        setTimeLeft(diffSecs);
      }
    } catch (err) {
      setError('Failed to fetch seating arrangements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [selectedEvent]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setReservation(null);
      setTimeLeft(null);
      setSelectedSeats([]);
      setError('Your 5-minute seat reservation has expired. Please select seats and lock them again.');
      fetchSeats();
      return;
    }

    countdownTimer.current = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(countdownTimer.current);
  }, [timeLeft]);

  const handleSeatClick = (seat) => {
    if (seat.status === 'BOOKED') return;
    if (reservation) return; 

    const now = new Date();
    const isLockedByOthers = seat.status === 'RESERVED' && seat.lockedBy && seat.lockedBy !== user._id && new Date(seat.lockedUntil) > now;
    if (isLockedByOthers) {
      setError(`Seat ${seat.seatNumber} is reserved by another customer.`);
      return;
    }

    if (selectedSeats.includes(seat.seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seat.seatNumber));
    } else {
      setSelectedSeats(prev => [...prev, seat.seatNumber]);
    }
    setError('');
  };

  const handleReserve = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    setError('');
    setActionLoading(true);
    try {
      const res = await api.post('/bookings/reserve', {
        eventId: selectedEvent._id,
        seats: selectedSeats
      });
      const lockedUntilDate = new Date(res.data.lockedUntil);
      const diffMs = lockedUntilDate.getTime() - Date.now();
      const diffSecs = Math.max(0, Math.floor(diffMs / 1000));

      setReservation({
        lockedUntil: res.data.lockedUntil,
        seats: selectedSeats
      });
      setTimeLeft(diffSecs);
      setSuccess('Seats locked successfully! Complete payment before expiration.');
      fetchSeats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to lock seats. They may have been reserved by another customer.');
      setSelectedSeats([]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBook = async () => {
    if (!reservation) return;
    setError('');
    setActionLoading(true);
    try {
      await api.post('/bookings/confirm', {
        eventId: selectedEvent._id,
        seats: reservation.seats,
        idempotencyKey: `booking_confirm_${selectedEvent._id}_${Date.now()}`
      });
      
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      setReservation(null);
      setTimeLeft(null);
      setSelectedSeats([]);
      setSuccess(`Tickets Booked Successfully!`);
      
      await refreshUserWallet();
      fetchSeats();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Ensure sufficient wallet balance.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  const seatGrid = {};
  seats.forEach(seat => {
    const match = seat.seatNumber.match(/^([A-Z]+)(\d+)$/);
    const row = match ? match[1] : 'R';
    if (!seatGrid[row]) seatGrid[row] = [];
    seatGrid[row].push(seat);
  });

  Object.keys(seatGrid).forEach(row => {
    seatGrid[row].sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(row, ''), 10);
      const numB = parseInt(b.seatNumber.replace(row, ''), 10);
      return numA - numB;
    });
  });

  const totalPaise = selectedSeats.length * SEAT_PRICE_PAISE;
  const isBalanceSufficient = user.walletBalance >= totalPaise;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">

      <div className="mb-6 flex items-center">
        <button
          onClick={() => {
            setSelectedEvent(null);
            setCurrentView('overview');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-150/60 hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-sm font-bold rounded-xl border border-slate-200/60 shadow-sm transition-all duration-250 active:scale-[0.98] group cursor-pointer"
        >
          <span className="text-base transform group-hover:-translate-x-1 transition-transform duration-250">&larr;</span>
          <span>Back to Catalog</span>
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-100 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{selectedEvent.title}</h1>
            <p className="text-sm font-medium text-slate-400 mt-1.5">{selectedEvent.description}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-bold bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-700">
            <Calendar className="h-5 w-5 text-brand-primary" />
            <span>{new Date(selectedEvent.date).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border-l-4 border-brand-booked p-4 rounded-xl text-sm font-medium text-brand-booked flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 bg-emerald-50 border-l-4 border-brand-available p-4 rounded-xl text-sm font-medium text-brand-available flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {reservation && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center space-x-2 text-amber-700">
              <Clock className="h-5 w-5 animate-pulse text-brand-locked" />
              <span className="text-base font-bold">
                Lock Session Active! Complete Quick Pay within: <span className="font-mono font-extrabold text-rose-600 bg-white px-2 py-0.5 rounded border border-amber-200 ml-1">{formatTime(timeLeft)}</span>
              </span>
            </div>
            <button
              onClick={handleBook}
              disabled={actionLoading || !isBalanceSufficient}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-black text-sm shadow flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <span>Settle & Confirm Payment ({formatRupees(totalPaise)})</span>}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-6 justify-center py-4 bg-slate-50 rounded-xl mb-10 text-sm font-bold text-slate-700 border border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-md bg-[#10B981]"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-md bg-[#F59E0B]"></div>
            <span>Your Lock</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-md bg-[#F43F5E]"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded-md border border-slate-200 bg-white"></div>
            <span>Selectable</span>
          </div>
        </div>

        <div className="flex flex-col items-center overflow-x-auto pb-6">
          <div className="w-full max-w-xl bg-slate-200 rounded h-1.5 mb-12 relative flex justify-center items-center shadow-inner">
            <div className="absolute top-4 text-xs uppercase font-extrabold tracking-widest text-slate-400">Stage / Screen</div>
          </div>

          <div className="space-y-4 p-2">
            {Object.keys(seatGrid).map(row => (
              <div key={row} className="flex items-center space-x-4">
                <span className="w-8 text-center font-black text-base text-slate-800 uppercase bg-slate-100 py-1.5 rounded-lg">{row}</span>
                <div className="flex gap-2.5">
                  {seatGrid[row].map(seat => {
                    const isSelected = selectedSeats.includes(seat.seatNumber);
                    const isBooked = seat.status === 'BOOKED';
                    const now = new Date();
                    const isLocked = seat.status === 'RESERVED' && seat.lockedUntil && new Date(seat.lockedUntil) > now;
                    const lockedByMe = isLocked && seat.lockedBy === user._id;

                    let bgClass = 'bg-white hover:bg-slate-100 border-2 border-slate-200 text-slate-800';
                    if (isBooked) {
                      bgClass = 'bg-[#F43F5E] text-white border-transparent cursor-not-allowed opacity-75';
                    } else if (lockedByMe) {
                      bgClass = 'bg-[#F59E0B] text-white border-transparent animate-pulse';
                    } else if (isLocked) {
                      bgClass = 'bg-slate-300 text-slate-500 border-transparent cursor-not-allowed';
                    } else if (isSelected) {
                      bgClass = 'bg-[#0EA5E9] text-white border-transparent scale-105 shadow-md shadow-sky-500/20';
                    }

                    return (
                      <button
                        key={seat._id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isBooked || (isLocked && !lockedByMe)}
                        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl text-sm font-black tracking-tight transition-all flex items-center justify-center cursor-pointer shadow-sm ${bgClass}`}
                        title={`Seat ${seat.seatNumber} - ${seat.status}`}
                      >
                        {seat.seatNumber.replace(row, '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!reservation && (
          <div className="border-t border-slate-100 pt-6 mt-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
            <div className="text-sm sm:text-base text-slate-800 font-bold space-y-1.5">
              <p>Selected Seats: <span className="font-black text-[#0EA5E9] text-base">{selectedSeats.join(', ') || 'None'}</span></p>
              <p>Total Ticket Value: <span className="font-black text-slate-900">{formatRupees(totalPaise)}</span></p>
              <p className="flex items-center space-x-1.5">
                <span>Wallet Balance:</span>
                <span className={`font-black ${isBalanceSufficient ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatRupees(user.walletBalance)}
                </span>
                {!isBalanceSufficient && selectedSeats.length > 0 && (
                  <span className="text-xs text-rose-600 font-extrabold flex items-center space-x-0.5 ml-2 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                    <AlertTriangle className="h-4 w-4 shrink-0 inline" />
                    <span>Insufficient Funds</span>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleReserve}
              disabled={actionLoading || selectedSeats.length === 0}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-black text-base shadow-lg shadow-sky-500/10 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {actionLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Reserve Selected Seats (Lock)'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionGrid;