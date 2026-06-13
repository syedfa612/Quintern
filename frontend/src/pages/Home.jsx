import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'
import useAuthStore from '../store/auth'
import { Avatar, Badge, Button, Card, CardBody, CardHeader, EmptyState, PageHeader, Progress, Skeleton, SkeletonStat, Stars, StatCard } from '../components/ui'
import { Sparkline, TrendChart, Donut } from '../components/charts'
import { ROLE_LABEL, isManager } from '../lib/constants'
import { attendancePct, formatDate } from '../lib/format'
import { EmptyInbox, EmptyProjects, EmptyChart, EmptyStars } from '../components/illustrations'

// ============================================================================
//  Shared welcome / quick actions
// ============================================================================
function Mark({ size = 'md' }) {
  const dim = size === 'lg' ? 'w-8 h-8' : 'w-7 h-7'
  return (
    <svg viewBox="0 0 40 40" className={dim} aria-hidden="true">
      <defs>
        <linearGradient id="us-home" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(99 102 241)" />
          <stop offset="100%" stopColor="rgb(139 92 246)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="40" height="40" rx="11" fill="url(#us-home)" />
      <path d="M20 8 L30 28 L20 22 L10 28 Z" fill="white" />
    </svg>
  )
}

function HeroStat({ label, value, sub }) {
  return (
    <div className="px-2 text-center sm:text-right">
      <p className="text-2xl font-semibold text-fg tabular-nums tracking-tight">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-fg-muted mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-fg-subtle mt-0.5">{sub}</p>}
    </div>
  )
}

function WelcomeHeader({ user, role, unread }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = (user?.fullName || user?.email || 'there').split(/\s+/)[0]
  const today = new Date()
  const dateLabel = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  return (
    <div className="mb-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Mark size="md" />
            <p className="text-xs font-medium text-fg-muted tracking-wide uppercase">{greeting} · {dateLabel}</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-fg mt-2">{firstName} <span aria-hidden="true">👋</span></h1>
          <p className="text-sm text-fg-muted mt-1.5">
            {role === 'ADMIN' && 'A snapshot of every department, today.'}
            {role === 'INTERN' && 'Here\'s what\'s on your plate today.'}
            {role !== 'ADMIN' && role !== 'INTERN' && 'Here\'s how your team is doing today.'}
          </p>
        </div>
        <RoleQuickActions role={role} />
      </div>
      {unread > 0 && (
        <Link to="/notifications" className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 rounded-md border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors group dark:border-brand-500/30 dark:bg-brand-500/10 dark:hover:bg-brand-500/15">
          <span className="shrink-0 w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-500/30 text-brand-700 dark:text-brand-200 flex items-center justify-center text-xs font-bold">{unread > 9 ? '9+' : unread}</span>
          <span className="text-sm text-fg"><span className="font-medium">{unread}</span> unread notification{unread === 1 ? '' : 's'}</span>
          <span className="ml-auto text-xs font-medium text-brand-700 dark:text-brand-200 group-hover:underline">View all →</span>
        </Link>
      )}
    </div>
  )
}

function RoleQuickActions({ role }) {
  if (role === 'INTERN') {
    return (
      <div className="flex flex-wrap gap-2">
        <Link to="/tasks"><Button variant="primary" size="sm" leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>}>Upload proof</Button></Link>
        <Link to="/attendance"><Button variant="secondary" size="sm" leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}>My attendance</Button></Link>
        <Link to="/assistant"><Button variant="outline" size="sm" leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" /></svg>}>Ask AI</Button></Link>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Link to="/projects"><Button variant="primary" size="sm" leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>}>New project</Button></Link>
      <Link to="/attendance"><Button variant="secondary" size="sm" leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}>Mark attendance</Button></Link>
      <Link to="/ratings"><Button variant="secondary" size="sm" leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}>Rate team</Button></Link>
      <Link to="/assistant"><Button variant="outline" size="sm" leftIcon={<svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" /></svg>}>Ask AI</Button></Link>
    </div>
  )
}

