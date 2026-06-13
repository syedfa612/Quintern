// Small pure helpers used across pages. Keep this file dependency-free so it
// can be imported from anywhere (including tests).

import { ROLE_RANK } from './constants';

export function initialsOf(user) {
  const n = (user?.fullName || user?.full_name || user?.email || '?').trim();
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';
}

export function attendancePct(m) {
  // Supports the full status set: PRESENT=1.0, WFH=1.0, HALF_DAY=0.5,
  // LEAVE/EXAM_LEAVE/ABSENT=0.
  const total = Number(m?.attendance_total) || 0;
  if (!total) return null;
  const score =
    Number(m.present_count || 0) * 1.0 +
    Number(m.half_day_count || 0) * 0.5 +
    Number(m.wfh_count || 0) * 1.0 +
    Number(m.leave_count || 0) * 0.0 +
    Number(m.exam_leave_count || 0) * 0.0;
  return Math.round((score / total) * 100);
}

export function pctColor(p) {
  if (p === null || p === undefined) return 'bg-gray-200';
  if (p >= 85) return 'bg-green-500';
  if (p >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return '—';
  }
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return '—';
  }
}

export function fullName(user) {
  return user?.fullName || user?.full_name || user?.email || '—';
}

export function pickDefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined));
}

// Convert snake_case object to camelCase keys.
export function snakeToCamel(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      snakeToCamel(v),
    ]),
  );
}

// Convert camelCase object to snake_case keys.
export function camelToSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      k.replace(/([A-Z])/g, '_$1').toLowerCase(),
      camelToSnake(v),
    ]),
  );
}

export function isAbove(roleA, roleB) {
  return (ROLE_RANK[roleA] ?? -1) > (ROLE_RANK[roleB] ?? -1);
}
