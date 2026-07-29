import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Navbar from './components/layout/Navbar';
import StatsOverview from './components/layout/StatsOverview';
import EventList from './components/calendar/EventList';
import AddEventModal from './components/calendar/AddEventModal';
import Toast from './components/common/Toast';
import { useAuth } from './context/AuthContext';
import { useCalendar, CalendarProvider } from './context/CalendarContext';

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { events } = useCalendar();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayName = user?.name?.split(' ')[0] || 'Student';
  const currentDate = format(clock, 'MMMM d, yyyy');
  const currentDay = format(clock, 'EEEE');
  const currentTime = format(clock, 'h:mm:ss a');
  const upcomingCount = events.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#070d19] text-slate-100 font-sans selection:bg-teal-400 selection:text-slate-950">
      <Navbar onOpenCreateModal={() => setIsAddModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-teal-950/40 to-slate-950/90 border border-teal-500/20 shadow-2xl shadow-teal-950/40 mb-8">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none hidden md:block">
            <img src="/logo.png" alt="Catalyst Watermark" className="w-56 h-56 object-contain" />
          </div>

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
              Welcome back
            </span>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-100 tracking-tight leading-tight">
              Welcome, {displayName} 👋
            </h1>

            <p className="text-sm text-slate-300 mt-3 max-w-2xl">
              Here is your live schedule overview for today.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 items-stretch">
              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-5 shadow-[0_20px_80px_-40px_rgba(20,184,166,0.25)] flex flex-col justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-3">Today's Date</p>
                  <p className="text-xl font-semibold text-slate-100">{currentDate}</p>
                  <p className="text-sm text-slate-400 mt-1">{currentDay}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/80 p-5 shadow-[0_20px_80px_-40px_rgba(56,189,248,0.25)] flex flex-col justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-3">Live Clock</p>
                  <p className="text-4xl font-extrabold text-teal-300">{currentTime}</p>
                  <p className="text-sm text-slate-400 mt-1">Real-time study rhythm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <StatsOverview />

        <EventList onOpenCreateModal={() => setIsAddModalOpen(true)} />
      </main>

      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <Toast />

      <footer className="border-t border-teal-950/50 py-6 mt-16 bg-[#050912] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Catalyst" className="w-4 h-4 object-contain" />
            <span className="font-display font-bold text-slate-300">Catalyst Study Planner</span>
          </div>
          <div>Powered by React, Vite & Google Calendar API v3</div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <CalendarProvider>
      <Dashboard />
    </CalendarProvider>
  );
}
