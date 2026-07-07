// frontend/src/components/admin/EventList.jsx
import React, { useState } from 'react';
import { Calendar, Download, Edit2, Trash2, PlusCircle, MapPin, Users } from 'lucide-react';

const EventList = ({
  events,
  exportToExcelSheet,
  editingEventId,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editDate,
  setEditDate,
  handleUpdateEvent,
  setEditingEventId,
  startEditing,
  handleDeleteEvent,
  handleCreateEvent 
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTotalSeats, setNewTotalSeats] = useState('');

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newDate || !newTotalSeats) {
      alert('Please fill all fields');
      return;
    }
    
    handleCreateEvent({
      title: newTitle,
      description: newDescription,
      date: newDate,
      totalSeats: Number(newTotalSeats)
    });

    setNewTitle('');
    setNewDescription('');
    setNewDate('');
    setNewTotalSeats('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6">
        <h2 className="text-xl font-black text-slate-950 flex items-center gap-2 mb-4">
          <PlusCircle className="h-5 w-5 text-[#0EA5E9]" />
          <span>Deploy New Location</span>
        </h2>
        
        <form onSubmit={onFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Event Title</label>
            <input 
              type="text" 
              placeholder="Sunburn Arena Show"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0EA5E9]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Timestamp</label>
            <input 
              type="datetime-local" 
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0EA5E9]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Location Details / Description</label>
            <textarea 
              placeholder="Venue details and description..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows="3"
              className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0EA5E9] resize-none"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Pool Size (Total Seats)</label>
              <input 
                type="number" 
                placeholder="500"
                value={newTotalSeats}
                onChange={(e) => setNewTotalSeats(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#0EA5E9]"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 bg-[#0EA5E9] hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition duration-200 text-sm flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> Deploy Venue
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-100 shadow-xl rounded-3xl p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            <span>Active Venues ({events.length})</span>
          </h2>
          <button 
            onClick={() => exportToExcelSheet('events')} 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-sm ml-auto sm:ml-0 transition"
          >
            <Download className="h-4 w-4" /> Export Excel Sheet (Auto-Fit)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-base text-slate-700">
            <thead>
              <tr className="text-left text-xs uppercase font-bold text-slate-400 border-b border-slate-100">
                <th className="pb-3">Event Title</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Target Date</th>
                <th className="pb-3">Pool Size</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-slate-50/40 transition">
                  {editingEventId === event._id ? (
                    <>
                      <td className="py-3">
                        <input 
                          type="text" 
                          value={editTitle} 
                          onChange={e => setEditTitle(e.target.value)} 
                          className="p-2 border rounded-xl text-sm w-full font-semibold focus:border-[#0EA5E9] focus:outline-none" 
                        />
                      </td>
                      <td className="py-3">
                        <input 
                          type="text" 
                          value={editDescription} 
                          onChange={e => setEditDescription(e.target.value)} 
                          className="p-2 border rounded-xl text-sm w-full font-semibold focus:border-[#0EA5E9] focus:outline-none" 
                        />
                      </td>
                      <td className="py-3">
                        <input 
                          type="datetime-local" 
                          value={editDate} 
                          onChange={e => setEditDate(e.target.value)} 
                          className="p-2 border rounded-xl text-sm w-full font-semibold focus:border-[#0EA5E9] focus:outline-none" 
                        />
                      </td>
                      <td className="py-3 font-mono text-slate-400">{event.totalSeats} Seats</td>
                      <td className="py-3 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleUpdateEvent(event._id)} 
                          className="px-3 py-1.5 bg-[#0EA5E9] hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-sm transition"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingEventId(null)} 
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-bold transition"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 font-black text-slate-900">{event.title}</td>
                      <td className="py-4 text-slate-500 max-w-[250px] truncate">{event.description}</td>
                      <td className="py-4 text-slate-600">{new Date(event.date).toLocaleString('en-IN')}</td>
                      <td className="py-4 font-mono font-black text-[#0EA5E9]">{event.totalSeats} Seats</td>
                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => startEditing(event)} 
                          className="p-2 text-slate-400 hover:text-[#0EA5E9] hover:bg-sky-50 rounded-xl transition"
                          title="Edit Event"
                        >
                          <Edit2 className="h-4 w-4 inline" />
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event._id)} 
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4 inline" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-sm font-bold">
                    No active venues deployed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default EventList;