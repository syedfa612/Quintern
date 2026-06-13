const { z } = require('zod');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const repo = require('./repository');
const pool = require('../../config/db');


async function routes(fastify) {
  fastify.get('/overview', { preHandler: [auth, rbac('ADMIN','SENIOR_TL')] }, async () => {
    const counts = await pool.query("SELECT role, COUNT(*)::int AS count FROM users WHERE deleted_at IS NULL GROUP BY role ORDER BY role");
    return { users: counts.rows };
  });

  // Department attendance rate (admin/senior TL)
  fastify.get('/department-attendance', { preHandler: [auth, rbac('ADMIN','SENIOR_TL')] }, async (req, reply) => {
    const schema = z.object({
      departmentId: z.string().uuid(),
      month: z.coerce.number().int().min(1).max(12),
      year: z.coerce.number().int().min(2000).max(2100),
    });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Bad Request', details: parsed.error.format() });
    }
    return repo.departmentAttendanceRate(parsed.data.departmentId, parsed.data.month, parsed.data.year);
  });

  // Top performers
  // ADMIN sees every tier. SENIOR_TL/TL/CAPTAIN see roles strictly below
  // their own (and INTERN — every manager has direct or indirect reach to
  // interns). The repository further scopes the result set to the
  // requester's downward hierarchy.
  fastify.get('/top-performers', {
    preHandler: [auth, rbac('ADMIN','SENIOR_TL','TL','CAPTAIN')],
  }, async (req, reply) => {
    const schema = z.object({
      role: z.enum(['ADMIN', 'SENIOR_TL', 'TL', 'CAPTAIN', 'INTERN']).default('INTERN'),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    });
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return reply.status(400).send({ error: 'Bad Request', details: result.error.format() });
    }
    const { role, limit } = result.data;

    const PERMITTED = {
      ADMIN:     ['ADMIN', 'SENIOR_TL', 'TL', 'CAPTAIN', 'INTERN'],
      SENIOR_TL: ['TL', 'CAPTAIN', 'INTERN'],
      TL:        ['CAPTAIN', 'INTERN'],
      CAPTAIN:   ['INTERN'],
    };
    const userRole = req.user?.role;
    if (!userRole || !PERMITTED[userRole]?.includes(role)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Your role (${userRole || 'UNKNOWN'}) cannot query top performers for the ${role} tier.`,
      });
    }
    return repo.topPerformers(role, limit, req.user);
  });

  // Attendance trends. The JWT only carries id/role — fetch the requester's
  // department here so non-admins get a properly scoped view (previously this
  // branch was passing req.user.departmentId, which was always undefined).
  fastify.get('/attendance-trends', { preHandler: [auth, rbac('ADMIN','SENIOR_TL')] }, async (req, reply) => {
    const schema = z.object({
      months: z.coerce.number().int().min(1).max(24).default(6),
      departmentId: z.string().uuid().optional(),
    });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Bad Request', details: parsed.error.format() });
    }
    const { months, departmentId } = parsed.data;

    let scopedDeptId = departmentId;
    if (req.user.role !== 'ADMIN') {
      const { rows } = await pool.query('SELECT department_id FROM users WHERE id = $1 AND deleted_at IS NULL', [req.user.id]);
      if (!rows[0]?.department_id) {
        return reply.status(403).send({ error: 'Forbidden', message: 'You must belong to a department to view trends' });
      }
      // Senior_TL can only see their own department; explicit overrides ignored.
      scopedDeptId = rows[0].department_id;
    }
    return repo.attendanceTrends(months, scopedDeptId);
  });
}

module.exports = routes;
