const { z } = require('zod');
const auth = require('../../middleware/auth');
const rbac = require('../../middleware/rbac');
const pool = require('../../config/db');

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  action: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
  resourceType: z.string().max(50).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

async function routes(fastify) {
  // Paginated, filterable audit log. Admins only. The previous version was
  // a fixed LIMIT 100 with no filters — useless for any real investigation.
  fastify.get('/', { preHandler: [auth, rbac('ADMIN')] }, async (req, reply) => {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Bad Request', details: parsed.error.format() });
    }
    const { page, limit, action, userId, resourceType, from, to } = parsed.data;
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];
    if (action) { params.push(action); where.push(`action = $${params.length}`); }
    if (userId) { params.push(userId); where.push(`user_id = $${params.length}`); }
    if (resourceType) { params.push(resourceType); where.push(`resource_type = $${params.length}`); }
    if (from) { params.push(from); where.push(`created_at >= $${params.length}`); }
    if (to) { params.push(to); where.push(`created_at <= $${params.length}`); }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Two queries: page of rows + total count. Both are parameter-safe and
    // use the (user_id), (action), (created_at) indexes for hot filters.
    const dataParams = [...params, limit, offset];
    const dataSql = `SELECT * FROM audit_logs ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const countSql = `SELECT COUNT(*)::int AS total FROM audit_logs ${whereSql}`;

    const [data, count] = await Promise.all([
      pool.query(dataSql, dataParams),
      pool.query(countSql, params),
    ]);
    return { data: data.rows, total: count.rows[0].total, page, limit };
  });
}

module.exports = routes;
