import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useInvoices } from '../../../hooks/crm/useInvoices';
import { supabase } from '../../../lib/supabase';

const CURRENCIES = ['INR', 'AED', 'USD', 'EUR'];
const CURRENCY_SYMBOLS = { INR: '₹', AED: 'AED ', USD: '$', EUR: '€' };
const TAX_LABELS = ['GST', 'VAT', 'Tax', 'None'];
const STATUS_COLORS = { draft: '#71717a', sent: '#3b82f6', paid: '#92D108', overdue: '#ef4444', cancelled: '#52525b' };

const emptyItem = () => ({ description: '', qty: 1, rate: 0, amount: 0 });

export default function InvoiceEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromClient = searchParams.get('client');
  const isNew = !id;

  const { invoice, fetchInvoiceById, createInvoice, updateInvoice, nextInvoiceNumber } = useInvoices();

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    client_id: fromClient || '', invoice_number: '', currency: 'INR',
    tax_label: 'GST', tax_rate: 18, due_date: '', notes: '', status: 'draft',
  });
  const [items, setItems] = useState([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('crm_clients').select('id, name, company').order('name').then(({ data }) => setClients(data || []));

    if (isNew) {
      nextInvoiceNumber().then(num => setForm(prev => ({ ...prev, invoice_number: num })));
    } else {
      fetchInvoiceById(id).then(data => {
        if (data) {
          setForm({
            client_id: data.client_id || '', invoice_number: data.invoice_number, currency: data.currency,
            tax_label: data.tax_label, tax_rate: data.tax_rate, due_date: data.due_date || '', notes: data.notes || '', status: data.status,
          });
          setItems(data.line_items?.length > 0 ? data.line_items : [emptyItem()]);
        }
      });
    }
  }, [id]);

  // Recalculate amounts when items change
  const subtotal = items.reduce((s, i) => s + Number(i.amount), 0);
  const taxRate = form.tax_label === 'None' ? 0 : Number(form.tax_rate);
  const taxAmount = subtotal * taxRate / 100;
  const total = subtotal + taxAmount;

  function updateItem(index, field, value) {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'qty' || field === 'rate') {
        const qty = field === 'qty' ? Number(value) : Number(updated[index].qty);
        const rate = field === 'rate' ? Number(value) : Number(updated[index].rate);
        updated[index].amount = qty * rate;
      }
      return updated;
    });
  }

  function addItem() { setItems(prev => [...prev, emptyItem()]); }
  function removeItem(i) { setItems(prev => prev.filter((_, idx) => idx !== i)); }

  async function handleSave(status = form.status) {
    if (!form.client_id) { setError('Please select a client'); return; }
    if (!form.invoice_number) { setError('Invoice number is required'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        status,
        tax_rate: taxRate,
        line_items: items.filter(i => i.description.trim()),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax_amount: parseFloat(taxAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        due_date: form.due_date || null,
      };
      if (isNew) {
        const created = await createInvoice(payload);
        navigate(`/admin/crm/invoices/${created.id}/edit`, { replace: true });
      } else {
        await updateInvoice(id, payload);
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleSend() {
    if (isNew || !id) { setError('Save the invoice first'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch('/api/crm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_invoice', invoiceId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(prev => ({ ...prev, status: 'sent' }));
      alert(`Invoice sent to ${data.to}`);
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  }

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 100);
  }

  const sym = CURRENCY_SYMBOLS[form.currency] || form.currency;
  const fmt = (n) => `${sym}${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const client = clients.find(c => c.id === form.client_id);

  return (
    <div className="admin-content">
      <div className="admin-topbar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/crm/invoices" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>← Invoices</Link>
          <h1 className="admin-topbar-title">{isNew ? 'New Invoice' : form.invoice_number}</h1>
          {!isNew && (
            <span className="crm-status-badge" style={{ background: STATUS_COLORS[form.status] + '22', color: STATUS_COLORS[form.status], borderColor: STATUS_COLORS[form.status] + '44' }}>
              {form.status}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isNew && form.status === 'sent' && (
            <button className="admin-btn-secondary" onClick={() => handleSave('paid')}>Mark as Paid</button>
          )}
          <button className="admin-btn-secondary" onClick={handlePrint}>🖨 Print / PDF</button>
          <button className="admin-btn-secondary" onClick={() => handleSave()} disabled={saving}>{saving ? 'Saving…' : 'Save Draft'}</button>
          <button className="admin-btn-primary" onClick={handleSend} disabled={sending || isNew}>{sending ? 'Sending…' : 'Send Invoice'}</button>
        </div>
      </div>

      {error && <div className="admin-error no-print">{error}</div>}

      {/* Invoice content — this section gets printed */}
      <div className="invoice-print-area">
        <div className="admin-editor-panel">
          {/* Header fields */}
          <div className="admin-field-row no-print">
            <div className="admin-field">
              <label className="admin-label">Client *</label>
              <select name="client_id" className="admin-select" value={form.client_id} onChange={e => setForm(prev => ({ ...prev, client_id: e.target.value }))}>
                <option value="">Select client…</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Invoice Number</label>
              <input className="admin-input" value={form.invoice_number} onChange={e => setForm(prev => ({ ...prev, invoice_number: e.target.value }))} />
            </div>
            <div className="admin-field">
              <label className="admin-label">Currency</label>
              <select className="admin-select" value={form.currency} onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-field">
              <label className="admin-label">Due Date</label>
              <input type="date" className="admin-input" value={form.due_date} onChange={e => setForm(prev => ({ ...prev, due_date: e.target.value }))} />
            </div>
          </div>

          {/* Print header */}
          <div className="print-only invoice-print-header">
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#111' }}>MONTNEXUS</div>
              <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>hello@montnexus.com · montnexus.com</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#111' }}>INVOICE</div>
              <div style={{ fontSize: 14, color: '#52525b', marginTop: 4 }}>{form.invoice_number}</div>
              {form.due_date && <div style={{ fontSize: 13, color: '#71717a' }}>Due: {new Date(form.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
            </div>
          </div>
          {client && (
            <div className="print-only" style={{ margin: '20px 0', padding: '12px 0', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }}>
              <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>BILL TO</div>
              <div style={{ fontWeight: 700, color: '#111' }}>{client.name}{client.company ? ` — ${client.company}` : ''}</div>
            </div>
          )}

          {/* Line items */}
          <div className="crm-invoice-table">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 0', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', width: 60 }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', width: 120 }}>Rate</th>
                  <th style={{ textAlign: 'right', padding: '10px 0', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', width: 120 }}>Amount</th>
                  <th className="no-print" style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '10px 0' }}>
                      <input className="admin-input no-print" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Description of service or product" style={{ width: '100%' }} />
                      <span className="print-only" style={{ fontSize: 14, color: '#202020' }}>{item.description}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <input className="admin-input no-print" type="number" min="1" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} style={{ width: '100%', textAlign: 'center' }} />
                      <span className="print-only">{item.qty}</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <input className="admin-input no-print" type="number" min="0" value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)} style={{ width: '100%', textAlign: 'right' }} />
                      <span className="print-only">{fmt(item.rate)}</span>
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 500, color: '#e4e4e7' }}>
                      {fmt(item.amount)}
                    </td>
                    <td className="no-print" style={{ textAlign: 'center', padding: '10px 4px' }}>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16 }}>×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="admin-btn-secondary no-print" style={{ marginTop: 12, fontSize: 13 }} onClick={addItem}>+ Add Line Item</button>
          </div>

          {/* Totals */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 280 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Subtotal</span>
                <span style={{ fontWeight: 500 }}>{fmt(subtotal)}</span>
              </div>
              <div className="no-print" style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <select className="admin-select" style={{ flex: 1, padding: '6px 10px', fontSize: 13 }} value={form.tax_label} onChange={e => setForm(prev => ({ ...prev, tax_label: e.target.value }))}>
                  {TAX_LABELS.map(t => <option key={t}>{t}</option>)}
                </select>
                {form.tax_label !== 'None' && (
                  <input type="number" className="admin-input" style={{ width: 64, fontSize: 13 }} value={form.tax_rate} onChange={e => setForm(prev => ({ ...prev, tax_rate: e.target.value }))} />
                )}
                {form.tax_label !== 'None' && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>%</span>}
              </div>
              {taxRate > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{form.tax_label} ({taxRate}%)</span>
                  <span style={{ fontWeight: 500 }}>{fmt(taxAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid rgba(255,255,255,0.15)', paddingTop: 12, marginTop: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#92D108' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="admin-field no-print" style={{ marginTop: 24 }}>
            <label className="admin-label">Notes (optional)</label>
            <textarea className="admin-textarea" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Payment terms, bank details, thank you note…" />
          </div>
          {form.notes && <p className="print-only" style={{ marginTop: 24, color: '#52525b', fontSize: 14, borderTop: '1px solid #e4e4e7', paddingTop: 16 }}>{form.notes}</p>}
        </div>
      </div>
    </div>
  );
}
