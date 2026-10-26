import { TIMESTAMP, type Fixture } from './lms-gateway';

/**
 * One coherent learning-management dataset shared by the LMS specs: two
 * boards, each with a level, subject, topic and sub-topic, plus the
 * examinations, papers, assessments, grading and subscription records that
 * hang off them. Parent ids line up so the pages can resolve parent names.
 */

const stamps: Fixture = { createdAt: TIMESTAMP, updatedAt: TIMESTAMP };

export const BOARDS: Fixture[] = [
  {
    _id: 'board-zimsec',
    name: 'ZIMSEC',
    country: 'ZW',
    description: 'Zimbabwe School Examinations Council',
    website: 'https://www.zimsec.co.zw',
    status: 'Active',
    date: TIMESTAMP,
    ...stamps,
  },
  {
    _id: 'board-cambridge',
    name: 'Cambridge',
    country: 'GB',
    description: 'Cambridge International Education',
    status: 'Active',
    date: TIMESTAMP,
    ...stamps,
  },
];

export const LEVELS: Fixture[] = [
  {
    _id: 'level-olevel',
    examinationBoardId: 'board-zimsec',
    name: 'Ordinary Level',
    description: 'Forms 1 to 4',
    status: 'Active',
    ...stamps,
  },
  {
    _id: 'level-alevel',
    examinationBoardId: 'board-cambridge',
    name: 'Advanced Level',
    description: 'Sixth form',
    status: 'Active',
    ...stamps,
  },
];

export const GRADES: Fixture[] = [
  {
    _id: 'grade-form3',
    educationalLevelId: 'level-olevel',
    name: 'Form 3',
    displayOrder: 3,
    status: 'Active',
    ...stamps,
  },
  {
    _id: 'grade-upper6',
    educationalLevelId: 'level-alevel',
    name: 'Upper Sixth',
    displayOrder: 2,
    status: 'Active',
    ...stamps,
  },
];

export const SUBJECTS: Fixture[] = [
  {
    _id: 'subject-maths',
    name: 'Mathematics',
    code: '4004',
    description: 'O Level Mathematics',
    educationalLevelId: 'level-olevel',
    examinationBoardId: 'board-zimsec',
    subjectType: 'ACADEMIC',
    status: 'Published',
    ...stamps,
  },
  {
    _id: 'subject-physics',
    name: 'Physics',
    code: '9702',
    description: 'A Level Physics',
    educationalLevelId: 'level-alevel',
    examinationBoardId: 'board-cambridge',
    subjectType: 'ACADEMIC',
    status: 'Published',
    ...stamps,
  },
];

export const TOPICS: Fixture[] = [
  {
    _id: 'topic-algebra',
    subjectId: 'subject-maths',
    gradeId: 'grade-form3',
    name: 'Algebra',
    order: 1,
    status: 'Published',
    ...stamps,
  },
  {
    _id: 'topic-mechanics',
    subjectId: 'subject-physics',
    gradeId: 'grade-upper6',
    name: 'Mechanics',
    order: 1,
    status: 'Published',
    ...stamps,
  },
];

export const SUB_TOPICS: Fixture[] = [
  {
    _id: 'sub-topic-linear',
    topicId: 'topic-algebra',
    name: 'Linear equations',
    learningObjectives: 'Solve linear equations in one unknown',
    estimatedDurationMinutes: 45,
    order: 1,
    status: 'Published',
    accessLevel: 'Free',
    date: TIMESTAMP,
    ...stamps,
  },
  {
    _id: 'sub-topic-kinematics',
    topicId: 'topic-mechanics',
    name: 'Kinematics',
    learningObjectives: 'Describe motion with equations',
    estimatedDurationMinutes: 60,
    order: 1,
    status: 'Published',
    accessLevel: 'Paid',
    date: TIMESTAMP,
    ...stamps,
  },
];

export const EXAMINATIONS: Fixture[] = [
  {
    _id: 'exam-zimsec-olevel',
    examinationBoardId: 'board-zimsec',
    educationalLevelId: 'level-olevel',
    name: 'November O Level Examinations',
    qualification: 'O Level Certificate',
    description: 'The November sitting',
    status: 'Active',
    date: TIMESTAMP,
    ...stamps,
  },
  {
    _id: 'exam-cambridge-alevel',
    examinationBoardId: 'board-cambridge',
    educationalLevelId: 'level-alevel',
    name: 'June A Level Series',
    qualification: 'A Level Certificate',
    status: 'Active',
    date: TIMESTAMP,
    ...stamps,
  },
];

export const PAPERS: Fixture[] = [
  {
    _id: 'paper-maths-1',
    subjectId: 'subject-maths',
    name: 'Mathematics Paper 1',
    description: 'Short-answer paper',
    type: 'Structured questions',
    numberOfQuestions: 30,
    duration: 150,
    marks: 100,
    status: 'Active',
    ...stamps,
  },
  {
    _id: 'paper-physics-1',
    subjectId: 'subject-physics',
    name: 'Physics Paper 1',
    description: 'Multiple-choice paper',
    type: 'Multiple Choice',
    numberOfQuestions: 40,
    duration: 75,
    marks: 40,
    status: 'Active',
    ...stamps,
  },
];

