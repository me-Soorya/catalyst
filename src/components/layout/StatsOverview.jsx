import React from 'react';
import { Clock, BookOpen, CheckCircle, ShieldAlert, AlertTriangle, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { formatEventTimeRange } from '../../utils/dateUtils';
import { differenceInMinutes, parseISO, isToday, isThisWeek } from 'date-fns';

export default function StatsOverview() {
  const { events, loading } = useCalendar();
  const { isAuthenticated } = useAuth();

  const now = new Date();

  // 1. Compute Next Upcoming Exam/Deadline
  const upcomingDeadlines = events
    .filter((e) => {
      const isDue = (e.summary || '').includes('[DUE]') || e.category === 'Assignment' || (e.description || '').includes('DEADLINE');
      const eventTime = new Date(e.end?.dateTime || e.start?.dateTime || e.start?.date);
      return isDue && eventTime >= now;
    })
    .sort((a, b) => new Date(a.end?.dateTime || a.start?.dateTime) - new Date(b.end?.dateTime || b.start?.dateTime));

  const nextDeadline = upcomingDeadlines[0] || null;
  const nextDeadlineInfo = nextDeadline ? formatEventTimeRange(nextDeadline.end?.dateTime || nextDeadline.start?.dateTime) : null;

  // 2. Compute Pending Assignments Due This Week
  const pendingThisWeekCount = events.filter((e) => {
    const isDue = (e.summary || '').includes('[DUE]') || (e.description || '').includes('DEADLINE');
    const eventTime = e.end?.dateTime || e.start?.dateTime;
    if (!eventTime) return isDue;
    try {
      const date = parseISO(eventTime);
      return isDue && isThisWeek(date) && date >= now;
    } catch {
      return isDue;
    }
  }).length;

  // 3. Compute Scheduled Study Hours Today
  let todayStudyMinutes = 0;
  events.forEach((e) => {
    const isStudy = (e.summary || '').includes('[STUDY]') || (!e.summary.includes('[DUE]') && (e.description || '').includes('STUDY'));
    const startStr = e.start?.dateTime;
    const endStr = e.end?.dateTime;
    if (isStudy && startStr && endStr) {
      try {
        const startDate = parseISO(startStr);
        if (isToday(startDate)) {
          const dur = Math.max(0, differenceInMinutes(parseISO(endStr), startDate));
          todayStudyMinutes += dur;
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

  const todayStudyHoursStr = (todayStudyMinutes / 60).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      
      {/* Metric 1: Next Exam / Deadline */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Next Deadline</span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        {nextDeadline ? (
          <div className="truncate">
            <div className="text-sm font-semibold text-slate-100 truncate">
              {nextDeadline.summary.replace('[DUE]', '').trim()}
            </div>
            <div className="text-xs text-rose-300 mt-1 flex items-center gap-1.5 font-medium">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/30">
                {nextDeadlineInfo?.relativeBadge}
              </span>
              <span>{nextDeadlineInfo?.timeStr}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 py-1">No upcoming deadlines queued</div>
        )}
      </div>

      {/* Metric 2: Pending Assignments Due This Week */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due This Week</span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-slate-100">{loading ? '...' : pendingThisWeekCount}</span>
          <span className="text-xs text-amber-400 font-medium">assignments</span>
        </div>
      </div>

      {/* Metric 3: Scheduled Study Hours Today */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl group-hover:bg-teal-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Study Hours Today</span>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-bold text-slate-100">{loading ? '...' : `${todayStudyHoursStr} hrs`}</span>
          <span className="text-xs text-teal-400 font-medium">today</span>
        </div>
      </div>

      {/* Metric 4: Calendar Connection Status */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calendar Sync</span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isAuthenticated
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {isAuthenticated ? <CheckCircle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-slate-200">
            {isAuthenticated ? 'Google Connected' : 'Account is not connected'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {isAuthenticated ? 'Direct primary calendar dispatch' : 'Connect Google Calendar to sync events'}
        </p>
      </div>

    </div>
  );
}

