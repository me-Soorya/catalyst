import axios from 'axios';

/**
 * Extracts due dates and structured assignment information using Gemini Flash API (or local fallback).
 *
 * @param {string} text - The post, announcement, or material content to analyze
 * @param {string} courseName - Name of the course for context
 * @returns {Promise<Object>} JSON matching required schema:
 * {
 *   isAssignment: boolean,
 *   title: string,
 *   course: string,
 *   hasDueDate: boolean,
 *   dueDateISO: string | null,
 *   summary: string
 * }
 */
export async function extractDueDateWithGemini(text, courseName = 'General Course') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const currentISO = new Date().toISOString();
  const currentTimezone = '+05:30';

  if (!text || text.trim().length === 0) {
    return {
      isAssignment: false,
      title: 'Empty Content',
      course: courseName,
      hasDueDate: false,
      dueDateISO: null,
      summary: 'No text content provided.',
    };
  }

  // System instructions as requested
  const systemInstructionText = `You are an expert academic parser. Analyze the given Google Classroom post text.
Determine if this text describes an assignment or task with a due date.
Calculate absolute dates based on the current timestamp if relative dates (like "next Wednesday") are used.
Current ISO timestamp context: ${currentISO}. User Timezone offset: ${currentTimezone}.

Return ONLY a valid JSON object matching this schema:
{
  "isAssignment": boolean,
  "title": "Short title of assignment or material",
  "course": "Course/Subject Name",
  "hasDueDate": boolean,
  "dueDateISO": "YYYY-MM-DDTHH:mm:ss+05:30" (or null if no due date found),
  "summary": "Brief 1-sentence summary of instructions or materials"
}`;

  const promptText = `Course: ${courseName}\nPost Content:\n${text}`;

  if (apiKey) {
    try {
      // Primary endpoint: gemini-2.5-flash
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemInstructionText}\n\n${promptText}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      };

      const response = await axios.post(endpoint, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      const rawContent = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawContent) {
        const cleanedJson = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedJson);
        return {
          isAssignment: Boolean(parsed.isAssignment),
          title: parsed.title || 'Course Material',
          course: parsed.course || courseName,
          hasDueDate: Boolean(parsed.hasDueDate),
          dueDateISO: parsed.dueDateISO || null,
          summary: parsed.summary || 'AI parsed material.',
        };
      }
    } catch (err) {
      console.warn('Gemini API call error (falling back to rule-based parser):', err.response?.data || err.message);
    }
  }

  // ─── LOCAL HEURISTIC FALLBACK PARSER ───────────────────────────────────────
  return fallbackRuleExtractor(text, courseName);
}

/**
 * Fallback parser using regex and date math when Gemini API is unavailable or not configured.
 */
function fallbackRuleExtractor(text, courseName) {
  const lower = text.toLowerCase();

  const isAssignmentKeywords = ['due', 'submit', 'assignment', 'project', 'proposal', 'lab', 'deadline', 'reading', 'draft', 'quiz'];
  const isAssignment = isAssignmentKeywords.some((kw) => lower.includes(kw));

  let hasDueDate = false;
  let dueDateISO = null;

  const now = new Date();

  // Match "August 5", "August 7 at 5:00 PM", "August 10, 2026", etc.
  const dateRegex = /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?(?:\s+(?:at|by)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?/i;
  const dateMatch = text.match(dateRegex);

  if (dateMatch) {
    hasDueDate = true;
    const monthName = dateMatch[1];
    const dayStr = dateMatch[2];
    const yearStr = dateMatch[3] || now.getFullYear().toString();
    let hourStr = dateMatch[4] || '23';
    let minStr = dateMatch[5] || '59';
    const ampm = dateMatch[6]?.toLowerCase();

    let hour = parseInt(hourStr, 10);
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    const monthIndex = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ].indexOf(monthName.toLowerCase());

    const targetDate = new Date(parseInt(yearStr, 10), monthIndex, parseInt(dayStr, 10), hour, parseInt(minStr, 10), 0);
    
    // Format YYYY-MM-DDTHH:mm:ss+05:30
    const tzOffset = '+05:30';
    const pad = (n) => String(n).padStart(2, '0');
    dueDateISO = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}T${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}:00${tzOffset}`;
  } else if (lower.includes('next wednesday')) {
    hasDueDate = true;
    // Calculate next Wednesday from current date
    const targetDate = new Date(now);
    const currentDay = targetDate.getDay();
    let daysUntilWed = (3 - currentDay + 7) % 7;
    if (daysUntilWed === 0) daysUntilWed = 7;
    targetDate.setDate(targetDate.getDate() + daysUntilWed);
    targetDate.setHours(23, 59, 0, 0);

    const pad = (n) => String(n).padStart(2, '0');
    dueDateISO = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}T23:59:00+05:30`;
  } else if (lower.includes('friday')) {
    hasDueDate = true;
    const targetDate = new Date(now);
    const currentDay = targetDate.getDay();
    let daysUntilFri = (5 - currentDay + 7) % 7;
    if (daysUntilFri === 0) daysUntilFri = 7;
    targetDate.setDate(targetDate.getDate() + daysUntilFri);
    targetDate.setHours(17, 0, 0, 0);

    const pad = (n) => String(n).padStart(2, '0');
    dueDateISO = `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}T17:00:00+05:30`;
  }

  // Derive short title
  let title = text.slice(0, 45).replace(/[\r\n]+/g, ' ').trim();
  if (text.length > 45) title += '...';

  const summary = text.slice(0, 120).replace(/[\r\n]+/g, ' ').trim() + (text.length > 120 ? '...' : '');

  return {
    isAssignment,
    title,
    course: courseName,
    hasDueDate,
    dueDateISO,
    summary,
  };
}
