import React, { useState, useEffect } from 'react';
import { X, FileText, BookOpen, Clock, AlertTriangle, Plus, Loader2, Sparkles, Link as LinkIcon, Flag } from 'lucide-react';
import { useCalendar } from '../../context/CalendarContext';
import { toDateTimeLocalString } from '../../utils/dateUtils';
import { addHours, addMinutes, setHours, setMinutes, addDays } from 'date-fns';

export default function AddEventModal({ isOpen, onClose }) {
  const { addEvent, showToast } = useCalendar();

  // Active Tab: 'assignment' | 'study' | 'project'
  const [eventType, setEventType] = useState('assignment');

  // Common / Shared state
  const [subject, setSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignment Tab State
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium'); // 'High' | 'Medium' | 'Low'
  const [portalLink, setPortalLink] = useState('');

  // Study Session Tab State
  const [focusTopic, setFocusTopic] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [targetGoal, setTargetGoal] = useState('');

  // Project / Club Tab State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [projectCategory, setProjectCategory] = useState('project'); // 'project' | 'club'

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      
      // Default due date: Tonight at 11:59 PM
      const tonight1159 = setMinutes(setHours(now, 23), 59);
      setDueDate(toDateTimeLocalString(tonight1159));

      // Default study/project start = next 30m, end = +1h
      const remainder = 30 - (now.getMinutes() % 30);
      const start = addMinutes(now, remainder);
      const end = addHours(start, 1);

      setStartDateTime(toDateTimeLocalString(start));
      setEndDateTime(toDateTimeLocalString(end));

      // Reset fields
      setSubject('');
      setAssignmentTitle('');
      setPriority('Medium');
      setPortalLink('');
      setFocusTopic('');
      setTargetGoal('');
      setProjectTitle('');
      setProjectNotes('');
      setProjectCategory('project');
      setEventType('assignment');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Assignment Quick Presets
  const setAssignmentPreset = (type) => {
    const now = new Date();
    if (type === 'tonight') {
      const tonight = setMinutes(setHours(now, 23), 59);
      setDueDate(toDateTimeLocalString(tonight));
    } else if (type === 'tomorrow') {
      const tomorrow = addDays(now, 1);
      const tomorrow1159 = setMinutes(setHours(tomorrow, 23), 59);
      setDueDate(toDateTimeLocalString(tomorrow1159));
    } else if (type === '3days') {
      const in3Days = addDays(now, 3);
      const target = setMinutes(setHours(in3Days, 23), 59);
      setDueDate(toDateTimeLocalString(target));
    }
  };

  // Study / Project Quick Presets
  const setDurationPreset = (hours) => {
    if (!startDateTime) return;
    try {
      const start = new Date(startDateTime);
      const end = addHours(start, hours);
      setEndDateTime(toDateTimeLocalString(end));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      showToast('Please enter a course or subject name', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (eventType === 'assignment') {
        if (!assignmentTitle.trim()) {
          showToast('Please enter an assignment title', 'error');
          setIsSubmitting(false);
          return;
        }
        if (!dueDate) {
          showToast('Please select a due date and time', 'error');
          setIsSubmitting(false);
          return;
        }

        const dueDateTimeObj = new Date(dueDate);
        const startDateTimeObj = addMinutes(dueDateTimeObj, -30);

        const summary = `[DUE] ${subject.trim().toUpperCase()} - ${assignmentTitle.trim()}`;
        const description = `📌 ASSIGNMENT DEADLINE\nPriority: ${priority}\nSubject: ${subject.trim()}\n${
          portalLink ? `Submission Link: ${portalLink.trim()}\n` : ''
        }`;

        await addEvent({
          title: summary,
          description,
          startDateTime: startDateTimeObj.toISOString(),
          endDateTime: dueDateTimeObj.toISOString(),
          colorId: priority === 'High' ? '11' : priority === 'Medium' ? '5' : '9',
        });
      } else if (eventType === 'study') {
        if (!focusTopic.trim()) {
          showToast('Please enter a focus topic for your study session', 'error');
          setIsSubmitting(false);
          return;
        }
        if (!startDateTime || !endDateTime) {
          showToast('Please select valid start and end times', 'error');
          setIsSubmitting(false);
          return;
        }
        if (new Date(endDateTime) <= new Date(startDateTime)) {
          showToast('End time must be after start time', 'error');
          setIsSubmitting(false);
          return;
        }

        const summary = `[STUDY] ${subject.trim().toUpperCase()} - ${focusTopic.trim()}`;
        const description = `⚡ STUDY SESSION\nSubject: ${subject.trim()}\nFocus: ${focusTopic.trim()}\n${
          targetGoal ? `Target Goal: ${targetGoal.trim()}\n` : ''
        }`;

        await addEvent({
          title: summary,
          description,
          startDateTime,
          endDateTime,
          colorId: '9',
        });
      } else {
        if (!projectTitle.trim()) {
          showToast('Please enter a task or meeting title', 'error');
          setIsSubmitting(false);
          return;
        }
        if (!startDateTime || !endDateTime) {
          showToast('Please select valid start and end times', 'error');
          setIsSubmitting(false);
          return;
        }
        if (new Date(endDateTime) <= new Date(startDateTime)) {
          showToast('End time must be after start time', 'error');
          setIsSubmitting(false);
          return;
        }

        const prefix = projectCategory === 'club' ? '[CLUB]' : '[PROJECT]';
        const summary = `${prefix} ${subject.trim().toUpperCase()} - ${projectTitle.trim()}`;
        const description = `✨ ${projectCategory === 'club' ? 'Club' : 'Project'} Activity\nOrganization/Project: ${subject.trim()}\nTask: ${projectTitle.trim()}\n${
          projectNotes ? `Notes / Link: ${projectNotes.trim()}\n` : ''
        }`;

        await addEvent({
          title: summary,
          description,
          startDateTime,
          endDateTime,
          colorId: projectCategory === 'club' ? '7' : '5',
        });
      }

      onClose();
    } catch (err) {
      // Toast handled by Context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/95 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick add</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">Add calendar event</h2>
            <p className="mt-1 text-xs text-slate-400">Assignments, study sessions, projects & clubs.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-900 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-3 gap-3 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => setEventType('assignment')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                eventType === 'assignment'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Assignment</span>
            </button>

            <button
              type="button"
              onClick={() => setEventType('study')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                eventType === 'study'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Study</span>
            </button>

            <button
              type="button"
              onClick={() => setEventType('project')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                eventType === 'project'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>Project / Club</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {eventType === 'assignment'
                  ? 'Course / Subject'
                  : eventType === 'study'
                  ? 'Subject'
                  : 'Organization / Project Name'}
                <span className="text-teal-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  eventType === 'assignment'
                    ? 'e.g. CS201, Physics, Organic Chem'
                    : eventType === 'study'
                    ? 'e.g. Organic Chemistry, OS'
                    : 'e.g. CSI, Hackathon, Personal App'
                }
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {eventType === 'assignment' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Assignment Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lab Report 3, Problem Set 2"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-rose-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Priority Level
                    </label>
                    <div className="flex gap-1.5">
                      {['High', 'Medium', 'Low'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            priority === p
                              ? p === 'High'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                : p === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                : 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Due Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-rose-400 text-xs text-slate-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Quick Due Date Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignmentPreset('tonight')}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-xs text-slate-300 hover:text-rose-300 transition-all"
                    >
                      Tonight @ 11:59 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentPreset('tomorrow')}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-xs text-slate-300 hover:text-rose-300 transition-all"
                    >
                      Tomorrow @ 11:59 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentPreset('3days')}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-xs text-slate-300 hover:text-rose-300 transition-all"
                    >
                      In 3 Days
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Submission Portal Link / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Canvas link, Google Classroom URL, or notes"
                    value={portalLink}
                    onChange={(e) => setPortalLink(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-rose-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </>
            )}

            {eventType === 'study' && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Focus Topic <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graph Algorithms, Chapter 4 Review"
                    value={focusTopic}
                    onChange={(e) => setFocusTopic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 text-xs text-slate-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 text-xs text-slate-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Quick Duration Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationPreset(1)}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/40 text-xs text-slate-300 hover:text-teal-300 transition-all"
                    >
                      1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationPreset(2)}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/40 text-xs text-slate-300 hover:text-teal-300 transition-all"
                    >
                      2 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationPreset(3)}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/40 text-xs text-slate-300 hover:text-teal-300 transition-all"
                    >
                      Tonight @ 11:59 PM
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Target Learning Goal
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Solve 5 practice problems and review lecture slides..."
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-teal-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
                  />
                </div>
              </>
            )}

            {eventType === 'project' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Task / Meeting Title <span className="text-teal-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CSI Tech Sync, Hackathon Check-in"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'project', label: 'Project' },
                        { value: 'club', label: 'Club' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setProjectCategory(option.value)}
                          className={`rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                            projectCategory === option.value
                              ? option.value === 'club'
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-900/70 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 text-xs text-slate-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endDateTime}
                      onChange={(e) => setEndDateTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 text-xs text-slate-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Quick Duration Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationPreset(1)}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-emerald-300 transition-all"
                    >
                      1 Hour
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationPreset(2)}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-emerald-300 transition-all"
                    >
                      2 Hours
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const tonight = setMinutes(setHours(now, 23), 59);
                        setEndDateTime(toDateTimeLocalString(tonight));
                      }}
                      className="px-3 py-1 rounded-lg bg-slate-850 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-emerald-300 transition-all"
                    >
                      Tonight @ 11:59 PM
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Notes / Link
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Zoom link, GitHub repo, agenda notes..."
                    value={projectNotes}
                    onChange={(e) => setProjectNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-emerald-400 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-teal-900/30">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all disabled:opacity-50 ${
                  eventType === 'assignment'
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-slate-950 shadow-rose-500/20'
                    : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 text-slate-950 shadow-teal-500/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Adding Event...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Save to Google Calendar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
