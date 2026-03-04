import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VALID_ROLES = ['super_admin', 'admin', 'crm_manager', 'content_manager'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Verify caller is authenticated
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);

  // Verify caller's JWT and get their user_id
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  // Check caller is super_admin
  const { data: caller } = await supabaseAdmin
    .from('team_members')
    .select('role, status')
    .eq('user_id', user.id)
    .single();

  if (caller?.role !== 'super_admin' || caller?.status !== 'active') {
    return res.status(403).json({ error: 'Only super admins can invite team members' });
  }

  const { email, name, role } = req.body;

  if (!email || !role) return res.status(400).json({ error: 'email and role are required' });
  if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });

  // Check if already exists
  const { data: existing } = await supabaseAdmin
    .from('team_members')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) return res.status(409).json({ error: 'A team member with this email already exists' });

  // Insert into team_members first (trigger will link user_id on accept)
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

  // Send Supabase invite email
  const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email.toLowerCase().trim(),
    {
      data: { name: name?.trim() || '', role },
      redirectTo: `${process.env.VITE_SITE_URL || 'https://montnexus.com'}/admin/login`,
    }
  );

  if (inviteErr) {
    // Clean up the team_members row if invite failed
    await supabaseAdmin.from('team_members').delete().eq('email', email.toLowerCase().trim());
    return res.status(500).json({ error: inviteErr.message });
  }

  return res.status(200).json({ success: true, email });
}
