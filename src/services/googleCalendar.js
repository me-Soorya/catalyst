import axios from 'axios';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Creates an Axios client instance with Google OAuth authorization header
 */
const createCalendarClient = (accessToken) => {
  return axios.create({
    baseURL: CALENDAR_API_BASE,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Fetches upcoming events from user's primary Google Calendar
 * @param {string} accessToken - Valid Google OAuth access token
 * @returns {Promise<Array>} List of Google Calendar event items
 */
export async function fetchUpcomingEvents(accessToken) {
  if (!accessToken) {
    throw new Error('No Google OAuth access token provided');
  }

  const client = createCalendarClient(accessToken);
  const now = new Date().toISOString();

  const response = await client.get('/calendars/primary/events', {
    params: {
      timeMin: now,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50,
    },
  });

  return response.data.items || [];
}

/**
 * Creates a new study event on user's primary Google Calendar
 * @param {string} accessToken - Valid Google OAuth access token
 * @param {Object} eventData - { title, description, startDateTime, endDateTime, colorId }
 * @returns {Promise<Object>} Created Google Calendar event object
 */
export async function createCalendarEvent(accessToken, eventData) {
  if (!accessToken) {
    throw new Error('No Google OAuth access token provided');
  }

  const client = createCalendarClient(accessToken);

  const payload = {
    summary: eventData.title,
    description: eventData.description || 'Created via Catalyst AI Planner',
    start: {
      dateTime: new Date(eventData.startDateTime).toISOString(),
    },
    end: {
      dateTime: new Date(eventData.endDateTime).toISOString(),
    },
    // Google Calendar API supports colorId 1 to 11
    ...(eventData.colorId ? { colorId: String(eventData.colorId) } : {}),
  };

  const response = await client.post('/calendars/primary/events', payload);
  return response.data;
}

/**
 * Deletes an event from user's primary Google Calendar
 */
export async function deleteCalendarEvent(accessToken, eventId) {
  if (!accessToken) return;
  const client = createCalendarClient(accessToken);
  await client.delete(`/calendars/primary/events/${eventId}`);
}
