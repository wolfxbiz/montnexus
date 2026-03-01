// Public endpoint — no auth required
// Called by the website contact form to auto-create leads in CRM
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, company, message, source = 'website_form' } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const { error } = await supabase.from('crm_leads').insert([{
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    company: company?.trim() || null,
    message: message?.trim() || null,
    source,
    status: 'new',
    updated_at: new Date().toISOString(),
  }]);

  if (error) {
    console.error('[crm-lead]', error.message);
    // Silent fail — don't block the user's contact form experience
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
