import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import useAuthStore from '../store/auth';
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Drawer,
  EmptyState,
  Input,
  Progress,
  Select,
  Skeleton,
  StatCard,
  Stars,
  Spinner,
  Textarea,
  toast,
  ConfirmDialog,
} from '../components/ui';
import {
  ATTENDANCE_LABEL,
  INTERNSHIP_BADGE,
  INTERNSHIP_STATUS,
  ROLE_BADGE,
  ROLE_LABEL,
  ASSIGNABLE_ROLES,
  rolesBelow,
  isManager,
} from '../lib/constants';
import {
  attendancePct,
  pctColor,
  initialsOf,
  fullName,
  pickDefined,
  formatDate,
} from '../lib/format';
import { downloadCsv } from '../lib/download';
import { useFlash } from '../lib/useFlash';
import { Heatmap } from '../components/charts';
import { EmptyTeam, EmptySearch } from '../components/illustrations';

const STATUS_OPTIONS = Object.values(INTERNSHIP_STATUS);
const STATUS_BADGE = INTERNSHIP_BADGE;

const EDIT_FIELDS = [
  { key: 'full_name', label: 'Full name' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'City / Location' },
  { key: 'college', label: 'College' },
  { key: 'course', label: 'Course' },
  { key: 'year_of_study', label: 'Year of study' },
  { key: 'position', label: 'Position / Designation' },
  { key: 'joining_date', label: 'Joining date', type: 'date' },
  { key: 'internship_status', label: 'Status', type: 'select' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-fg-muted mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function AddMemberModal({ onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canAssign = rolesBelow(user?.role);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: canAssign[0] || 'INTERN',
    password: '',
  });
  const [error, setError] = useState('');
  const { message, flash, flashError } = useFlash(2500);

  const createMut = useMutation({
    mutationFn: (data) => api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      flash('Member added');
      onClose();
    },
    onError: (err) => {
      const e = err.response?.data?.error || 'Failed to add member';
      setError(e);
      flashError(e);
    },
  });

  return (
    <Drawer
      open
      onClose={onClose}
      title="Add team member"
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => createMut.mutate(form)}
            loading={createMut.isPending}
            disabled={!form.email || !form.full_name || !form.password}
          >
            Add member
          </Button>
        </>
      }
    >
      <div className="p-5 space-y-4">
        {message && <Banner kind="success">{message}</Banner>}
        {error && <Banner kind="error">{error}</Banner>}
        <Input
          label="Full name"
          required
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Select
          label="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          {canAssign.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABEL[r] || r}
            </option>
          ))}
        </Select>
        <Input
          label="Temp password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          hint="Min 8 characters. They can change it after sign-in."
        />
      </div>
    </Drawer>
  );
}

