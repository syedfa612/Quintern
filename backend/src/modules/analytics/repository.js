const pool = require('../../config/db');
const { checkHierarchyAccess } = require('../../utils/hierarchy');

async function departmentAttendanceRate(departmentId, month, year) {
  const res = await pool.query(`
    SELECT u.id, u.full_name, u.email,
      COUNT(a.id) FILTER (WHERE a.status='PRESENT') as present,
      COUNT(a.id) FILTER (WHERE a.status='ABSENT') as absent,
      COUNT(a.id) FILTER (WHERE a.status='HALF_DAY') as half_day,
      COUNT(a.id) as total_marked
    FROM users u
    LEFT JOIN attendance a ON u.id = a.user_id AND EXTRACT(MONTH FROM a.date)=$2 AND EXTRACT(YEAR FROM a.date)=$3 AND a.deleted_at IS NULL
    WHERE u.department_id=$1 AND u.deleted_at IS NULL AND u.role='INTERN'
    GROUP BY u.id, u.full_name, u.email
  `, [departmentId, month, year]);
  return res.rows;
}

// Top performers, scoped to the requester's hierarchy.
// ADMIN sees all; everyone else sees only users in their downward chain.
async function topPerformers(role, limit = 10, requestingUser = null) {
  // Non-admins get an extra WHERE clause limiting results to their subtree.
  let scopeClause = '';
  const params = [role, limit];
  if (requestingUser && requestingUser.role !== 'ADMIN') {
    // Recursive CTE: pull every id reachable from the requester in the
    // management tree. We parameterize the depth (1, 2, or 3 depending on
    // the role's max reach) so we don't accidentally query the entire user
    // table for a mid-level manager.
    const MAX_DEPTH = { SENIOR_TL: 4, TL: 3, CAPTAIN: 2, INTERN: 1 }[requestingUser.role] || 1;
    scopeClause = `AND u.id IN (
      WITH RECURSIVE team AS (
        SELECT id, manager_id, 1 AS depth FROM users WHERE manager_id = $3 AND deleted_at IS NULL
        UNION ALL
        SELECT u.id, u.manager_id, t.depth + 1
        FROM users u INNER JOIN team t ON u.manager_id = t.id
        WHERE u.deleted_at IS NULL AND t.depth < $4
      )
      SELECT id FROM team
    )`;
    params.push(requestingUser.id, MAX_DEPTH);
  }
  const res = await pool.query(`
    SELECT u.id, u.full_name, u.email, AVG(r.score) as avg_rating, COUNT(r.id) as total_ratings
    FROM users u
    JOIN ratings r ON u.id = r.rated_user_id AND r.deleted_at IS NULL
    WHERE u.role=$1 AND u.deleted_at IS NULL
    ${scopeClause}
    GROUP BY u.id
    ORDER BY avg_rating DESC
    LIMIT $2
  `, params);
  return res.rows;
}

async function attendanceTrends(months = 6, departmentId = null) {
  const res = await pool.query(`
    SELECT TO_CHAR(a.date,'YYYY-MM') as month, a.status, COUNT(*) as count
    FROM attendance a
    JOIN users u ON u.id = a.user_id AND u.deleted_at IS NULL
    WHERE a.deleted_at IS NULL
      AND a.date >= date_trunc('month', CURRENT_DATE) - make_interval(months => $1::int)
      AND ($2::uuid IS NULL OR u.department_id = $2)
    GROUP BY TO_CHAR(a.date,'YYYY-MM'), a.status
    ORDER BY month, a.status
  `, [months, departmentId]);
  return res.rows;
}

module.exports = { departmentAttendanceRate, topPerformers, attendanceTrends };
