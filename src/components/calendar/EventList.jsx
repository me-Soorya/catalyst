import React, { useState } from 'react';
import { Search, RefreshCw, Calendar as CalendarIcon, Plus, BookOpenCheck, Filter, AlertTriangle } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import EventCard from './EventCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';

export default function EventList({ onOpenCreateModal }) {
  const { events, loading, loadEvents } = useCalendar();
  const { isAuthenticated, login } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'assignments' | 'study'

  // Filter logic
  const filteredEvents = events.filter((event) => {
    const rawTitle = event.summary || '';
    const desc = event.description || '';
    const matchesSearch = rawTitle.toLowerCase().includes(searchTerm.toLowerCase()) || desc.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isAssignment = rawTitle.includes('[DUE]') || event.category === 'Assignment' || desc.includes('DEADLINE');
    const isStudy = rawTitle.includes('[STUDY]') || (!isAssignment && desc.includes('STUDY'));

    if (filterTab === 'assignments') return isAssignment;
    if (filterTab === 'study') return isStudy || !isAssignment;

    return true;
  });

  // Group events by date bucket
  const groupedEvents = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    upcoming: [],
  };

  filteredEvents.forEach((event) => {
    const startStr = event.start?.dateTime || event.start?.date;
    if (!startStr) {
      groupedEvents.upcoming.push(event);
      return;
    }

    try {
      const date = parseISO(startStr);
      if (isToday(date)) {
        groupedEvents.today.push(event);
      } else if (isTomorrow(date)) {
        groupedEvents.tomorrow.push(event);
      } else if (isThisWeek(date)) {
        groupedEvents.thisWeek.push(event);
      } else {
        groupedEvents.upcoming.push(event);
      }
    } catch {
      groupedEvents.upcoming.push(event);
    }
  });

  const renderEventBucket = (title, items, badgeColor) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${badgeColor}`}></span>
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-300">{title}</h3>
          <span className="text-xs text-slate-500 font-semibold">({items.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="mt-8">
      {/* Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-100 flex items-center gap-2.5">
            <BookOpenCheck className="w-6 h-6 text-teal-400" />
            Focus Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAuthenticated
              ? 'Synced directly with your primary Google Calendar.'
              : 'Account is not connected. Connect your Google Account to sync calendar events.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={loadEvents}
            disabled={loading || !isAuthenticated}
            title="Refresh events"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search schedule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-teal-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs: All | Assignments | Study Sessions */}
      <div className="flex items-center gap-2 mb-6 border-b border-teal-900/30 pb-3">
        {[
          { id: 'all', label: 'All Schedule' },
          { id: 'assignments', label: 'Assignments & Deadlines' },
          { id: 'study', label: 'Study Sessions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === tab.id
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 font-medium hidden sm:inline">
          Showing {filteredEvents.length} of {events.length}
        </span>
      </div>

      {/* Content Section */}
      {loading ? (
        <LoadingSpinner label="Fetching your academic schedule..." />
      ) : !isAuthenticated ? (
        /* Disconnected State */
        <div className="glass-panel p-10 sm:p-12 rounded-3xl text-center flex flex-col items-center justify-center my-8 border border-rose-500/20 bg-gradient-to-b from-rose-950/20 via-slate-900/40 to-slate-950/60 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-slate-100 mb-2">
            Account is not connected
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            You are currently not signed in to Google Calendar. Connect your Google Account to view, schedule, and sync your academic deadlines.
          </p>
          <button
            onClick={() => login()}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Connect Google Account</span>
          </button>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div>
          {renderEventBucket('Today', groupedEvents.today, 'bg-emerald-400 animate-pulse')}
          {renderEventBucket('Tomorrow', groupedEvents.tomorrow, 'bg-cyan-400')}
          {renderEventBucket('This Week', groupedEvents.thisWeek, 'bg-blue-400')}
          {renderEventBucket('Upcoming & Future', groupedEvents.upcoming, 'bg-slate-400')}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-12 rounded-2xl text-center flex flex-col items-center justify-center my-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <h3 className="font-display font-semibold text-lg text-slate-200 mb-1">
            {searchTerm ? 'No matching events found' : 'No upcoming academic events'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            {searchTerm
              ? `No events found matching "${searchTerm}". Try clearing your search filter.`
              : 'Your focus schedule is currently empty. Click below to add an assignment or study session.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Student Event</span>
          </button>
        </div>
      )}
    </section>
  );
}

