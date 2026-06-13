const pool = require('../../config/db');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const repo = require('./repository');

// ISO date strings (YYYY-MM-DD). Used to default the `from`/`to` range
// when a report endpoint is called without explicit dates — this matches
// the production-grade ergonomics every major BI tool ships.
function defaultRange(days = 30) {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
}

// Validates YYYY-MM-DD; returns null for invalid input so we can default.
function parseDate(s) {
  if (!s || typeof s !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T00:00:00Z');
  return isNaN(d.getTime()) ? null : s;
}

async function routes(fastify) {

  // Attendance summary by role for a date range. Both `from` and `to` default
  // to the last 30 days when omitted — so a dashboard that fires this
  // query on mount doesn't have to track dates itself.
  fastify.get('/attendance-summary', {
    schema: { tags: ['Reports'], description: 'Attendance summary grouped by role' },
    preHandler: [auth, rbac('ADMIN', 'SENIOR_TL')],
  }, async (req) => {
    const { from, to } = req.query;
    const range = defaultRange();
    return repo.attendanceSummaryByRole(
      parseDate(from) || range.from,
      parseDate(to) || range.to,
    );
  });

  // Ratings summary by role for a date range. Same defaulting as above.
  fastify.get('/ratings-summary', {
    schema: { tags: ['Reports'], description: 'Average rating grouped by role' },
    preHandler: [auth, rbac('ADMIN', 'SENIOR_TL')],
  }, async (req) => {
    const { from, to } = req.query;
    const range = defaultRange();
    return repo.ratingsSummary(
      parseDate(from) || range.from,
      parseDate(to) || range.to,
    );
  });

  // Task completion stats — independent of date range.
  fastify.get('/task-completion', {
    schema: { tags: ['Reports'], description: 'Per-task verified/pending counts' },
    preHandler: [auth, rbac('ADMIN', 'SENIOR_TL')],
  }, async () => {
    return repo.taskCompletionStats();
  });

  // Department attendance aggregated by date range.
  fastify.get('/department-attendance', {
    schema: { tags: ['Reports'], description: 'Per-department attendance counts' },
    preHandler: [auth, rbac('ADMIN')],
  }, async (req) => {
    const { from, to, departmentId } = req.query;
    const range = defaultRange();

    let query = `
      SELECT d.name AS department,
             COUNT(a.id) AS total,
             SUM(CASE WHEN a.status='PRESENT' THEN 1 ELSE 0 END) AS present,
             SUM(CASE WHEN a.status='ABSENT' THEN 1 ELSE 0 END) AS absent,
             SUM(CASE WHEN a.status='HALF_DAY' THEN 1 ELSE 0 END) AS half_day
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      JOIN departments d ON u.department_id = d.id
      WHERE a.deleted_at IS NULL
        AND a.date >= $1 AND a.date <= $2
    `;
    const params = [parseDate(from) || range.from, parseDate(to) || range.to];

    if (departmentId) {
      query += ` AND d.id = $${params.length + 1}`;
      params.push(departmentId);
    }
    query += ` GROUP BY d.id, d.name ORDER BY d.name`;

    const { rows } = await pool.query(query, params);
    return rows;
  });

  // Custom day-by-day summary for a date range.
  fastify.get('/custom-summary', {
    schema: { tags: ['Reports'], description: 'Day-by-day attendance counts' },
    preHandler: [auth, rbac('ADMIN')],
  }, async (req) => {
    const { from, to } = req.query;
    const range = defaultRange();
    const { rows } = await pool.query(`
      SELECT DATE(a.date) AS date,
             COUNT(*) AS total,
             SUM(CASE WHEN a.status='PRESENT' THEN 1 ELSE 0 END) AS present,
             SUM(CASE WHEN a.status='ABSENT' THEN 1 ELSE 0 END) AS absent,
             SUM(CASE WHEN a.status='HALF_DAY' THEN 1 ELSE 0 END) AS half_day
      FROM attendance a
      WHERE a.date BETWEEN $1 AND $2
        AND a.deleted_at IS NULL
      GROUP BY DATE(a.date)
      ORDER BY DATE(a.date)
    `, [parseDate(from) || range.from, parseDate(to) || range.to]);
    return rows;
  });

  // CSV export endpoints. Each returns text/csv with the same defaulting
  // as the JSON equivalents, so the export button works without a date pick.
  fastify.get('/export/:kind', {
    schema: { tags: ['Reports'], description: 'CSV export' },
    preHandler: [auth, rbac('ADMIN', 'SENIOR_TL')],
  }, async (req, reply) => {
    const kind = req.params.kind;
    const { from, to } = req.query;
    const range = defaultRange();
    const f = parseDate(from) || range.from;
    const t = parseDate(to) || range.to;

    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="${kind}-${f}-to-${t}.csv"`);

    if (kind === 'attendance-csv') {
      const rows = await repo.attendanceSummaryByRole(f, t);
      const header = 'role,status,count';
      const body = rows.map((r) => `${r.role},${r.status},${r.count}`).join('\n');
      return `${header}\n${body}\n`;
    }
    if (kind === 'ratings-csv') {
      const rows = await repo.ratingsSummary(f, t);
      const header = 'role,avg_score,total';
      const body = rows.map((r) => `${r.role},${r.avg_score},${r.total}`).join('\n');
      return `${header}\n${body}\n`;
    }
    if (kind === 'tasks-csv') {
      const rows = await repo.taskCompletionStats();
      const header = 'task_id,title,verified,pending';
      const body = rows.map((r) => `${r.id},"${(r.title || '').replace(/"/g, '""')}",${r.verified},${r.pending}`).join('\n');
      return `${header}\n${body}\n`;
    }
    reply.status(404);
    return { error: `Unknown export kind: ${kind}` };
  });
}

module.exports = routes;
