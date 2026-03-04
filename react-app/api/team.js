import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_ROLES = ['super_admin', 'admin', 'crm_manager', 'content_manager'];
const VALID_ACTIONS = ['update_role', 'suspend', 'unsuspend', 'remove'];

async function verifyCallerIsSuperAdmin(token) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return { error: 'Invalid token', status: 401 };

  const { data: caller } = await supabaseAdmin
    .from('team_members')
    .select('role, status')
    .eq('user_id', user.id)
    .single();

  if (caller?.role !== 'super_admin' || caller?.status !== 'active') {
    return { error: 'Only super admins can manage team members', status: 403 };
  }

  return { user };
}

async function handleInvite(req, res, user) {
  const { email, name, role } = req.body;

  if (!email || !role) return res.status(400).json({ error: 'email and role are required' });
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const { data: existing } = await supabaseAdmin
    .from('team_members')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) return res.status(409).json({ error: 'A team member with this email already exists' });

  const { error: insertErr } = await supabaseAdmin
    .from('team_members')
    .insert({
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      role,
      status: 'active',
      invited_by: user.id,
    });

  if (insertErr) return res.status(500).json({ error: insertErr.message });

  const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email.toLowerCase().trim(),
    {
      data: { name: name?.trim() || '', role },
      redirectTo: `${process.env.VITE_SITE_URL || 'https://montnexus.com'}/admin/login`,
    }
  );

  if (inviteErr) {
    await supabaseAdmin.from('team_members').delete().eq('email', email.toLowerCase().trim());
    return res.status(500).json({ error: inviteErr.message });
  }

  return res.status(200).json({ success: true, email });
}

async function handleUpdate(req, res, user) {
  const { memberId, action, role } = req.body;

  if (!memberId || !VALID_ACTIONS.includes(action)) {
    return res.status(400).json({ error: 'memberId and valid action are required' });
  }

  const { data: target } = await supabaseAdmin
    .from('team_members')
    .select('id, user_id, role')
    .eq('id', memberId)
    .single();

  if (!target) return res.status(404).json({ error: 'Member not found' });

  if (target.user_id === user.id) {
    return res.status(400).json({ error: 'You cannot modify your own account' });
  }

  switch (action) {
    case 'update_role':
      if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
      await supabaseAdmin.from('team_members').update({ role }).eq('id', memberId);
      break;
    case 'suspend':
      await supabaseAdmin.from('team_members').update({ status: 'suspended' }).eq('id', memberId);
      break;
    case 'unsuspend':
      await supabaseAdmin.from('team_members').update({ status: 'active' }).eq('id', memberId);
      break;
    case 'remove':
      await supabaseAdmin.from('team_members').delete().eq('id', memberId);
      break;
  }

  return res.status(200).json({ success: true, action });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.slice(7);

  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'type is required (invite or update)' });

  const { user, error, status } = await verifyCallerIsSuperAdmin(token);
  if (error) return res.status(status).json({ error });

  if (type === 'invite') return handleInvite(req, res, user);
  if (type === 'update') return handleUpdate(req, res, user);

  return res.status(400).json({ error: 'Invalid type. Use invite or update.' });
}
