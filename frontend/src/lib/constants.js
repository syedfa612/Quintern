// Centralized role + status enums. Backend roles are uppercase; display
// labels are sentence-case. Statuses for tasks, attendance, and interns all
// live here so we don't sprinkle magic strings across the codebase.

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  SENIOR_TL: 'SENIOR_TL',
  TL: 'TL',
  CAPTAIN: 'CAPTAIN',
  INTERN: 'INTERN',
});

export const ROLE_LABEL = Object.freeze({
  ADMIN: 'Admin',
  SENIOR_TL: 'Senior TL',
  TL: 'Team Lead',
  CAPTAIN: 'Captain',
  INTERN: 'Intern',
});

export const ROLE_BADGE = Object.freeze({
  ADMIN: 'bg-purple-100 text-purple-700',
  SENIOR_TL: 'bg-indigo-100 text-indigo-700',
  TL: 'bg-blue-100 text-blue-700',
  CAPTAIN: 'bg-teal-100 text-teal-700',
  INTERN: 'bg-gray-100 text-gray-700',
});

// Lower number = lower in the hierarchy. A manager can add anyone with a
// strictly lower rank.
export const ROLE_RANK = Object.freeze({
  ADMIN: 4,
  SENIOR_TL: 3,
  TL: 2,
  CAPTAIN: 1,
  INTERN: 0,
});

export const MANAGER_ROLES = Object.freeze(['ADMIN', 'SENIOR_TL', 'TL', 'CAPTAIN']);

export const ALL_ROLES = Object.freeze(['ADMIN', 'SENIOR_TL', 'TL', 'CAPTAIN', 'INTERN']);

export const ASSIGNABLE_ROLES = Object.freeze(['SENIOR_TL', 'TL', 'CAPTAIN', 'INTERN']);

export const isManager = (role) => MANAGER_ROLES.includes(role);

export const rolesBelow = (role) => {
  const r = ROLE_RANK[role] ?? -1;
  return ASSIGNABLE_ROLES.filter((x) => ROLE_RANK[x] < r);
};

// Attendance statuses — full UptoSkills set.
// PRESENT, ABSENT, LEAVE, EXAM_LEAVE, HALF_DAY, WFH.
// Weights drive the attendance % calculation: PRESENT=1.0, HALF_DAY=0.5,
// WFH=1.0 (counts as present), LEAVE=0 (still neutral), EXAM_LEAVE=0,
// ABSENT=0.
export const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  HALF_DAY: 'HALF_DAY',
  LEAVE: 'LEAVE',
  EXAM_LEAVE: 'EXAM_LEAVE',
  WFH: 'WFH',
});

export const ATTENDANCE_LABEL = Object.freeze({
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Day',
  LEAVE: 'Leave',
  EXAM_LEAVE: 'Exam Leave',
  WFH: 'Work From Home',
});

export const ATTENDANCE_BADGE = Object.freeze({
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-700',
  HALF_DAY: 'bg-yellow-100 text-yellow-700',
  LEAVE: 'bg-blue-100 text-blue-700',
  EXAM_LEAVE: 'bg-purple-100 text-purple-700',
  WFH: 'bg-cyan-100 text-cyan-700',
});

// Weight for the attendance % calculator. WFH is treated as fully present
// for the purposes of % calculation (the user worked, just remotely).
export const ATTENDANCE_WEIGHT = Object.freeze({
  PRESENT: 1.0,
  HALF_DAY: 0.5,
  WFH: 1.0,
  LEAVE: 0.0,
  EXAM_LEAVE: 0.0,
  ABSENT: 0.0,
});

// Rating scale per UptoSkills spec: 1-10 everywhere.
export const RATING_MIN = 1;
export const RATING_MAX = 10;
export const RATING_CATEGORIES = Object.freeze([
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'TASK',        label: 'Task' },
  { value: 'PROJECT',     label: 'Project' },
  { value: 'INTERN',      label: 'Intern' },
  { value: 'TEAM',        label: 'Team' },
  { value: 'MENTOR',      label: 'Mentor' },
  { value: 'REVIEW',      label: 'Review' },
]);

export const PROOF_STATUS = Object.freeze({
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
});

export const PROOF_BADGE = Object.freeze({
  PENDING: 'bg-yellow-100 text-yellow-700',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
});

export const INTERNSHIP_STATUS = Object.freeze({
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
  TERMINATED: 'TERMINATED',
});

export const INTERNSHIP_BADGE = Object.freeze({
  ACTIVE: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  ON_HOLD: 'bg-yellow-100 text-yellow-700',
  TERMINATED: 'bg-red-100 text-red-700',
});

export const PLATFORMS = Object.freeze([
  'LinkedIn', 'GitHub', 'Twitter', 'Medium', 'Instagram', 'YouTube', 'Other',
]);

export const PLATFORM_ICON = Object.freeze({
  LinkedIn: '💼',
  GitHub: '🐙',
  Twitter: '🐦',
  Medium: '📝',
  Instagram: '📸',
  YouTube: '▶️',
  Other: '🎯',
});
