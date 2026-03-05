import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { useTeam } from '../../hooks/useTeam';
import { supabase } from '../../lib/supabase';

const ROLES = ['admin', 'crm_manager', 'content_manager'];
const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  crm_manager: 'CRM Manager',
  content_manager: 'Content Manager',
};

function RoleBadge({ role }) {
  const cls = {
    super_admin: 'crm-status--won',
    admin: 'crm-status--contacted',
    crm_manager: 'crm-status--new',
    content_manager: 'crm-status--qualified',
  }[role] || '';
  return (
    <span className={`crm-status-badge ${cls}`}>{ROLE_LABELS[role] || role}</span>
  );
}

function StatusBadge({ status, userId }) {
  if (!userId) return <span className="crm-status-badge crm-status--draft">Pending</span>;
  if (status === 'suspended') return <span className="crm-status-badge crm-status--lost">Suspended</span>;
  return <span className="crm-status-badge crm-status--won">Active</span>;
}

export default function TeamManagement() {
  const { user } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useRole();
  const { members, loading, error, fetchMembers, inviteMember, updateMember } = useTeam();

  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'admin' });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [changingRole, setChangingRole] = useState(null); // memberId being edited

  useEffect(() => { fetchMembers(); }, []);

  // Redirect non-super-admins
  if (!roleLoading && !isSuperAdmin) return <Navigate to="/admin/posts" replace />;

  async function handleInvite(e) {
    e.preventDefault();
    setInviting(true); setInviteError(''); setInviteSuccess('');
    try {
      // Get current session token to send with request
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type: 'invite', ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInviteSuccess(`Invitation sent to ${form.email}`);
      setForm({ email: '', name: '', role: 'admin' });
      setShowInvite(false);
      fetchMembers();
    } catch (err) {
      setInviteError(err.message);
    }
    setInviting(false);
  }

  async function handleAction(memberId, action, role = null) {
    setActionError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type: 'update', memberId, action, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChangingRole(null);
      fetchMembers();
    } catch (err) {
      setActionError(err.message);
    }
  }

  const isSelf = (member) => member.user_id === user?.id;

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar__title">Team Management</h1>
        <button
          className="admin-btn-primary"
          onClick={() => { setShowInvite(!showInvite); setInviteError(''); setInviteSuccess(''); }}
        >
          {showInvite ? '✕ Cancel' : '+ Invite Member'}
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="admin-editor-panel" style={{ marginBottom: 20 }}>
          <div className="admin-editor-panel__title">Invite a New Team Member</div>
          {inviteError && <div className="admin-error">{inviteError}</div>}
          <form onSubmit={handleInvite}>
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Full Name</label>
                <input
                  className="admin-input"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Email Address *</label>
                <input
                  className="admin-input"
                  type="email"
                  required
                  placeholder="team@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">Role *</label>
                <select
                  className="admin-select"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Role descriptions */}
            <div className="team-role-guide">
              {form.role === 'admin' && (
                <p className="team-role-desc">
                  <strong>Admin</strong> — Full access to Blog, Pages, CRM, and Settings. Cannot manage the team.
                </p>
              )}
              {form.role === 'crm_manager' && (
                <p className="team-role-desc">
                  <strong>CRM Manager</strong> — Access to Leads, Clients, Proposals, Invoices, and Campaigns only.
                </p>
              )}
              {form.role === 'content_manager' && (
                <p className="team-role-desc">
                  <strong>Content Manager</strong> — Access to Blog Posts, Pages, and Social Media only.
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" className="admin-btn-primary" disabled={inviting}>
                {inviting ? 'Sending Invite…' : 'Send Invite Email'}
              </button>
              <button type="button" className="admin-btn-secondary" onClick={() => setShowInvite(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {inviteSuccess && (
        <div style={{ background: 'rgba(146,209,8,0.1)', border: '1px solid rgba(146,209,8,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>
          ✓ {inviteSuccess}
        </div>
      )}

      {actionError && <div className="admin-error">{actionError}</div>}

      {/* Members table */}
      <div className="admin-editor-panel">
        <div className="admin-editor-panel__title">
          Team Members ({members.length})
        </div>

        {loading ? (
          <div className="admin-spinner" />
        ) : members.length === 0 ? (
          <div className="crm-empty-state">
            <svg className="crm-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
            </svg>
            <p className="crm-empty-state__text">No team members yet.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} style={isSelf(member) ? { background: 'var(--admin-active-bg)' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="team-avatar">
                          {(member.name || member.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="admin-table-title" style={{ marginBottom: 2 }}>
                            {member.name || '—'}
                            {isSelf(member) && (
                              <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, marginLeft: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>You</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{member.email}</td>
                    <td>
                      {changingRole === member.id && !isSelf(member) ? (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <select
                            className="admin-select"
                            defaultValue={member.role}
                            style={{ padding: '4px 8px', fontSize: 12 }}
                            onChange={e => handleAction(member.id, 'update_role', e.target.value)}
                          >
                            {['admin', 'crm_manager', 'content_manager'].map(r => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                          <button
                            className="admin-action-btn"
                            style={{ fontSize: 11 }}
                            onClick={() => setChangingRole(null)}
                          >Cancel</button>
                        </div>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    <td>
                      <StatusBadge status={member.status} userId={member.user_id} />
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {new Date(member.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      {isSelf(member) ? (
                        <span style={{ fontSize: 12, color: 'var(--admin-text-ghost)' }}>—</span>
                      ) : (
                        <div className="admin-table-actions">
                          {member.role !== 'super_admin' && (
                            <button
                              className="admin-action-btn"
                              onClick={() => setChangingRole(changingRole === member.id ? null : member.id)}
                            >
                              Change Role
                            </button>
                          )}
                          {member.status === 'active' ? (
                            <button
                              className="admin-action-btn admin-action-btn--danger"
                              onClick={() => {
                                if (confirm(`Suspend ${member.name || member.email}? They will lose admin access immediately.`))
                                  handleAction(member.id, 'suspend');
                              }}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              className="admin-action-btn"
                              onClick={() => handleAction(member.id, 'unsuspend')}
                            >
                              Restore
                            </button>
                          )}
                          <button
                            className="admin-action-btn admin-action-btn--danger"
                            onClick={() => {
                              if (confirm(`Remove ${member.name || member.email} from the team? They will lose all access.`))
                                handleAction(member.id, 'remove');
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role legend */}
      <div className="admin-editor-panel" style={{ marginTop: 20 }}>
        <div className="admin-editor-panel__title">Role Permissions</div>
        <div className="team-role-grid">
          {[
            { role: 'super_admin', label: 'Super Admin', access: 'Full access — Blog, Pages, CRM, Settings, Team Management. Can invite and manage all team members.' },
            { role: 'admin', label: 'Admin', access: 'Blog, Pages, CRM, Settings. Cannot manage the team or invite members.' },
            { role: 'crm_manager', label: 'CRM Manager', access: 'Leads, Clients, Proposals, Invoices, Campaigns only.' },
            { role: 'content_manager', label: 'Content Manager', access: 'Blog Posts, Pages, Social Media only.' },
          ].map(({ role, label, access }) => (
            <div key={role} className="team-role-card">
              <RoleBadge role={role} />
              <p style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 8, lineHeight: 1.5 }}>{access}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