// ============================================================================
//  Manager / Admin home
// ============================================================================
function ManagerHome({ user }) {
  const { data: team = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => api.get('/team/members').then((res) => res.data),
  })
  const { data: trends } = useQuery({
    queryKey: ['attendanceTrends'],
    queryFn: () => api.get('/analytics/attendance-trends?months=6').then((r) => r.data).catch(() => []),
    enabled: user?.role === 'ADMIN' || user?.role === 'SENIOR_TL',
  })
  const { data: topPerformers } = useQuery({
    queryKey: ['topPerformers'],
    queryFn: () => api.get('/analytics/top-performers?role=INTERN&limit=5').then((r) => r.data).catch(() => []),
  })
  const { data: myProjects = [] } = useQuery({
    queryKey: ['myProjects'],
    queryFn: () => api.get('/projects/me').then((r) => r.data).catch(() => []),
  })
  const { data: insights } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => api.get('/ai/insights').then((r) => r.data).catch(() => null),
    staleTime: 5 * 60 * 1000,
  })
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications/unread-count').then((r) => r.data).catch(() => ({ unread: 0 })),
    refetchInterval: 30000,
  })
  const { data: upcomingMeetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => api.get('/meetings').then((r) => r.data).catch(() => []),
  })

  const totalMembers = team.length
  const activeMembers = useMemo(() => team.filter((m) => !m.suspended && (m.internship_status || 'ACTIVE') === 'ACTIVE').length, [team])
  const pcts = useMemo(() => team.map(attendancePct).filter((p) => p !== null), [team])
  const avgAtt = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null
  const ratings = useMemo(() => team.map((m) => m.avg_rating).filter((r) => r != null).map(Number), [team])
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—'
  const totalTasks = useMemo(() => team.reduce((a, m) => a + (m.total_tasks || 0), 0), [team])
  const verifiedTasks = useMemo(() => team.reduce((a, m) => a + (m.verified_tasks || 0), 0), [team])
  const taskPct = totalTasks > 0 ? Math.round((verifiedTasks / totalTasks) * 100) : 0
  const lowAttendance = useMemo(
    () => team.filter((m) => { const p = attendancePct(m); return p !== null && p < 60; }).slice(0, 5),
    [team]
  )

  // Composite health score
  const healthScore = useMemo(() => {
    const att = avgAtt ?? 0
    const ratePct = ratings.length ? (Number(avgRating) / 10) * 100 : 0
    return Math.round((att * 0.45) + (ratePct * 0.30) + (taskPct * 0.25))
  }, [avgAtt, avgRating, ratings.length, taskPct])

  const upcomingM = useMemo(() => {
    const now = new Date()
    return (upcomingMeetings || []).filter((m) => new Date(m.meeting_date) >= now).slice(0, 4)
  }, [upcomingMeetings])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-80" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 lg:col-span-2" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <WelcomeHeader user={user} role={user?.role} unread={unreadData?.unread || 0} />

      {/* Hero health banner */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 via-transparent to-fuchsia-500/8 pointer-events-none" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl pointer-events-none animate-float-blob" aria-hidden="true" />
        <CardBody className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-fg-muted tracking-wide uppercase">
              <span className={['w-1.5 h-1.5 rounded-full', healthScore >= 75 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'].join(' ')} />
              Team health · last 30 days
            </div>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-semibold text-fg tabular-nums tracking-tight">{healthScore}</span>
              <span className="text-sm text-fg-muted">/ 100</span>
              <Badge tone={healthScore >= 75 ? 'success' : healthScore >= 50 ? 'warning' : 'danger'} size="md" dot>
                {healthScore >= 75 ? 'On target' : healthScore >= 50 ? 'Needs attention' : 'At risk'}
              </Badge>
            </div>
            <p className="text-sm text-fg-muted mt-2 max-w-2xl leading-relaxed">
              Composite of <span className="font-medium text-fg">{avgAtt ?? 0}%</span> attendance,
              <span className="font-medium text-fg"> {avgRating}/10</span> avg rating, and
              <span className="font-medium text-fg"> {taskPct}%</span> tasks verified.
              Update any input on the platform to see it move.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge size="sm" tone="brand">{avgAtt ?? 0}% attendance</Badge>
              <Badge size="sm" tone="info">{avgRating}/10 rating</Badge>
              <Badge size="sm" tone="success">{taskPct}% verified</Badge>
              {lowAttendance.length > 0 && <Badge size="sm" tone="warning">{lowAttendance.length} below target</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <HeroStat label="Members" value={totalMembers} sub={`${activeMembers} active`} />
            <HeroStat label="Projects" value={myProjects.filter((p) => p.status === 'ACTIVE').length} sub="active" />
            <HeroStat label="Tasks" value={verifiedTasks} sub={`of ${totalTasks} verified`} />
          </div>
        </CardBody>
      </Card>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team members" value={totalMembers} hint={`${activeMembers} active · ${totalMembers - activeMembers} inactive`} gradient="from-brand-500 to-violet-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /><circle cx="9" cy="7" r="4" /></svg>} />
        <StatCard label="Avg attendance" value={avgAtt === null ? '—' : `${avgAtt}%`} hint="Last 30 days" gradient="from-sky-500 to-cyan-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>}>
          <Sparkline values={pcts.length ? Array(14).fill(0).map((_, i) => Math.max(0, Math.min(100, (avgAtt || 60) + 6 * Math.sin(i / 2) + (i % 3) * 2 - 3))) : [50, 55, 60, 58, 65, 70, 68, 72, 75, 78, 76, 80, 82, 85]} width={88} height={24} />
        </StatCard>
        <StatCard label="Avg rating" value={avgRating} hint={`out of 10 · ${ratings.length} ratings`} gradient="from-amber-500 to-orange-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}>
          <Sparkline values={[4, 5, 6, 5.5, 6.5, 7, 7.2, 7.5, 7.8, 8, 8.1, 8.3, 8.5, Number(avgRating) || 8]} width={88} height={24} />
        </StatCard>
        <StatCard label="Tasks verified" value={`${verifiedTasks}/${totalTasks}`} hint={`${taskPct}% verified`} gradient="from-emerald-500 to-teal-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></svg>}>
          <Sparkline values={Array(14).fill(0).map((_, i) => Math.max(0, taskPct + 10 * Math.sin(i / 3) - 5))} width={88} height={24} />
        </StatCard>
      </div>

      {/* Projects + Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="My projects" subtitle="Active projects you own or are a member of" actions={<Link to="/projects" className="text-xs font-medium text-fg-muted hover:text-fg">View all →</Link>} />
          <CardBody className="p-0">
            {myProjects.length === 0 ? (
              <EmptyState
                illustration={<EmptyProjects />}
                title="No projects yet"
                description="Create your first project to start tracking work, milestones, and team delivery."
                action={<Link to="/projects"><Button variant="primary" size="sm">New project</Button></Link>}
                className="py-8"
              />
            ) : (
              <ul className="divide-y divide-border">
                {myProjects.slice(0, 5).map((p) => (
                  <li key={p.id} className="px-5 py-3.5 hover:bg-surface-sunken/40 transition-colors">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <Link to={`/projects/${p.id}`} className="text-sm font-semibold text-fg hover:underline truncate block">{p.name}</Link>
                        <p className="text-xs text-fg-muted mt-0.5">{p.task_count} tasks · {p.done_count} done · {p.member_count} members</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge size="sm" tone={p.status === 'ACTIVE' ? 'success' : p.status === 'ON_HOLD' ? 'warning' : p.status === 'COMPLETED' ? 'info' : 'neutral'} dot>{p.status}</Badge>
                        <Badge size="sm" tone={p.health === 'ON_TRACK' ? 'success' : p.health === 'AT_RISK' ? 'warning' : 'danger'} dot>{p.health?.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                    <Progress value={p.progress} tone={p.progress >= 70 ? 'success' : p.progress >= 40 ? 'warning' : 'brand'} />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Upcoming meetings" subtitle="Next on your calendar" actions={<Link to="/meetings" className="text-xs font-medium text-fg-muted hover:text-fg">All →</Link>} />
          <CardBody className="p-0">
            {upcomingM.length === 0 ? (
              <EmptyState illustration={<EmptyInbox />} title="Nothing scheduled" description="Plan a team sync to keep everyone aligned." className="py-8" />
            ) : (
              <ul className="divide-y divide-border">
                {upcomingM.map((m) => (
                  <li key={m.id} className="px-5 py-3 hover:bg-surface-sunken/40 transition-colors">
                    <div className="text-[10px] uppercase tracking-wider text-fg-muted">{formatDate(m.meeting_date)}{m.start_time ? ` · ${m.start_time}` : ''}</div>
                    <div className="text-sm font-medium text-fg truncate mt-0.5">{m.title}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Two-up: trends + top performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Attendance trend" subtitle="Last 6 months across the org" />
          <CardBody>
            {trends?.length ? <TrendChart data={trends} height={220} /> : <EmptyState illustration={<EmptyChart />} title="No trend data yet" description="Trends will appear once you have a few months of records." className="py-6" />}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Top performers" subtitle="Highest average rating on a 1-10 scale" actions={<Link to="/analytics" className="text-xs font-medium text-fg-muted hover:text-fg">All →</Link>} />
          <CardBody className="p-0">
            {!topPerformers?.length ? (
              <EmptyState illustration={<EmptyStars />} title="No ratings yet" description="As your team gets rated, top performers will surface here." className="py-6" />
            ) : (
              <ul className="divide-y divide-border">
                {topPerformers.slice(0, 5).map((u, i) => {
                  const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`
                  return (
                    <li key={u.id} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-lg shrink-0">{medal}</span>
                      <Avatar user={u} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-fg truncate">{u.full_name || u.email}</p>
                        <p className="text-xs text-fg-muted truncate">{u.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <Stars value={u.avg_rating} max={10} size="xs" />
                        <p className="text-sm font-semibold text-fg tabular-nums mt-0.5">{Number(u.avg_rating).toFixed(1)}/10</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {/* AI insights + needs attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader
            title="AI insights"
            subtitle={insights?.provider ? `via ${insights.provider}${insights.latencyMs ? ` · ${insights.latencyMs}ms` : ''}` : 'Live, role-aware summary'}
            actions={<Link to="/assistant" className="text-xs font-medium text-fg-muted hover:text-fg">Ask AI →</Link>}
          />
          <CardBody>
            {insights?.answer ? (
              <div className="text-sm text-fg leading-relaxed whitespace-pre-line chat-markdown">{insights.answer}</div>
            ) : (
              <div className="text-sm text-fg-muted">Generating insights…</div>
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Needs attention" subtitle="Members with attendance below 60%" actions={<Link to="/team" className="text-xs font-medium text-fg-muted hover:text-fg">View team →</Link>} />
          <CardBody className="p-0">
            {lowAttendance.length === 0 ? (
              <EmptyState illustration={<span className="text-4xl">🎉</span>} title="Everyone's on track" description="All members are above 60% attendance this period." className="py-10" />
            ) : (
              <ul className="divide-y divide-border">
                {lowAttendance.map((m) => {
                  const pct = attendancePct(m)
                  return (
                    <li key={m.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-sunken/40">
                      <Avatar user={m} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-fg truncate">{m.full_name || m.email}</div>
                        <div className="text-xs text-fg-muted">{m.role}</div>
                      </div>
                      <div className="w-40">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-fg-muted">Attendance</span>
                          <span className="font-medium text-fg tabular-nums">{pct}%</span>
                        </div>
                        <Progress value={pct} tone={pct >= 60 ? 'warning' : 'danger'} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
//  Intern home
// ============================================================================
function InternHome({ user }) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const { data: stats } = useQuery({
    queryKey: ['internHome', user?.id, month, year],
    queryFn: async () => {
      const att = await api.get(`/attendance/${user.id}/stats?month=${month}&year=${year}`).then((r) => r.data).catch(() => [])
      const ratings = await api.get(`/ratings/${user.id}`).then((r) => r.data).catch(() => [])
      return { att, ratings }
    },
    enabled: !!user,
  })
  const { data: myTasks = [] } = useQuery({
    queryKey: ['myProjectTasks'],
    queryFn: () => api.get('/projects/me/tasks').then((r) => r.data).catch(() => []),
  })
  const { data: insights } = useQuery({
    queryKey: ['aiInsights'],
    queryFn: () => api.get('/ai/insights').then((r) => r.data).catch(() => null),
    staleTime: 5 * 60 * 1000,
  })
  const { data: myProjects = [] } = useQuery({
    queryKey: ['myProjects'],
    queryFn: () => api.get('/projects/me').then((r) => r.data).catch(() => []),
  })

  const att = stats?.att || []
  const ratings = stats?.ratings || []
  const avg = ratings.length ? (ratings.reduce((a, r) => a + r.score, 0) / ratings.length).toFixed(1) : '—'
  const statusCount = (s) => att.find((x) => x.status === s)?.count || 0
  const present = statusCount('PRESENT') + statusCount('WFH')
  const absent = statusCount('ABSENT')
  const halfDay = statusCount('HALF_DAY')
  const leave = statusCount('LEAVE') + statusCount('EXAM_LEAVE')
  const total = present + absent + halfDay + leave
  const presentPct = total > 0 ? Math.round((present / total) * 100) : null

  const attBreakdown = [
    { label: 'Present + WFH', value: present, color: '#10b981' },
    { label: 'Half day', value: halfDay, color: '#f59e0b' },
    { label: 'Leave / Exam', value: leave, color: '#3b82f6' },
    { label: 'Absent', value: absent, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <WelcomeHeader user={user} role="INTERN" />

      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-brand-500/8 pointer-events-none" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-float-blob" aria-hidden="true" />
        <CardBody className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-fg-muted tracking-wide uppercase">
              <span className={['w-1.5 h-1.5 rounded-full', presentPct === null ? 'bg-fg-muted' : presentPct >= 75 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'].join(' ')} />
              Your momentum · this month
            </div>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl font-semibold text-fg tabular-nums tracking-tight">{presentPct === null ? '—' : `${presentPct}%`}</span>
              <span className="text-sm text-fg-muted">attendance rate</span>
              <Badge tone={presentPct === null ? 'neutral' : presentPct >= 75 ? 'success' : presentPct >= 50 ? 'warning' : 'danger'} size="md" dot>
                {presentPct === null ? 'No data' : presentPct >= 75 ? 'Strong' : presentPct >= 50 ? 'Pick it up' : 'Needs focus'}
              </Badge>
            </div>
            <p className="text-sm text-fg-muted mt-2 max-w-2xl leading-relaxed">
              You logged <span className="font-medium text-fg">{present}</span> present + WFH days
              {absent > 0 && <>, <span className="font-medium text-fg">{absent}</span> absent</>}
              {halfDay > 0 && <>, <span className="font-medium text-fg">{halfDay}</span> half days</>}
              {leave > 0 && <>, <span className="font-medium text-fg">{leave}</span> leave</>}.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge size="sm" tone="success">{present} present + WFH</Badge>
              {halfDay > 0 && <Badge size="sm" tone="warning">{halfDay} half day</Badge>}
              {leave > 0 && <Badge size="sm" tone="info">{leave} leave / exam</Badge>}
              {absent > 0 && <Badge size="sm" tone="danger">{absent} absent</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <HeroStat label="Open tasks" value={myTasks.length} sub="assigned" />
            <HeroStat label="Projects" value={myProjects.length} sub="involved" />
            <HeroStat label="Avg rating" value={avg} sub="out of 10" />
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present this month" value={present} hint="incl. Work From Home" gradient="from-emerald-500 to-green-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>} />
        <StatCard label="Avg rating" value={avg} hint={`out of 10 · ${ratings.length} ratings`} gradient="from-amber-500 to-orange-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>} />
        <StatCard label="Attendance rate" value={presentPct === null ? '—' : `${presentPct}%`} hint="this month" gradient="from-brand-500 to-violet-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18M7 16l4-4 3 3 5-5" /></svg>}>
          <Sparkline values={Array(14).fill(0).map((_, i) => Math.round((presentPct ?? 80) + 6 * Math.sin(i / 2) + (i % 3) * 2 - 3))} width={88} height={24} />
        </StatCard>
        <StatCard label="Open tasks" value={myTasks.length} hint={`${myProjects.length} projects`} gradient="from-cyan-500 to-sky-500" icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="This month's attendance" />
          <CardBody>
            {att.length === 0 ? (
              <EmptyState illustration={<span className="text-4xl">📅</span>} title="No records yet" description="Your manager hasn't marked attendance for this month." className="py-10" />
            ) : (
              <Donut data={attBreakdown} size={150} thickness={18} centerLabel={presentPct ?? 0} centerSub="on time" />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="AI insights" subtitle={insights?.provider ? `via ${insights.provider}` : 'Personalized for you'} actions={<Link to="/assistant" className="text-xs font-medium text-fg-muted hover:text-fg">Ask AI →</Link>} />
          <CardBody>
            {insights?.answer ? <div className="text-sm text-fg leading-relaxed whitespace-pre-line chat-markdown">{insights.answer}</div> : <div className="text-sm text-fg-muted">Generating insights…</div>}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="My open tasks" actions={<Link to="/projects" className="text-xs font-medium text-fg-muted hover:text-fg">All projects →</Link>} />
        <CardBody className="p-0">
          {myTasks.length === 0 ? (
            <EmptyState icon="✨" title="All clear" description="You have no open project tasks right now." className="py-8" />
          ) : (
            <ul className="divide-y divide-border">
              {myTasks.map((t) => (
                <li key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-surface-sunken/40">
                  <div className={['shrink-0 w-2 h-2 rounded-full', t.priority === 'CRITICAL' ? 'bg-rose-500' : t.priority === 'HIGH' ? 'bg-amber-500' : 'bg-brand-500'].join(' ')} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-fg truncate">{t.title}</div>
                    <div className="text-xs text-fg-muted">{t.project_name}{t.due_date ? ` · due ${formatDate(t.due_date)}` : ''}</div>
                  </div>
                  <Badge size="sm" tone={t.status === 'DONE' ? 'success' : t.status === 'IN_PROGRESS' ? 'info' : t.status === 'BLOCKED' ? 'danger' : 'neutral'}>{t.status.replace('_', ' ')}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/tasks" className="group flex items-center gap-3 px-3 py-3 rounded-md border border-border bg-surface-base hover:bg-surface-sunken hover:border-border-strong transition-all">
          <span className="w-10 h-10 rounded-md bg-surface-sunken group-hover:bg-surface-raised group-hover:scale-110 flex items-center justify-center text-lg transition-all" aria-hidden="true">🎯</span>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-fg truncate">My tasks</span>
            <span className="block text-[11px] text-fg-muted truncate">Upload proofs</span>
          </div>
        </Link>
        <Link to="/attendance" className="group flex items-center gap-3 px-3 py-3 rounded-md border border-border bg-surface-base hover:bg-surface-sunken hover:border-border-strong transition-all">
          <span className="w-10 h-10 rounded-md bg-surface-sunken group-hover:bg-surface-raised group-hover:scale-110 flex items-center justify-center text-lg transition-all" aria-hidden="true">📅</span>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-fg truncate">My attendance</span>
            <span className="block text-[11px] text-fg-muted truncate">View records</span>
          </div>
        </Link>
        <Link to="/ratings" className="group flex items-center gap-3 px-3 py-3 rounded-md border border-border bg-surface-base hover:bg-surface-sunken hover:border-border-strong transition-all">
          <span className="w-10 h-10 rounded-md bg-surface-sunken group-hover:bg-surface-raised group-hover:scale-110 flex items-center justify-center text-lg transition-all" aria-hidden="true">⭐</span>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-fg truncate">My ratings</span>
            <span className="block text-[11px] text-fg-muted truncate">See feedback</span>
          </div>
        </Link>
        <Link to="/profile" className="group flex items-center gap-3 px-3 py-3 rounded-md border border-border bg-surface-base hover:bg-surface-sunken hover:border-border-strong transition-all">
          <span className="w-10 h-10 rounded-md bg-surface-sunken group-hover:bg-surface-raised group-hover:scale-110 flex items-center justify-center text-lg transition-all" aria-hidden="true">👤</span>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-fg truncate">My profile</span>
            <span className="block text-[11px] text-fg-muted truncate">Update details</span>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function Home() {
  const { user } = useAuthStore()
  const { data: me } = useQuery({ queryKey: ['myProfile'], queryFn: () => api.get('/users/me').then((r) => r.data) })
  const u = { ...user, fullName: me?.full_name || user?.fullName }
  return isManager(user?.role) ? <ManagerHome user={u} /> : <InternHome user={u} />
}
