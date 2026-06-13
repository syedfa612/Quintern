const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const repo = require('./repository');

// Default to the last 30 days so the export button works without picking
// dates. Mirrors the JSON endpoints so the UI is symmetric.
function defaultRange(days = 30) {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function routes(fastify) {
  fastify.get('/attendance-csv', {
    schema: { tags: ['Reports'], description: 'Attendance summary CSV export' },
    preHandler: [auth, rbac('ADMIN','SENIOR_TL')],
  }, async (req, reply) => {
    const { from, to } = req.query;
    const range = defaultRange();
    const data = await repo.attendanceSummaryByRole(from || range.from, to || range.to);
    const rows = data.map(r => [r.role, r.status, r.count].map(csvEscape).join(','));
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="attendance-${from || range.from}-to-${to || range.to}.csv"`);
    return ['Role,Status,Count', ...rows].join('\n') + '\n';
  });

  fastify.get('/ratings-csv', {
    schema: { tags: ['Reports'], description: 'Ratings summary CSV export' },
    preHandler: [auth, rbac('ADMIN','SENIOR_TL')],
  }, async (req, reply) => {
    const { from, to } = req.query;
    const range = defaultRange();
    const data = await repo.ratingsSummary(from || range.from, to || range.to);
    const rows = data.map(r => [r.role, parseFloat(r.avg_score).toFixed(2), r.total].map(csvEscape).join(','));
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', `attachment; filename="ratings-${from || range.from}-to-${to || range.to}.csv"`);
    return ['Role,Average Score,Total Ratings', ...rows].join('\n') + '\n';
  });

  fastify.get('/tasks-csv', {
    schema: { tags: ['Reports'], description: 'Task completion CSV export' },
    preHandler: [auth, rbac('ADMIN','SENIOR_TL')],
  }, async (req, reply) => {
    const data = await repo.taskCompletionStats();
    const rows = data.map(t => [t.title, t.verified, t.pending].map(csvEscape).join(','));
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="tasks.csv"');
    return ['Task Title,Verified,Pending', ...rows].join('\n') + '\n';
  });
}

module.exports = routes;
