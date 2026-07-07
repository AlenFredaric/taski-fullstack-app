// frontend/src/components/AdminDashboardView.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import {
  Shield, Plus, Ticket, RefreshCw, AlertTriangle, Edit2, LogOut,
  CheckCircle, DollarSign, Activity, Filter, ArrowRight, Calendar, Trash2, Download, LayoutDashboard
} from 'lucide-react';

import BookingList from './admin/BookingList';
import DashboardOverview from './admin/DashboardOverview';
import EventList from './admin/EventList';
import Sidebar from './admin/Sidebar';
import TransactionList from './admin/TransactionList';

const AdminDashboardView = () => {
  const { api, logout, user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [seatsCount, setSeatsCount] = useState('20');

  const [bookings, setBookings] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [subView, setSubView] = useState('main');

  const [editingEventId, setEditingEventId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const formatRupees = (paise) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(paise / 100);
  };

  const fetchAdminData = async () => {
    try {
      setDataLoading(true);
      const [ledgerRes, eventsRes] = await Promise.all([
        api.get('/admin/global-ledger'),
        api.get('/events')
      ]);

      setBookings(ledgerRes.data.bookings || []);
      setAllTransactions(ledgerRes.data.transactions || []);
      setEvents(eventsRes.data || []);

    } catch (err) {
      console.error("Ledger Fetch Error:", err);
      setError('System Failure: Could not query absolute reservation/ledger tables.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateEvent = async (e) => {
    setError('');
    setSuccess('');
    setLoading(true);

    let finalTitle, finalDescription, finalDate, finalTotalSeats;

    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
      finalTitle = title;
      finalDescription = description;
      finalDate = date;
      finalTotalSeats = parseInt(seatsCount);
    } else if (e && typeof e === 'object') {
      finalTitle = e.title;
      finalDescription = e.description;
      finalDate = e.date;
      finalTotalSeats = parseInt(e.totalSeats);
    }

    if (!finalTitle || !finalDescription || !finalDate || isNaN(finalTotalSeats) || finalTotalSeats <= 0) {
      setError('Validation Error: Please provide all valid event details and a positive seat pool size.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/events', {
        title: finalTitle,
        description: finalDescription,
        date: finalDate,
        totalSeats: finalTotalSeats
      });

      setSuccess(`Deployment Success: Event "${finalTitle}" initialized cleanly.`);

      setTitle('');
      setDescription('');
      setDate('');
      setSeatsCount('20');

      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Compile Error: Could not execute event deployment.');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (event) => {
    setEditingEventId(event._id);
    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditDate(new Date(event.date).toISOString().slice(0, 16));
  };

  const handleUpdateEvent = async (eventId) => {
    setError(''); setSuccess('');
    try {
      await api.put(`/events/${eventId}`, { title: editTitle, description: editDescription, date: editDate });
      setSuccess('Schema Mutation Success: Event deployment data refactored cleanly.');
      setEditingEventId(null);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Update Failure: Could not synchronize mutations.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event deployment?')) return;
    setError(''); setSuccess('');
    try {
      await api.delete(`/events/${eventId}`);
      setSuccess('Schema Mutation Success: Event record wiped successfully.');
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete Failure: Event might have linked active bookings.');
    }
  };

  const handleCancelAndRefund = async (bookingId) => {
    setError(''); setSuccess(''); setCancellingId(bookingId);
    try {
      const res = await api.post(`/admin/cancel/${bookingId}`);
      setSuccess(`Atomic Rollback Triggered: Refunded ${formatRupees(res.data.booking.totalAmount)} cleanly.`);
      fetchAdminData();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction Refund Error: Rollback isolation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  const exportToExcelSheet = (type) => {
    let tableHeaders = [];
    let tableRows = "";
    let fileName = "";

    const cellStyle = 'style="padding: 10px; font-family: Calibri, sans-serif; font-size: 14pt; border: 1px solid #CBD5E1; text-align: left;"';
    const headerStyle = 'style="padding: 12px; font-family: Calibri, sans-serif; font-size: 14pt; font-weight: bold; background-color: #0EA5E9; color: #FFFFFF; border: 1px solid #0EA5E9; text-align: left;"';

    if (type === 'bookings') {
      fileName = "Global_Bookings_Ledger_Report.xls";
      tableHeaders = ["User Name", "User Email", "Event Title", "Seats Allocated", "Charged Amount", "Status"];
      filteredBookings.forEach(b => {
        tableRows += `<tr><td ${cellStyle}>${b.userId?.name || 'N/A'}</td><td ${cellStyle}>${b.userId?.email || 'N/A'}</td><td ${cellStyle}>${b.eventId?.title || 'N/A'}</td><td ${cellStyle}>${b.seats.map(s => s.seatNumber).join(', ')}</td><td ${cellStyle}>INR ${b.totalAmount / 100}</td><td ${cellStyle}>${b.status}</td></tr>`;
      });
    } else if (type === 'wallet') {
      fileName = "Idempotency_Wallet_Audit_Report.xls";
      tableHeaders = ["Mutation Flow Type", "Delta Amount", "Idempotency Token Key", "Timestamp Reference"];
      allTransactions.forEach(tx => {
        tableRows += `<tr><td ${cellStyle}>${tx.type}</td><td ${cellStyle}>INR ${tx.amount / 100}</td><td ${cellStyle}>${tx.idempotencyKey || 'system_mutation'}</td><td ${cellStyle}>${new Date(tx.createdAt).toLocaleString('en-IN')}</td></tr>`;
      });
    } else if (type === 'events') {
      fileName = "Active_Venues_Deployment_Report.xls";
      tableHeaders = ["Venue Title", "Description Scope", "Scheduled Timestamp", "Total Seat Capacity"];
      events.forEach(e => {
        tableRows += `<tr><td ${cellStyle}>${e.title}</td><td ${cellStyle}>${e.description || 'N/A'}</td><td ${cellStyle}>${new Date(e.date).toLocaleString('en-IN')}</td><td ${cellStyle}>${e.totalSeats} Seats</td></tr>`;
      });
    }

    const htmlStream = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"></head>
      <body><table style="border-collapse: collapse;"><tr>${tableHeaders.map(h => `<th ${headerStyle}>${h}</th>`).join('')}</tr>${tableRows}</table></body>
      </html>
    `;

    const blob = new Blob([htmlStream], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTicketsBooked = bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.seats.length, 0);
  const filteredBookings = bookings.filter(b => statusFilter === 'ALL' ? true : b.status === statusFilter);

  const navigationItems = [
    { id: 'main', label: 'Dashboard', icon: LayoutDashboard },    
    { id: 'all-events', label: 'Venues', icon: Calendar },      
    { id: 'all-bookings', label: 'Bookings', icon: Ticket },     
    { id: 'all-wallet', label: 'Transactions', icon: Activity }  
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] antialiased text-slate-900 overflow-hidden relative select-none">

      <Sidebar
        subView={subView}
        setSubView={setSubView}
        navigationItems={navigationItems}
        user={user}
        logout={logout}
      />

      <div className="flex-1 flex flex-col min-w-0 md:pl-[296px] h-full relative">

        <header className="bg-[#F8FAFC] border-b border-slate-100 px-6 md:px-8 pt-8 pb-5 sticky top-0 z-40 w-full shrink-0">
          <div className="flex justify-between items-center w-full">
            <div>
              {subView === 'main' && (
                <>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">Management Dashboard</h1>
                  <p className="text-xxl md:text-sm text-slate-500 mt-1 font-medium">Manage venue setups and monitor transaction integrity parameters.</p>
                </>
              )}
              {subView === 'all-events' && (
                <>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">Venue Management</h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">View and manage your registered event locations.</p>
                </>
              )}
              {subView === 'all-bookings' && (
                <>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">Booking Management</h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">Track live reservation summaries and status logs.</p>
                </>
              )}
              {subView === 'all-wallet' && (
                <>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">Financial Ledger</h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">Track user transaction flows, bookings, and payments.</p>
                </>
              )}
            </div>
            <button onClick={fetchAdminData} className="p-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl shadow-sm transition-all hidden md:block">
              <RefreshCw className={`h-5 w-5 ${dataLoading ? 'animate-spin text-[#0EA5E9]' : ''}`} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 md:pb-8 w-full max-w-full">

          {subView === 'main' && (
            <DashboardOverview
              formatRupees={formatRupees}
              totalRevenue={totalRevenue}
              totalTicketsBooked={totalTicketsBooked}
              events={events}
              error={error}
              success={success}
              handleCreateEvent={handleCreateEvent}
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              date={date}
              setDate={setDate}
              seatsCount={seatsCount}
              setSeatsCount={setSeatsCount}
              loading={loading}
              filteredBookings={filteredBookings}
              setSubView={setSubView}
              allTransactions={allTransactions} 
              formatRupees={formatRupees}
            />
          )}

          {subView === 'all-events' && (
            <EventList
              events={events}
              exportToExcelSheet={exportToExcelSheet}
              editingEventId={editingEventId}
              editTitle={editTitle}
              setEditTitle={setEditTitle}
              editDescription={editDescription}
              setEditDescription={setEditDescription}
              editDate={editDate}
              setEditDate={setEditDate}
              handleUpdateEvent={handleUpdateEvent}
              setEditingEventId={setEditingEventId}
              startEditing={startEditing}
              handleDeleteEvent={handleDeleteEvent}
              handleCreateEvent={handleCreateEvent}
            />
          )}

          {subView === 'all-bookings' && (
            <BookingList
              filteredBookings={filteredBookings}
              exportToExcelSheet={exportToExcelSheet}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              formatRupees={formatRupees}
              handleCancelAndRefund={handleCancelAndRefund}
              cancellingId={cancellingId}
            />
          )}

          {subView === 'all-wallet' && (
            <TransactionList
              allTransactions={allTransactions}
              allBookings={bookings}
              exportToExcelSheet={exportToExcelSheet}
              formatRupees={formatRupees}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;




