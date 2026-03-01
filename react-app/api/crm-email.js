// Server-side SMTP email sending for CRM
// Actions: send_proposal | send_invoice | send_campaign | send_test
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = process.env.SMTP_FROM || `Montnexus <${process.env.SMTP_USER}>`;

// ── HTML email wrapper ─────────────────────────────────────────────────────
function emailWrapper(title, body) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin:0; padding:0; background:#f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
  .wrap { max-width:640px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 16px rgba(0,0,0,0.08); }
  .header { background:#111111; padding:32px 40px; }
  .header-brand { font-size:22px; font-weight:800; color:#92D108; letter-spacing:-0.02em; }
  .header-sub { font-size:13px; color:rgba(255,255,255,0.45); margin-top:4px; }
  .body { padding:40px; color:#202020; line-height:1.6; }
  .title { font-size:24px; font-weight:700; color:#111; margin:0 0 20px; }
  .content { font-size:15px; color:#3f3f46; }
  .content p { margin:0 0 14px; }
  .divider { border:none; border-top:1px solid #e4e4e7; margin:28px 0; }
  .footer { background:#f9f9f9; border-top:1px solid #e4e4e7; padding:20px 40px; font-size:12px; color:#71717a; }
  .btn { display:inline-block; background:#92D108; color:#111; font-weight:700; font-size:14px; padding:12px 28px; border-radius:6px; text-decoration:none; margin:16px 0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-brand">Montnexus</div>
    <div class="header-sub">${title}</div>
  </div>
  <div class="body">
    ${body}
  </div>
  <div class="footer">
    © ${new Date().getFullYear()} Montnexus. All rights reserved. · <a href="https://montnexus.com" style="color:#92D108;">montnexus.com</a>
  </div>
</div>
</body>
</html>`;
}

// ── Proposal email ─────────────────────────────────────────────────────────
async function sendProposal({ proposalId }) {
  const { data: proposal, error } = await supabase
    .from('crm_proposals')
    .select('*, crm_leads(name, email), crm_clients(name, email)')
    .eq('id', proposalId)
    .single();

  if (error || !proposal) throw new Error('Proposal not found');

  const recipient = proposal.crm_clients || proposal.crm_leads;
  if (!recipient?.email) throw new Error('No recipient email on this proposal');

  const currencySymbols = { INR: '₹', AED: 'AED', USD: '$', EUR: '€' };
  const symbol = currencySymbols[proposal.currency] || proposal.currency;

  const body = `
    <p class="title">${proposal.title}</p>
    <div class="content">
      ${proposal.content}
    </div>
    ${proposal.total_value ? `<hr class="divider"><p><strong>Total Value:</strong> ${symbol}${Number(proposal.total_value).toLocaleString()}</p>` : ''}
    ${proposal.valid_until ? `<p><strong>Valid Until:</strong> ${new Date(proposal.valid_until).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>` : ''}
    <hr class="divider">
    <p>To accept this proposal or discuss further, please reply to this email.</p>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: `${recipient.name} <${recipient.email}>`,
    subject: `Proposal: ${proposal.title}`,
    html: emailWrapper('Project Proposal', body),
  });

  await supabase.from('crm_proposals').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', proposalId);
  return { sent: true, to: recipient.email };
}

// ── Invoice email ──────────────────────────────────────────────────────────
async function sendInvoice({ invoiceId }) {
  const { data: invoice, error } = await supabase
    .from('crm_invoices')
    .select('*, crm_clients(*)')
    .eq('id', invoiceId)
    .single();

  if (error || !invoice) throw new Error('Invoice not found');
  if (!invoice.crm_clients?.email) throw new Error('No client email on this invoice');

  const client = invoice.crm_clients;
  const currencySymbols = { INR: '₹', AED: 'AED', USD: '$', EUR: '€' };
  const symbol = currencySymbols[invoice.currency] || invoice.currency;
  const fmt = (n) => `${symbol}${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const lineItemsHtml = (invoice.line_items || []).map(item => `
    <tr style="border-bottom:1px solid #e4e4e7;">
      <td style="padding:10px 0;">${item.description}</td>
      <td style="padding:10px;text-align:center;">${item.qty}</td>
      <td style="padding:10px;text-align:right;">${fmt(item.rate)}</td>
      <td style="padding:10px;text-align:right;">${fmt(item.amount)}</td>
    </tr>
  `).join('');

  const body = `
    <p class="title">Invoice ${invoice.invoice_number}</p>
    <p><strong>Bill To:</strong> ${client.name}${client.company ? ` — ${client.company}` : ''}</p>
    ${invoice.due_date ? `<p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>` : ''}
    <hr class="divider">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <thead>
        <tr style="background:#f4f4f5;font-size:12px;color:#71717a;text-transform:uppercase;">
          <th style="padding:10px 0;text-align:left;">Description</th>
          <th style="padding:10px;text-align:center;">Qty</th>
          <th style="padding:10px;text-align:right;">Rate</th>
          <th style="padding:10px;text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${lineItemsHtml}</tbody>
    </table>
    <hr class="divider">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr><td style="padding:4px 0;">Subtotal</td><td style="text-align:right;">${fmt(invoice.subtotal)}</td></tr>
      ${invoice.tax_rate > 0 ? `<tr><td>${invoice.tax_label || 'Tax'} (${invoice.tax_rate}%)</td><td style="text-align:right;">${fmt(invoice.tax_amount)}</td></tr>` : ''}
      <tr><td style="padding:8px 0;font-weight:700;font-size:16px;">Total</td><td style="text-align:right;font-weight:700;font-size:16px;">${fmt(invoice.total)}</td></tr>
    </table>
    ${invoice.notes ? `<hr class="divider"><p>${invoice.notes}</p>` : ''}
    <hr class="divider">
    <p>Please make payment by the due date. Reply to this email with any questions.</p>
  `;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: FROM,
    to: `${client.name} <${client.email}>`,
    subject: `Invoice ${invoice.invoice_number} from Montnexus`,
    html: emailWrapper('Invoice', body),
  });

  await supabase.from('crm_invoices').update({ status: 'sent', updated_at: new Date().toISOString() }).eq('id', invoiceId);
  return { sent: true, to: client.email };
}

// ── Campaign email ─────────────────────────────────────────────────────────
async function sendCampaign({ campaignId }) {
  const { data: campaign, error } = await supabase
    .from('crm_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (error || !campaign) throw new Error('Campaign not found');
  if (campaign.status === 'sent') throw new Error('Campaign already sent');

  let recipients = [];
  if (campaign.recipient_type === 'custom') {
    recipients = (campaign.custom_emails || []).map(email => ({ name: '', email }));
  } else if (campaign.recipient_type === 'all_clients') {
    const { data } = await supabase.from('crm_clients').select('name, email');
    recipients = data || [];
  } else if (campaign.recipient_type === 'qualified_leads') {
    const { data } = await supabase.from('crm_leads').select('name, email').in('status', ['qualified','proposal_sent','won']);
    recipients = data || [];
  } else {
    // all_leads
    const { data } = await supabase.from('crm_leads').select('name, email');
    recipients = data || [];
  }

  if (recipients.length === 0) throw new Error('No recipients found');

  const transporter = getTransporter();
  let sent = 0;
  for (const r of recipients) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: r.name ? `${r.name} <${r.email}>` : r.email,
        subject: campaign.subject,
        html: emailWrapper(campaign.name, campaign.content),
      });
      sent++;
    } catch (err) {
      console.error('[campaign] failed to send to', r.email, err.message);
    }
  }

  await supabase.from('crm_campaigns').update({
    status: 'sent',
    sent_at: new Date().toISOString(),
    recipients_count: sent,
  }).eq('id', campaignId);

  return { sent, total: recipients.length };
}

// ── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, ...payload } = req.body || {};

  try {
    let result;
    switch (action) {
      case 'send_proposal':  result = await sendProposal(payload);  break;
      case 'send_invoice':   result = await sendInvoice(payload);   break;
      case 'send_campaign':  result = await sendCampaign(payload);  break;
      case 'send_test': {
        const transporter = getTransporter();
        await transporter.sendMail({
          from: FROM, to: process.env.SMTP_USER,
          subject: 'Montnexus CRM — Test Email',
          html: emailWrapper('Test Email', '<p>Your SMTP configuration is working correctly.</p>'),
        });
        result = { sent: true };
        break;
      }
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error('[crm-email]', err.message);
    return res.status(500).json({ error: err.message });
  }
}