function HistorySection({ memberId }) {
  const { data: att = [] } = useQuery({
    queryKey: ['att', memberId],
    queryFn: () => api.get(`/attendance/${memberId}`).then((r) => r.data),
  });
  const { data: rat = [] } = useQuery({
    queryKey: ['rat', memberId],
    queryFn: () => api.get(`/ratings/${memberId}`).then((r) => r.data),
  });

  // 6-week heatmap of recent attendance
  const heatmap = (() => {
    const cells = [];
    const today = new Date();
    for (let w = 5; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() - (w * 7 + (6 - d)));
        const dateStr = dt.toISOString().slice(0, 10);
        const r = att.find((x) => x.date === dateStr);
        cells.push({
          row: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d],
          col: `W${6 - w}`,
          date: dateStr,
          value: r
            ? r.status === 'PRESENT'
              ? 100
              : r.status === 'HALF_DAY'
                ? 50
                : 0
            : null,
        });
      }
    }
    return cells;
  })();
  const cols = Array.from({ length: 6 }, (_, i) => `W${i + 1}`);

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-2">
          Last 6 weeks
        </h4>
        {att.length === 0 ? (
          <p className="text-sm text-fg-muted">No records.</p>
        ) : (
          <Heatmap
            cells={heatmap}
            rows={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            cols={cols}
            valueKey="value"
          />
        )}
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-2">
          Recent attendance
        </h4>
        {att.length === 0 ? (
          <p className="text-sm text-fg-muted">No records.</p>
        ) : (
          <ul className="divide-y divide-border max-h-48 overflow-auto">
            {att.slice(0, 8).map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-fg tabular-nums">
                  {formatDate(a.date)}
                </span>
                <Badge
                  size="sm"
                  tone={
                    a.status === 'PRESENT'
                      ? 'success'
                      : a.status === 'ABSENT'
                        ? 'danger'
                        : 'warning'
                  }
                  dot
                >
                  {ATTENDANCE_LABEL[a.status] || a.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-muted mb-2">
          Ratings
        </h4>
        {rat.length === 0 ? (
          <p className="text-sm text-fg-muted">No ratings yet.</p>
        ) : (
          <ul className="space-y-2">
            {rat.slice(0, 6).map((r) => (
              <li key={r.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Stars value={r.score} max={10} size="xs" />
                    <span className="text-xs font-semibold text-fg tabular-nums">
                      {r.score}/10
                    </span>
                  </div>
                  <span className="text-xs text-fg-muted tabular-nums">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                {r.remarks && (
                  <p className="text-sm text-fg-muted">"{r.remarks}"</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function MemberDetail({ memberId, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [edit, setEdit] = useState(false);
  const [tab, setTab] = useState('details');
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const { message, error, flash, flashError } = useFlash(2500);

  const { data: member, isLoading } = useQuery({
    queryKey: ['teamMember', memberId],
    queryFn: () => api.get(`/team/members/${memberId}`).then((res) => res.data),
  });

  useEffect(() => {
    if (!member) return;
    setForm({
      memberId: member.id,
      full_name: member.full_name || '',
      phone: member.phone || '',
      location: member.location || '',
      college: member.college || '',
      course: member.course || '',
      year_of_study: member.year_of_study || '',
      position: member.position || '',
      joining_date: member.joining_date ? member.joining_date.slice(0, 10) : '',
      internship_status: member.internship_status || 'ACTIVE',
      notes: member.notes || '',
    });
  }, [member?.id]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['teamMember', memberId] });
    queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
  };

  const saveMut = useMutation({
    mutationFn: (data) => api.patch(`/team/members/${memberId}`, data),
    onSuccess: () => {
      flash('Saved successfully');
      setEdit(false);
      invalidate();
    },
    onError: (err) => flashError(err.response?.data?.error || 'Save failed'),
  });
  const statusMut = useMutation({
    mutationFn: (suspended) =>
      api.patch(`/team/members/${memberId}/status`, { suspended }),
    onSuccess: () => {
      invalidate();
      flash(member?.suspended ? 'Account reactivated' : 'Account suspended');
      setConfirmSuspend(false);
    },
    onError: (err) => {
      flashError(err.response?.data?.error || 'Failed');
      setConfirmSuspend(false);
    },
  });

  const pct = member ? attendancePct(member) : null;
  const TABS = [
    { value: 'details', label: 'Details' },
    { value: 'history', label: 'History' },
  ];

  return (
    <Drawer
      open
      onClose={onClose}
      title={member?.full_name || member?.email || 'Member'}
      width="max-w-md"
    >
      {isLoading || !member || !form ? (
        <div className="p-6">
          <Spinner label="Loading member..." />
        </div>
      ) : (
        <div>
          {/* Hero */}
          <div className="bg-gradient-to-br from-fg to-fg/90 text-fg-inverse p-5 -m-px">
            <div className="flex items-center gap-3">
              <Avatar
                user={member}
                size="lg"
                status={member.suspended ? 'busy' : 'online'}
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold truncate">
                  {member.full_name || member.email}
                </h3>
                <p className="text-xs text-fg-inverse/70 truncate">
                  {member.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge
                    size="sm"
                    tone={
                      member.role === 'ADMIN'
                        ? 'danger'
                        : member.role === 'SENIOR_TL'
                          ? 'info'
                          : member.role === 'TL'
                            ? 'brand'
                            : member.role === 'CAPTAIN'
                              ? 'success'
                              : 'neutral'
                    }
                    dot
                  >
                    {ROLE_LABEL[member.role] || member.role}
                  </Badge>
                  {member.suspended && (
                    <Badge size="sm" tone="danger" dot>
                      Suspended
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {message && <Banner kind="success">{message}</Banner>}
            {error && <Banner kind="error">{error}</Banner>}

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md border border-border bg-surface-base p-3 text-center">
                <p className="text-base font-semibold text-fg tabular-nums">
                  {pct === null ? '—' : `${pct}%`}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted mt-0.5">
                  Attendance
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-base p-3 text-center">
                <p className="text-base font-semibold text-fg flex items-center justify-center gap-1">
                  <Stars value={member.avg_rating} max={10} size="xs" />
                </p>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted mt-0.5">
                  {member.rating_count} ratings
                </p>
              </div>
              <div className="rounded-md border border-border bg-surface-base p-3 text-center">
                <p className="text-base font-semibold text-fg tabular-nums">
                  {member.verified_tasks}/{member.total_tasks}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-fg-muted mt-0.5">
                  Tasks done
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div
              className="flex items-center gap-1 border-b border-border"
              role="tablist"
            >
              {TABS.map((t) => (
                <button
                  key={t.value}
                  role="tab"
                  aria-selected={tab === t.value}
                  data-active={tab === t.value}
                  onClick={() => setTab(t.value)}
                  className={[
                    'tab-indicator relative px-3 py-2 text-sm font-medium transition-colors',
                    tab === t.value ? 'text-fg' : 'text-fg-muted hover:text-fg',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'history' ? (
              <HistorySection memberId={memberId} />
            ) : !edit ? (
              <Card>
                <CardHeader
                  title="Details"
                  actions={
                    !edit && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setEdit(true)}
                      >
                        Edit
                      </Button>
                    )
                  }
                />
                <CardBody className="space-y-2.5">
                  <Detail label="Reports to" value={member.manager_name} />
                  <Detail label="Department" value={member.department_name} />
                  <Detail label="Phone" value={member.phone} />
                  <Detail label="Location" value={member.location} />
                  <Detail label="College" value={member.college} />
                  <Detail label="Course" value={member.course} />
                  <Detail label="Year" value={member.year_of_study} />
                  <Detail label="Position" value={member.position} />
                  <Detail
                    label="Joining date"
                    value={formatDate(member.joining_date)}
                  />
                  <Detail
                    label="Status"
                    value={
                      <Badge
                        size="sm"
                        tone={
                          STATUS_BADGE[member.internship_status] ===
                          STATUS_BADGE.ACTIVE
                            ? 'success'
                            : STATUS_BADGE[member.internship_status] ===
                                STATUS_BADGE.COMPLETED
                              ? 'info'
                              : STATUS_BADGE[member.internship_status] ===
                                  STATUS_BADGE.ON_HOLD
                                ? 'warning'
                                : 'danger'
                        }
                      >
                        {member.internship_status || 'ACTIVE'}
                      </Badge>
                    }
                  />
                  <Detail
                    label="Account"
                    value={
                      member.suspended ? (
                        <Badge size="sm" tone="danger" dot>
                          Suspended
                        </Badge>
                      ) : (
                        <Badge size="sm" tone="success" dot>
                          Active
                        </Badge>
                      )
                    }
                  />
                  <Detail label="Notes" value={member.notes} />
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardHeader title="Edit details" />
                <CardBody className="space-y-3">
                  {EDIT_FIELDS.map((f) => (
                    <div key={f.key}>
                      {f.type === 'textarea' ? (
                        <Textarea
                          label={f.label}
                          rows={3}
                          value={form[f.key]}
                          onChange={(e) =>
                            setForm({ ...form, [f.key]: e.target.value })
                          }
                        />
                      ) : f.type === 'select' ? (
                        <Select
                          label={f.label}
                          value={form[f.key]}
                          onChange={(e) =>
                            setForm({ ...form, [f.key]: e.target.value })
                          }
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          label={f.label}
                          type={f.type || 'text'}
                          value={form[f.key]}
                          onChange={(e) =>
                            setForm({ ...form, [f.key]: e.target.value })
                          }
                        />
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => saveMut.mutate(form)}
                      loading={saveMut.isPending}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button variant="secondary" onClick={() => setEdit(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            <Button
              variant={member.suspended ? 'primary' : 'danger'}
              onClick={() => setConfirmSuspend(true)}
              loading={statusMut.isPending}
              className="w-full"
            >
              {member.suspended ? 'Reactivate account' : 'Suspend account'}
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmSuspend}
        title={
          member?.suspended
            ? 'Reactivate this account?'
            : 'Suspend this account?'
        }
        message={
          member?.suspended
            ? 'They will regain access on next login.'
            : 'They will be signed out and unable to log in until reactivated.'
        }
        confirmLabel={member?.suspended ? 'Reactivate' : 'Suspend'}
        danger={!member?.suspended}
        onConfirm={() => statusMut.mutate(!member?.suspended)}
        onClose={() => setConfirmSuspend(false)}
      />
    </Drawer>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm py-1.5 border-b border-border last:border-0">
      <span className="text-fg-muted text-xs shrink-0 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-fg text-right break-words">
        {value || <span className="text-fg-subtle">—</span>}
      </span>
    </div>
  );
}

export default function Team() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [view, setView] = useState('table');
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const { user } = useAuthStore();
  const canAdd = rolesBelow(user?.role).length > 0;

  const {
    data: members = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: () => api.get('/team/members').then((res) => res.data),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter && m.role !== roleFilter) return false;
      if (!q) return true;
      return [m.full_name, m.email, m.college, m.position].some((v) =>
        (v || '').toLowerCase().includes(q)
      );
    });
  }, [members, search, roleFilter]);

  const roles = useMemo(
    () => [...new Set(members.map((m) => m.role))],
    [members]
  );
  const stats = useMemo(() => {
    const active = members.filter(
      (m) => !m.suspended && (m.internship_status || 'ACTIVE') === 'ACTIVE'
    ).length;
    const pcts = members.map(attendancePct).filter((p) => p !== null);
    const avgAtt = pcts.length
      ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
      : null;
    const ratings = members
      .map((m) => m.avg_rating)
      .filter((r) => r != null)
      .map(Number);
    const avgRating = ratings.length
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;
    return { active, avgAtt, avgRating };
  }, [members]);

  const exportCsv = () =>
    downloadCsv('/team/members/export', 'team-members.csv');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }
  if (error)
    return (
      <Banner kind="error">
        {error.response?.data?.error || 'Failed to load team'}
      </Banner>
    );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            My Team
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Members in your direct hierarchy and their performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            leftIcon={
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            }
            onClick={exportCsv}
          >
            Export CSV
          </Button>
          {canAdd && (
            <Button
              variant="primary"
              leftIcon={
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              }
              onClick={() => setAdding(true)}
            >
              Add member
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total members"
          value={members.length}
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          }
          gradient="from-brand-500 to-violet-500"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          }
          gradient="from-emerald-500 to-teal-500"
        />
        <StatCard
          label="Avg attendance"
          value={stats.avgAtt === null ? '—' : `${stats.avgAtt}%`}
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          }
          gradient="from-sky-500 to-cyan-500"
        />
        <StatCard
          label="Avg rating"
          value={stats.avgRating ?? '—'}
          sub="out of 10"
          icon={
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          }
          gradient="from-amber-500 to-orange-500"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="flex flex-wrap items-center gap-2 !py-3">
          <div className="relative flex-1 min-w-[240px]">
            <Input
              placeholder="Search by name, email, college, position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              }
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-auto min-w-[140px]"
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r] || r}
              </option>
            ))}
          </Select>
          <div className="inline-flex rounded-md border border-border p-0.5 bg-surface-sunken">
            <button
              onClick={() => setView('table')}
              className={[
                'px-3 h-8 rounded text-xs font-medium transition-colors',
                view === 'table'
                  ? 'bg-surface-raised text-fg shadow-xs'
                  : 'text-fg-muted hover:text-fg',
              ].join(' ')}
            >
              Table
            </button>
            <button
              onClick={() => setView('cards')}
              className={[
                'px-3 h-8 rounded text-xs font-medium transition-colors',
                view === 'cards'
                  ? 'bg-surface-raised text-fg shadow-xs'
                  : 'text-fg-muted hover:text-fg',
              ].join(' ')}
            >
              Cards
            </button>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          illustration={members.length === 0 ? <EmptyTeam /> : <EmptySearch />}
          title={members.length === 0 ? 'No team members yet' : 'No matches'}
          description={
            members.length === 0
              ? 'Click "Add member" to start building your team.'
              : 'Try a different search or role filter.'
          }
          action={
            canAdd && (
              <Button
                variant="primary"
                onClick={() => setAdding(true)}
                leftIcon={
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                }
              >
                Add member
              </Button>
            )
          }
        />
      ) : view === 'table' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-sunken text-fg-muted">
                <tr>
                  {[
                    'Member',
                    'Role',
                    'Department',
                    'Phone',
                    'Attendance',
                    'Rating',
                    'Tasks',
                    'Status',
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={[
                        'text-left font-medium text-xs uppercase tracking-wider px-4 py-2.5',
                        h === 'Attendance' ? 'min-w-[160px]' : '',
                      ].join(' ')}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m) => {
                  const pct = attendancePct(m);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelected(m.id)}
                      className="hover:bg-surface-sunken/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={m} size="sm" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-fg truncate">
                              {m.full_name || '—'}
                            </div>
                            <div className="text-xs text-fg-muted truncate">
                              {m.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          size="sm"
                          tone={
                            m.role === 'ADMIN'
                              ? 'danger'
                              : m.role === 'SENIOR_TL'
                                ? 'info'
                                : m.role === 'TL'
                                  ? 'brand'
                                  : m.role === 'CAPTAIN'
                                    ? 'success'
                                    : 'neutral'
                          }
                        >
                          {ROLE_LABEL[m.role] || m.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-fg-muted">
                        {m.department_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-fg-muted tabular-nums">
                        {m.phone || '—'}
                      </td>
                      <td className="px-4 py-3">
                        {pct === null ? (
                          <span className="text-xs text-fg-subtle">
                            No data
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-20">
                              <Progress
                                value={pct}
                                tone={
                                  pct >= 85
                                    ? 'success'
                                    : pct >= 60
                                      ? 'warning'
                                      : 'danger'
                                }
                              />
                            </div>
                            <span className="text-xs font-medium text-fg w-9 tabular-nums">
                              {pct}%
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Stars value={m.avg_rating} max={10} size="xs" />
                          <span className="text-xs font-medium text-fg tabular-nums">
                            {m.avg_rating
                              ? `${Number(m.avg_rating).toFixed(1)}/10`
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-fg-muted tabular-nums">
                        {m.verified_tasks}/{m.total_tasks}
                      </td>
                      <td className="px-4 py-3">
                        {m.suspended ? (
                          <Badge size="sm" tone="danger" dot>
                            Suspended
                          </Badge>
                        ) : (
                          <Badge
                            size="sm"
                            tone={
                              m.internship_status === 'ACTIVE'
                                ? 'success'
                                : m.internship_status === 'COMPLETED'
                                  ? 'info'
                                  : m.internship_status === 'ON_HOLD'
                                    ? 'warning'
                                    : 'danger'
                            }
                            dot
                          >
                            {m.internship_status || 'ACTIVE'}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const pct = attendancePct(m);
            return (
              <Card
                key={m.id}
                className="p-4 lift cursor-pointer"
                onClick={() => setSelected(m.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar user={m} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-fg truncate">
                      {m.full_name || m.email}
                    </div>
                    <Badge
                      size="sm"
                      tone={
                        m.role === 'ADMIN'
                          ? 'danger'
                          : m.role === 'SENIOR_TL'
                            ? 'info'
                            : m.role === 'TL'
                              ? 'brand'
                              : m.role === 'CAPTAIN'
                                ? 'success'
                                : 'neutral'
                      }
                    >
                      {ROLE_LABEL[m.role] || m.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-fg-muted mb-3">
                  <p>📞 {m.phone || '—'}</p>
                  <p>🎓 {m.college || '—'}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-fg-muted border-t border-border pt-3">
                  <span>
                    Att:{' '}
                    <b className="text-fg">{pct === null ? '—' : `${pct}%`}</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Stars value={m.avg_rating} max={10} size="xs" />
                    <b className="text-fg">
                      {m.avg_rating
                        ? `${Number(m.avg_rating).toFixed(1)}/10`
                        : '—'}
                    </b>
                  </span>
                  <span>
                    Tasks:{' '}
                    <b className="text-fg">
                      {m.verified_tasks}/{m.total_tasks}
                    </b>
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selected && (
        <MemberDetail memberId={selected} onClose={() => setSelected(null)} />
      )}
      {adding && <AddMemberModal onClose={() => setAdding(false)} />}
    </div>
  );
}
