import React, { useState } from 'react';
import { Clock, ExternalLink, Trash2, ChevronDown, ChevronUp, FileText, BookOpen, AlertCircle } from 'lucide-react';
import { formatEventTimeRange, calculateDuration } from '../../utils/dateUtils';
import { useCalendar } from '../../context/CalendarContext';

export default function EventCard({ event }) {
  const { removeEvent } = useCalendar();
  const [showNotes, setShowNotes] = useState(false);

  const rawTitle = event.summary || 'Untitled Event';
  const isAssignment = rawTitle.includes('[DUE]') || event.category === 'Assignment' || (event.description || '').includes('DEADLINE');
  const isStudySession = rawTitle.includes('[STUDY]') || (!isAssignment && (event.description || '').includes('STUDY'));

  // Clean title (strip [DUE] or [STUDY] prefix if present)
  const displayTitle = rawTitle.replace('[DUE]', '').replace('[STUDY]', '').trim();

  const startStr = event.start?.dateTime || event.start?.date;
  const endStr = event.end?.dateTime || event.end?.date;
  
  const { dateStr, timeStr, relativeBadge } = formatEventTimeRange(startStr, endStr);
  const duration = calculateDuration(startStr, endStr);

  return (
    <div className="glass-panel glass-panel-hover p-5 rounded-2xl relative group transition-all">
      {/* Accent left border gradient based on type */}
      <div
        className={`absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full ${
          isAssignment
            ? 'bg-gradient-to-b from-rose-500 via-pink-500 to-amber-500'
            : 'bg-gradient-to-b from-teal-400 via-cyan-500 to-blue-600'
        }`}
      ></div>

      <div className="pl-3">
        {/* Header Row: Type Badge, Relative Day, Duration, Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            
            {/* Event Type Badge */}
            <span
              className={`px-2.5 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
                isAssignment
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-teal-500/15 text-teal-300 border-teal-500/30'
              }`}
            >
              {isAssignment ? <FileText className="w-3 h-3 text-rose-400" /> : <BookOpen className="w-3 h-3 text-teal-400" />}
              <span>{isAssignment ? 'Deadline' : 'Study Session'}</span>
            </span>

            {/* Relative Time Pill */}
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-850 border border-slate-700/60 text-slate-300">
              {relativeBadge}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {duration && (
              <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal-400" />
                {duration}
              </span>
            )}

            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Calendar"
                className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={() => removeEvent(event.id)}
              title="Delete Event"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Time */}
        <h3 className="font-display font-bold text-lg text-slate-100 group-hover:text-teal-300 transition-colors leading-snug mb-1">
          {displayTitle}
        </h3>

        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium mb-2">
          <span className="text-slate-400">{dateStr}</span>
          <span>•</span>
          <span className="text-teal-300 font-semibold">{timeStr}</span>
        </div>

        {/* Notes / Details Collapsible */}
        {event.description && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors font-medium"
            >
              {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showNotes ? 'Hide Details' : 'View Notes & Links'}</span>
            </button>

            {showNotes && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                {event.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
