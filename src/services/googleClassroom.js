import axios from 'axios';

const CLASSROOM_API_BASE = 'https://classroom.googleapis.com/v1';

/**
 * Creates an Axios client instance for Google Classroom API
 */
const createClassroomClient = (accessToken) => {
  return axios.create({
    baseURL: CLASSROOM_API_BASE,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

// ─── DEMO DATA FALLBACK ───────────────────────────────────────────────────────
export const DEMO_COURSES = [
  {
    id: 'demo-cs301',
    name: 'CS301: Algorithms & Data Structures',
    section: 'Fall 2026',
    descriptionHeading: 'Core Computer Science',
    room: 'Room 304',
    ownerId: 'prof-smith',
    alternateLink: 'https://classroom.google.com/c/demo-cs301',
    courseGroupEmail: 'cs301@university.edu',
    theme: 'COMPUTERS',
  },
  {
    id: 'demo-cs402',
    name: 'CS402: Artificial Intelligence & ML',
    section: 'Fall 2026',
    descriptionHeading: 'Advanced Elective',
    room: 'Auditorium B',
    ownerId: 'prof-johnson',
    alternateLink: 'https://classroom.google.com/c/demo-cs402',
    courseGroupEmail: 'cs402@university.edu',
    theme: 'SCIENCE',
  },
  {
    id: 'demo-eng102',
    name: 'ENG102: Academic Writing & Research',
    section: 'Fall 2026',
    descriptionHeading: 'Humanities & Communication',
    room: 'Online - Zoom',
    ownerId: 'prof-davis',
    alternateLink: 'https://classroom.google.com/c/demo-eng102',
    courseGroupEmail: 'eng102@university.edu',
    theme: 'LANGUAGE',
  },
];

export const DEMO_MATERIALS = {
  'demo-cs301': {
    announcements: [
      {
        id: 'ann-101',
        text: 'Important Update: Midterm Project Proposal is due next Wednesday, August 5 at 11:59 PM. Make sure to submit your PDF draft on GitHub Classroom or via the portal before the deadline.',
        creationTime: '2026-07-30T10:00:00Z',
        updateTime: '2026-07-30T10:00:00Z',
        alternateLink: 'https://classroom.google.com',
        materials: [
          {
            link: {
              url: 'https://github.com/classroom',
              title: 'Project Proposal Template & Submission Portal',
            },
          },
        ],
      },
      {
        id: 'ann-102',
        text: 'Lecture 12 slides on Graph Dynamic Programming have been uploaded. Please review exercise 4 before Friday\'s lab.',
        creationTime: '2026-07-28T14:30:00Z',
        updateTime: '2026-07-28T14:30:00Z',
        alternateLink: 'https://classroom.google.com',
        materials: [],
      },
    ],
    materials: [
      {
        id: 'mat-101',
        title: 'Week 4 Reading: Dijkstra and A* Search Algorithms',
        description: 'Mandatory reading for upcoming quiz. Finish reading Chapter 8 by August 7th.',
        creationTime: '2026-07-29T09:00:00Z',
        alternateLink: 'https://classroom.google.com',
        materials: [
          {
            driveFile: {
              driveFile: {
                title: 'Chapter8_Graph_Algorithms.pdf',
                alternateLink: 'https://drive.google.com',
              },
            },
          },
        ],
      },
    ],
  },
  'demo-cs402': {
    announcements: [
      {
        id: 'ann-201',
        text: 'Reminder: Lab 3 - Fine-Tuning Transformer Models. The code submission deadline is Friday, August 7 at 5:00 PM (+05:30). Late submissions will incur a 10% penalty per day.',
        creationTime: '2026-07-31T08:00:00Z',
        updateTime: '2026-07-31T08:00:00Z',
        alternateLink: 'https://classroom.google.com',
        materials: [],
      },
    ],
    materials: [
      {
        id: 'mat-201',
        title: 'Neural Network PyTorch Starter Template',
        description: 'Starter Jupyter notebook for Lab 3.',
        creationTime: '2026-07-30T16:00:00Z',
        alternateLink: 'https://classroom.google.com',
        materials: [
          {
            driveFile: {
              driveFile: {
                title: 'Lab3_Transformer_Baseline.ipynb',
                alternateLink: 'https://drive.google.com',
              },
            },
          },
        ],
      },
    ],
  },
  'demo-eng102': {
    announcements: [
      {
        id: 'ann-301',
        text: 'Peer review session scheduled! Please upload your Annotated Bibliography rough draft by August 10, 2026 at 6:00 PM.',
        creationTime: '2026-07-31T11:15:00Z',
        updateTime: '2026-07-31T11:15:00Z',
        alternateLink: 'https://classroom.google.com',
        materials: [],
      },
    ],
    materials: [
      {
        id: 'mat-301',
        title: 'MLA Citation Guidelines 9th Edition',
        description: 'Reference style guide for research papers.',
        creationTime: '2026-07-25T12:00:00Z',
        alternateLink: 'https://classroom.google.com',
        materials: [],
      },
    ],
  },
};

export const DEMO_COURSEWORK = {
  'demo-cs301': [
    {
      id: 'cw-101',
      title: 'Assignment 2: Red-Black Tree Implementation',
      description: 'Implement a self-balancing Red-Black Tree in Java/C++ with full unit test coverage.',
      creationTime: '2026-07-26T10:00:00Z',
      dueDate: { year: 2026, month: 8, day: 6 },
      dueTime: { hours: 23, minutes: 59 },
      maxPoints: 100,
      alternateLink: 'https://classroom.google.com',
      workType: 'ASSIGNMENT',
      materials: [],
    },
    {
      id: 'cw-102',
      title: 'Problem Set 3: Complexity Analysis',
      description: 'Solve problems 1-5 in Chapter 4.',
      creationTime: '2026-07-27T10:00:00Z',
      dueDate: { year: 2026, month: 8, day: 12 },
      dueTime: { hours: 18, minutes: 0 },
      maxPoints: 50,
      alternateLink: 'https://classroom.google.com',
      workType: 'ASSIGNMENT',
      materials: [],
    },
  ],
  'demo-cs402': [
    {
      id: 'cw-201',
      title: 'Lab 3: Fine-Tuning Transformer Models',
      description: 'Fine-tune BERT for text classification on IMDb dataset.',
      creationTime: '2026-07-30T09:00:00Z',
      dueDate: { year: 2026, month: 8, day: 7 },
      dueTime: { hours: 17, minutes: 0 },
      maxPoints: 100,
      alternateLink: 'https://classroom.google.com',
      workType: 'ASSIGNMENT',
      materials: [],
    },
  ],
  'demo-eng102': [
    {
      id: 'cw-301',
      title: 'Annotated Bibliography First Draft',
      description: 'Submit 5 peer-reviewed sources with 150-word annotations.',
      creationTime: '2026-07-28T14:00:00Z',
      dueDate: { year: 2026, month: 8, day: 10 },
      dueTime: { hours: 18, minutes: 0 },
      maxPoints: 50,
      alternateLink: 'https://classroom.google.com',
      workType: 'ASSIGNMENT',
      materials: [],
    },
  ],
};

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

/**
 * Fetches active courses enrolled by the authenticated student.
 * GET https://classroom.googleapis.com/v1/courses?studentId=me&courseStates=ACTIVE
 *
 * @param {string} accessToken - Valid OAuth access token
 * @returns {Promise<Array>} List of course objects
 */
export async function fetchEnrolledCourses(accessToken) {
  if (!accessToken) {
    console.warn('No accessToken provided, returning demo courses');
    return DEMO_COURSES;
  }

  try {
    const client = createClassroomClient(accessToken);
    const response = await client.get('/courses', {
      params: {
        studentId: 'me',
        courseStates: 'ACTIVE',
      },
    });

    const courses = response.data.courses || [];
    return courses.length > 0 ? courses : DEMO_COURSES;
  } catch (err) {
    console.warn('Google Classroom API fetchEnrolledCourses error (using demo fallback):', err.message);
    return DEMO_COURSES;
  }
}

/**
 * Fetches announcements, course materials, and attachments for a specific course.
 * GET /v1/courses/{courseId}/announcements
 * GET /v1/courses/{courseId}/courseWorkMaterials
 *
 * @param {string} accessToken - Valid OAuth access token
 * @param {string} courseId - Google Classroom course ID
 * @returns {Promise<Object>} { announcements: [...], materials: [...] }
 */
export async function fetchCourseMaterials(accessToken, courseId) {
  if (!accessToken || courseId?.startsWith('demo-')) {
    return DEMO_MATERIALS[courseId] || { announcements: [], materials: [] };
  }

  try {
    const client = createClassroomClient(accessToken);

    const [announcementsRes, materialsRes] = await Promise.allSettled([
      client.get(`/courses/${courseId}/announcements`),
      client.get(`/courses/${courseId}/courseWorkMaterials`),
    ]);

    const announcements = announcementsRes.status === 'fulfilled'
      ? (announcementsRes.value.data.announcements || [])
      : [];

    const materials = materialsRes.status === 'fulfilled'
      ? (materialsRes.value.data.courseWorkMaterial || [])
      : [];

    return { announcements, materials };
  } catch (err) {
    console.warn(`fetchCourseMaterials error for ${courseId} (using demo fallback):`, err.message);
    return DEMO_MATERIALS[courseId] || { announcements: [], materials: [] };
  }
}

/**
 * Fetches formal coursework items for a specific course.
 * GET /v1/courses/{courseId}/courseWork
 *
 * @param {string} accessToken - Valid OAuth access token
 * @param {string} courseId - Google Classroom course ID
 * @returns {Promise<Array>} List of coursework items
 */
export async function fetchCourseWork(accessToken, courseId) {
  if (!accessToken || courseId?.startsWith('demo-')) {
    return DEMO_COURSEWORK[courseId] || [];
  }

  try {
    const client = createClassroomClient(accessToken);
    const response = await client.get(`/courses/${courseId}/courseWork`);
    return response.data.courseWork || [];
  } catch (err) {
    console.warn(`fetchCourseWork error for ${courseId} (using demo fallback):`, err.message);
    return DEMO_COURSEWORK[courseId] || [];
  }
}
