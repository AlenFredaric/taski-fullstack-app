// frontend/src/components/admin/Sidebar.jsx
import React from 'react';
import { Shield, LogOut } from 'lucide-react';

const Sidebar = ({ subView, setSubView, navigationItems, user, logout }) => {
  return (
    <>
      <aside className="fixed hidden md:flex left-4 top-4 bottom-4 z-50 w-72 bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[8px_8px_24px_rgba(163,177,198,0.2)] flex-col justify-between p-5 transition-all">
        <div className="space-y-10 w-full">
          <div className="flex items-center gap-4 py-1 px-2 w-full bg-white/40 border border-white/30 rounded-2xl shadow-inner">
            <div className="bg-[#0EA5E9] text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 tracking-tight text-base">taSki OS</h3>
              <span className="text-[10px] font-extrabold text-[#0EA5E9] uppercase bg-sky-50 px-1.5 py-0.5 rounded">Management</span>
            </div>
          </div>

          <nav className="space-y-3 w-full">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = subView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSubView(item.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-200 border border-transparent ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white shadow-lg shadow-[#0EA5E9]/20' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white hover:border-white/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 flex items-center justify-center ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-base font-extrabold tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 border-t border-slate-200/60 pt-5 w-full">
          <div className="flex items-center gap-3 bg-white/40 border border-white/30 rounded-2xl p-2 shadow-inner">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-100 border border-white flex items-center justify-center text-slate-700 font-black text-sm">
              {user?.name?.slice(0,2).toUpperCase() || 'AD'}
            </div>
            <div className="truncate">
              <h4 className="text-sm font-bold text-slate-900 truncate max-w-[140px]">{user?.name || 'Administrator'}</h4>
              <p className="text-xs text-slate-400 truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>

          <button onClick={logout} className="w-full flex items-center gap-4 p-3 rounded-2xl text-left text-slate-500 hover:text-rose-600 bg-white/40 border border-white/30 shadow-sm hover:bg-rose-50/60 transition-all">
            <div className="p-2 rounded-xl bg-slate-50 text-slate-500 shrink-0"><LogOut className="h-5 w-5" /></div>
            <span className="text-base font-extrabold tracking-tight">Sign Out Account</span>
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-lg border-t border-slate-200/60 z-50 flex justify-around items-center py-2 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = subView === item.id;
          return (
            <button 
              key={item.id} 
              onClick={() => setSubView(item.id)} 
              className={`flex flex-col items-center p-2 rounded-xl text-center transition-all ${isActive ? 'text-[#0EA5E9]' : 'text-slate-400'}`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-[10px] font-bold mt-1">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button onClick={logout} className="flex flex-col items-center p-2 text-slate-400">
          <LogOut className="h-5 w-5 text-rose-500" />
          <span className="text-[10px] font-bold mt-1 text-rose-500">Exit</span>
        </button>
      </div>
    </>
  );
};

export default Sidebar;