export const ASSESSMENTS: Fixture[] = [
  {
    _id: 'assessment-algebra',
    examinationPaperId: 'paper-maths-1',
    subjectId: 'subject-maths',
    educationalLevel: 'Ordinary Level',
    topicId: 'topic-algebra',
    title: 'Algebra Revision Quiz',
    description: 'Warm-up questions on linear equations',
    topicTags: ['algebra'],
    questions: [],
    status: 'DRAFT',
    ...stamps,
  },
  {
    _id: 'assessment-kinematics',
    examinationPaperId: 'paper-physics-1',
    subjectId: 'subject-physics',
    educationalLevel: 'Advanced Level',
    title: 'Kinematics Check',
    questions: [],
    status: 'PUBLISHED',
    ...stamps,
  },
];

export const GRADING_SYSTEMS: Fixture[] = [
  {
    _id: 'grading-system-olevel',
    examinationId: 'exam-zimsec-olevel',
    name: 'O Level Letter Grades',
    description: 'A to U',
    status: 'Active',
    ...stamps,
  },
  {
    _id: 'grading-system-alevel',
    examinationId: 'exam-cambridge-alevel',
    name: 'A Level Points',
    status: 'Active',
    ...stamps,
  },
];

export const GRADING_SCALES: Fixture[] = [
  {
    _id: 'scale-a',
    gradingSystemId: 'grading-system-olevel',
    symbol: 'A',
    minimumScore: 70,
    maximumScore: 100,
    description: 'Distinction',
    order: 1,
    status: 'Active',
    ...stamps,
  },
  {
    _id: 'scale-b',
    gradingSystemId: 'grading-system-olevel',
    symbol: 'B',
    minimumScore: 60,
    maximumScore: 69,
    description: 'Merit',
    order: 2,
    status: 'Active',
    ...stamps,
  },
];

export const LEARNER_USER: Fixture = {
  _id: 'system-user-learner',
  name: 'Rudo Chikore',
  phoneNumber: '+263772000111',
  emailAddress: 'rudo@example.com',
  country: 'country-1',
  user: 'user-learner',
  role: 'role-learner',
  status: 'ACTIVE',
  ...stamps,
};

export const SUBSCRIPTION_PLANS: Fixture[] = [
  {
    _id: 'plan-olevel-monthly',
    educationalLevelId: 'level-olevel',
    examinationBoardId: 'board-zimsec',
    name: 'O Level Monthly',
    description: 'Three subjects, billed monthly',
    numberOfSubjects: 3,
    price: 5,
    currency: 'USD',
    billingCycle: 'Monthly',
    gracePeriodDays: 3,
    status: 'Active',
    date: TIMESTAMP,
    ...stamps,
  },
  {
    _id: 'plan-alevel-weekly',
    educationalLevelId: 'level-alevel',
    examinationBoardId: 'board-cambridge',
    name: 'A Level Weekly',
    numberOfSubjects: 2,
    price: 2,
    currency: 'USD',
    billingCycle: 'Weekly',
    gracePeriodDays: 1,
    status: 'Active',
    date: TIMESTAMP,
    ...stamps,
  },
];

export const SUBSCRIPTIONS: Fixture[] = [
  {
    _id: 'subscription-rudo',
    systemUserId: 'system-user-learner',
    subscriptionPlanId: 'plan-olevel-monthly',
    status: 'ACTIVE',
    amount: 5,
    currency: 'USD',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-10-01T00:00:00.000Z',
    billingCycle: 'Monthly',
    notificationSchedule: [],
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  },
  {
    _id: 'subscription-tendai',
    // The session's own system user, which the gateway stub always lists.
    systemUserId: 'system-user-1',
    subscriptionPlanId: 'plan-alevel-weekly',
    status: 'GRACE_PERIOD',
    amount: 2,
    currency: 'USD',
    startDate: '2026-09-20T00:00:00.000Z',
    endDate: '2026-09-27T00:00:00.000Z',
    gracePeriodEndDate: '2026-09-28T00:00:00.000Z',
    billingCycle: 'Weekly',
    notificationSchedule: [],
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
  },
];

export const PROFILES: Fixture[] = [
  {
    _id: 'profile-rudo',
    systemUser: 'system-user-learner',
    type: 'Student',
    image: '',
    educationalLevel: 'level-olevel',
    grade: 'grade-form3',
    bio: 'Preparing for O Level maths',
    status: 'Active',
    ...stamps,
  },
];

/** Every LMS resource, keyed by its URL path segment. */
export const LMS_FIXTURES: Record<string, Fixture[]> = {
  'examination-boards': BOARDS,
  'educational-levels': LEVELS,
  grades: GRADES,
  subjects: SUBJECTS,
  topics: TOPICS,
  'sub-topics': SUB_TOPICS,
  examinations: EXAMINATIONS,
  'examination-papers': PAPERS,
  assessments: ASSESSMENTS,
  'grading-systems': GRADING_SYSTEMS,
  'grading-scales': GRADING_SCALES,
  'subscription-plans': SUBSCRIPTION_PLANS,
  subscriptions: SUBSCRIPTIONS,
  profiles: PROFILES,
};
