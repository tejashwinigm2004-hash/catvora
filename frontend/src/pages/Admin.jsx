import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';

/* ---------- helpers ---------- */
const Fail = createContext(() => {});            // called when the admin session has expired
const fmt = (d) => (d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '');
const inr = (n) => '₹' + new Intl.NumberFormat('en-IN').format(n || 0);
// the server stores text with HTML characters escaped; turn them back for display (React keeps it safe)
const dec = (s) => (typeof s === 'string' ? s.replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : s);
const msg = (e) => e.response?.data?.message || 'Something went wrong. Try again.';
const act = async (promise, ok, after) => {
  try { await promise; if (ok) toast.success(ok); if (after) await after(); }
  catch (e) { toast.error(msg(e)); }
};

function useList(path) {
  const fail = useContext(Fail);
  const [rows, setRows] = useState(null);
  const load = useCallback(() => api.get(path).then((r) => setRows(r.data)).catch((e) => {
    if (e.response?.status === 401) fail(); else { setRows([]); toast.error(msg(e)); }
  }), [path, fail]);
  useEffect(() => { load(); }, [load]);
  return [rows, load];
}

const Card = ({ children, className = '' }) => <div className={`rounded-3xl bg-leaf p-5 ${className}`}>{children}</div>;
const Empty = ({ children }) => <p className="rounded-3xl bg-leaf p-8 text-center text-ink/70">{children}</p>;
const Pill = ({ t = 'plain', children }) => {
  const c = { good: 'bg-leaf', warn: 'bg-peach border-pline', bad: 'bg-red-100 text-red-700 border-red-200', plain: 'bg-white' }[t];
  return <span className={`inline-block rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold ${c}`}>{children}</span>;
};

/* ---------- sign in ---------- */
function Login({ onDone }) {
  const [f, setF] = useState({ email: '', password: '' });
  const go = async (e) => {
    e.preventDefault();
    try { await api.post('/auth/login', f); onDone(); } catch (x) { toast.error(msg(x)); }
  };
  return (
    <form onSubmit={go} className="mx-auto mt-32 w-full max-w-sm space-y-3 rounded-3xl bg-leaf p-6">
      <h1 className="text-2xl">Admin sign in</h1>
      <input className="field" type="email" placeholder="Email" onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className="field" type="password" placeholder="Password" onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button className="btn w-full">Sign in</button>
    </form>
  );
}

/* ---------- overview ---------- */
function Chart({ days }) {
  const map = Object.fromEntries(days.map((d) => [d.day, d.count]));
  const list = Array.from({ length: 30 }, (_, i) => {
    const k = new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10);
    return [k, map[k] || 0];
  });
  const max = Math.max(1, ...list.map((x) => x[1]));
  return (
    <svg viewBox="0 0 600 150" className="w-full" role="img" aria-label="Enquiries per day over the last 30 days">
      {list.map(([k, n], i) => {
        const h = (n / max) * 110;
        return <rect key={k} x={i * 20 + 3} y={125 - h} width="14" height={Math.max(h, 2)} rx="4" fill={n ? '#1456E0' : '#0B2A5B22'}><title>{`${k}: ${n}`}</title></rect>;
      })}
      <line x1="0" y1="127" x2="600" y2="127" stroke="#0B2A5B33" />
      <text x="0" y="145" fontSize="11" fill="#0B2A5B" opacity=".6">30 days ago</text>
      <text x="600" y="145" fontSize="11" textAnchor="end" fill="#0B2A5B" opacity=".6">Today</text>
    </svg>
  );
}

function Overview({ s, setTab }) {
  const tiles = [
    ['New enquiries', s?.newLeads, 'leads'], ['Pending bookings', s?.pendingBookings, 'bookings'],
    ['Customers', s?.customers, 'customers'], ['Unread messages', s?.unreadMessages, 'messages'],
    ['Invoices due', s ? `${s.invoicesDue}${s.invoicesDue ? ' · ' + inr(s.amountDue) : ''}` : null, 'invoices'],
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map(([l, v, t]) => (
          <button key={l} onClick={() => setTab(t)} className="rounded-3xl bg-leaf p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm text-ink/70">{l}</p><p className="mt-2 font-display text-3xl font-semibold">{v ?? '…'}</p>
          </button>
        ))}
      </div>
      <Card className="!bg-white border border-ink/10"><p className="mb-2 font-semibold">Enquiries, last 30 days</p>{s ? <Chart days={s.leadsPerDay} /> : <p className="text-ink/60">Loading…</p>}</Card>
    </div>
  );
}

/* ---------- leads and bookings ---------- */
const LEAD_COLS = [['Date', 'createdAt', 1], ['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Service', 'service'], ['Message', 'message']];
const BOOKING_COLS = [['Call time', 'date', 1], ['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Note', 'note']];

function Records({ path, cols, statuses, onChange }) {
  const [rows, load] = useList(`/admin/${path}`);
  const [q, setQ] = useState('');
  const [st, setSt] = useState('all');
  const shown = useMemo(() => (rows || []).filter((r) =>
    (st === 'all' || r.status === st) && JSON.stringify(cols.map((c) => dec(r[c[1]]))).toLowerCase().includes(q.toLowerCase())), [rows, q, st, cols]);
  const setStatus = (id, status) => act(api.put(`/admin/${path}/${id}`, { status }), 'Status updated', async () => { await load(); onChange(); });
  const exportCsv = async () => {
    try {
      const r = await api.get(`/admin/export/${path}`, { responseType: 'blob' });
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a'); a.href = url; a.download = `${path}.csv`; a.click(); URL.revokeObjectURL(url);
    } catch (e) { toast.error(msg(e)); }
  };
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="field !w-auto flex-1" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field !w-auto" value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="all">All statuses</option>{statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn-ghost" onClick={exportCsv}>Export CSV</button>
      </div>
      {rows === null ? <p className="text-ink/60">Loading…</p> : !shown.length ? <Empty>Nothing here yet.</Empty> : (
        <div className="overflow-x-auto rounded-3xl border border-ink/10 bg-white">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-ink/15">{[...cols.map((c) => c[0]), 'Status'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
            <tbody>{shown.map((r) => (
              <tr key={r._id} className="border-b border-ink/10 align-top">
                {cols.map(([h, k, isDate]) => <td key={h} className="p-3">{isDate ? fmt(r[k]) : dec(r[k])}</td>)}
                <td className="p-3"><select value={r.status} onChange={(e) => setStatus(r._id, e.target.value)} className="rounded-lg border border-ink/15 p-1">{statuses.map((s) => <option key={s}>{s}</option>)}</select></td>
              </tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------- customers ---------- */
function Customers() {
  const [rows] = useList('/admin/customers');
  if (rows === null) return <p className="text-ink/60">Loading…</p>;
  if (!rows.length) return <Empty>No customers have registered yet.</Empty>;
  return (
    <div className="overflow-x-auto rounded-3xl border border-ink/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b border-ink/15"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Joined</th></tr></thead>
        <tbody>{rows.map((u) => <tr key={u._id} className="border-b border-ink/10"><td className="p-3">{dec(u.name)}</td><td className="p-3">{u.email}</td><td className="p-3">{day(u.createdAt)}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/* ---------- projects and progress updates ---------- */
const STAGES = ['Discuss', 'Plan', 'Build', 'Support'];

function ProjectCard({ p, reload }) {
  const [s, setS] = useState({ stage: p.stage, progress: p.progress, status: p.status });
  const [text, setText] = useState('');
  const save = () => act(api.put(`/admin/projects/${p._id}`, { ...s, progress: Number(s.progress) }), 'Project saved', reload);
  const post = () => {
    if (!text.trim()) return toast.error('Write the update first');
    return act(api.post(`/admin/projects/${p._id}/updates`, { text, stage: s.stage, progress: Number(s.progress) }), 'Update posted', async () => { setText(''); await reload(); });
  };
  const del = () => window.confirm('Delete this project?') && act(api.delete(`/admin/projects/${p._id}`), 'Project deleted', reload);
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h3 className="text-xl">{p.title}</h3><p className="text-sm text-ink/60">{p.user?.name || 'Deleted customer'} · {p.service}{p.dueDate ? ` · Due ${day(p.dueDate)}` : ''}</p></div>
        <button className="text-sm font-semibold text-red-600" onClick={del}>Delete</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Stage<select className="field mt-1" value={s.stage} onChange={(e) => setS({ ...s, stage: e.target.value })}>{STAGES.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="text-sm">Status<select className="field mt-1" value={s.status} onChange={(e) => setS({ ...s, status: e.target.value })}><option>active</option><option>paused</option><option>done</option></select></label>
        <label className="text-sm">Progress: {s.progress}%<input type="range" min="0" max="100" className="mt-3 w-full accent-[#E9A57C]" value={s.progress} onChange={(e) => setS({ ...s, progress: e.target.value })} /></label>
      </div>
      <button className="btn mt-3 !px-4 !py-2 text-sm" onClick={save}>Save changes</button>
      <div className="mt-4 rounded-2xl bg-white p-3">
        <textarea className="field" rows={2} maxLength={1000} placeholder="Post an update the customer will see…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-ghost mt-2 !px-4 !py-2 text-sm" onClick={post}>Post update</button>
        {p.updates?.length > 0 && <ul className="mt-3 space-y-1 text-sm">{[...p.updates].reverse().slice(0, 3).map((u, i) => <li key={i} className="text-ink/70">{fmt(u.date)}: {dec(u.text)}</li>)}</ul>}
      </div>
    </Card>
  );
}

function Projects() {
  const [rows, load] = useList('/admin/projects');
  const [users] = useList('/admin/customers');
  const blank = { user: '', title: '', service: '', dueDate: '' };
  const [f, setF] = useState(blank);
  const create = (e) => {
    e.preventDefault();
    return act(api.post('/admin/projects', { ...f, dueDate: f.dueDate || undefined }), 'Project created', async () => { setF(blank); await load(); });
  };
  return (
    <div className="space-y-5">
      <form onSubmit={create} className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-5">
        <select className="field" value={f.user} onChange={(e) => setF({ ...f, user: e.target.value })}><option value="">Choose customer</option>{(users || []).map((u) => <option key={u._id} value={u._id}>{dec(u.name)} ({u.email})</option>)}</select>
        <input className="field" placeholder="Project title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <input className="field" placeholder="Service" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })} />
        <input className="field" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
        <button className="btn">Create project</button>
      </form>
      {rows === null ? <p className="text-ink/60">Loading…</p> : !rows.length ? <Empty>No projects yet. Create one for a customer above.</Empty> : rows.map((p) => <ProjectCard key={p._id} p={p} reload={load} />)}
    </div>
  );
}

/* ---------- invoices ---------- */
function Invoices({ onChange }) {
  const [rows, load] = useList('/admin/invoices');
  const [users] = useList('/admin/customers');
  const [projects] = useList('/admin/projects');
  const blank = { user: '', project: '', dueDate: '', note: '' };
  const [f, setF] = useState(blank);
  const [items, setItems] = useState([{ description: '', amount: '' }]);
  const setItem = (i, k, v) => setItems(items.map((x, n) => (n === i ? { ...x, [k]: v } : x)));
  const create = (e) => {
    e.preventDefault();
    return act(api.post('/admin/invoices', { ...f, project: f.project || undefined, dueDate: f.dueDate || undefined, items }), 'Invoice created',
      async () => { setF(blank); setItems([{ description: '', amount: '' }]); await load(); onChange(); });
  };
  const mark = (i, status) => act(api.patch(`/admin/invoices/${i._id}/status`, { status }), 'Invoice updated', async () => { await load(); onChange(); });
  const del = (i) => window.confirm(`Delete ${i.number}?`) && act(api.delete(`/admin/invoices/${i._id}`), 'Invoice deleted', async () => { await load(); onChange(); });
  const mine = (projects || []).filter((p) => p.user?._id === f.user);
  const total = items.reduce((a, i) => a + (Number(i.amount) || 0), 0);
  return (
    <div className="space-y-5">
      <form onSubmit={create} className="space-y-3 rounded-3xl border border-ink/10 bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <select className="field" value={f.user} onChange={(e) => setF({ ...f, user: e.target.value, project: '' })}><option value="">Choose customer</option>{(users || []).map((u) => <option key={u._id} value={u._id}>{dec(u.name)} ({u.email})</option>)}</select>
          <select className="field" value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })}><option value="">No project</option>{mine.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}</select>
          <input className="field" type="date" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} />
        </div>
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input className="field" placeholder="Description" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} />
            <input className="field !w-40" type="number" min="0" placeholder="Amount ₹" value={it.amount} onChange={(e) => setItem(i, 'amount', e.target.value)} />
            {items.length > 1 && <button type="button" className="px-2 text-red-600" aria-label="Remove item" onClick={() => setItems(items.filter((_, n) => n !== i))}>✕</button>}
          </div>
        ))}
        <button type="button" className="text-sm font-semibold underline" onClick={() => setItems([...items, { description: '', amount: '' }])}>+ Add item</button>
        <input className="field" placeholder="Note (optional)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        <div className="flex items-center justify-between"><p className="font-semibold">Total: {inr(total)}</p><button className="btn">Create invoice</button></div>
      </form>
      {rows === null ? <p className="text-ink/60">Loading…</p> : !rows.length ? <Empty>No invoices yet.</Empty> : (
        <div className="space-y-3">{rows.map((i) => (
          <Card key={i._id} className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="font-semibold">{i.number} · {i.user?.name || 'Deleted customer'}</p><p className="text-sm text-ink/60">{inr(i.amount)}{i.dueDate ? ` · Due ${day(i.dueDate)}` : ''}</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill t={i.status === 'paid' ? 'good' : i.status === 'overdue' ? 'bad' : 'warn'}>{i.status === 'paid' ? 'Paid' : i.status === 'overdue' ? 'Overdue' : 'Due'}</Pill>
              {i.status === 'paid' ? <button className="btn-ghost !px-4 !py-2 text-sm" onClick={() => mark(i, 'due')}>Mark unpaid</button> : <button className="btn !px-4 !py-2 text-sm" onClick={() => mark(i, 'paid')}>Mark paid</button>}
              <button className="text-sm font-semibold text-red-600" onClick={() => del(i)}>Delete</button>
            </div>
          </Card>))}</div>
      )}
    </div>
  );
}

/* ---------- messages ---------- */
function Messages({ onChange }) {
  const [conv, loadConv] = useList('/admin/messages');
  const [users] = useList('/admin/customers');
  const [sel, setSel] = useState(null);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const box = useRef(null);
  const loadThread = useCallback(async () => {
    if (!sel) return;
    try { const r = await api.get(`/admin/messages/${sel._id}`); setThread(r.data); loadConv(); onChange(); } catch { /* ignore */ }
  }, [sel, loadConv, onChange]);
  useEffect(() => { setThread([]); loadThread(); }, [loadThread]);
  useEffect(() => { const t = setInterval(() => { if (!document.hidden) loadThread(); }, 15000); return () => clearInterval(t); }, [loadThread]);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [thread.length]);
  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    return act(api.post(`/admin/messages/${sel._id}`, { text }), '', async () => { setText(''); await loadThread(); });
  };
  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <div className="space-y-2">
        <select className="field" value="" onChange={(e) => setSel((users || []).find((u) => u._id === e.target.value) || null)}>
          <option value="">Start a conversation…</option>{(users || []).map((u) => <option key={u._id} value={u._id}>{dec(u.name)}</option>)}
        </select>
        {conv === null ? <p className="text-ink/60">Loading…</p> : !conv.length ? <Empty>No messages yet.</Empty> : conv.map((c) => (
          <button key={c.user._id} onClick={() => setSel(c.user)} className={`w-full rounded-2xl p-3 text-left transition ${sel?._id === c.user._id ? 'bg-peach border border-pline' : 'bg-leaf hover:bg-white'}`}>
            <p className="flex items-center justify-between font-semibold">{dec(c.user.name)}{c.unread > 0 && <span className="rounded-full bg-cobalt px-2 py-0.5 text-xs text-white">{c.unread}</span>}</p>
            <p className="truncate text-sm text-ink/60">{dec(c.last)}</p>
          </button>))}
      </div>
      <div className="rounded-3xl bg-leaf p-4">
        {!sel ? <p className="py-24 text-center text-ink/60">Choose a customer to read and reply.</p> : (
          <>
            <p className="mb-2 font-semibold">{dec(sel.name)} <span className="font-normal text-ink/60">{sel.email}</span></p>
            <div ref={box} className="h-[380px] space-y-3 overflow-y-auto rounded-2xl bg-white p-4">
              {thread.length === 0 && <p className="py-16 text-center text-ink/60">No messages yet. Write the first one below.</p>}
              {thread.map((m) => (
                <div key={m._id} className={`flex ${m.from === 'team' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.from === 'team' ? 'border border-pline bg-peach' : 'bg-leaf'}`}>
                    <p className="whitespace-pre-wrap break-words">{dec(m.text)}</p><p className="mt-1 text-[11px] text-ink/50">{fmt(m.createdAt)}</p>
                  </div>
                </div>))}
            </div>
            <form onSubmit={send} className="mt-3 flex gap-2">
              <textarea className="field" rows={2} maxLength={2000} placeholder="Write a reply…" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="btn self-end" disabled={!text.trim()}>Send</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- editors: services, team, advertisements ---------- */
function Crud({ path, fields, blank, titleKey = 'title' }) {
  const [rows, load] = useList(`/admin/${path}`);
  const [f, setF] = useState(blank);
  const [id, setId] = useState(null);
  const reset = () => { setId(null); setF(blank); };
  const edit = (r) => {
    setId(r._id);
    setF(Object.fromEntries(fields.map(([k, , t]) => [k, t === 'lines' ? (r[k] || []).join('\n') : r[k] ?? blank[k]])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const upload = async (key, file) => {
    const fd = new FormData(); fd.append('image', file);
    try { const { data } = await api.post('/admin/upload', fd); setF((x) => ({ ...x, [key]: data.url })); toast.success('Image uploaded'); }
    catch (e) { toast.error(msg(e)); }
  };
  const save = (e) => {
    e.preventDefault();
    const body = Object.fromEntries(fields.map(([k, , t]) => [k, t === 'lines' ? f[k].split('\n').map((s) => s.trim()).filter(Boolean) : t === 'number' ? Number(f[k]) || 0 : f[k]]));
    return act(id ? api.put(`/admin/${path}/${id}`, body) : api.post(`/admin/${path}`, body), 'Saved', async () => { reset(); await load(); });
  };
  const del = (r) => window.confirm('Delete this item?') && act(api.delete(`/admin/${path}/${r._id}`), 'Deleted', load);
  const toggle = (r) => act(api.put(`/admin/${path}/${r._id}`, { active: !r.active }), '', load);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form onSubmit={save} className="space-y-3 rounded-3xl bg-leaf p-5">
        <p className="font-semibold">{id ? 'Edit item' : 'Add new'}</p>
        {fields.map(([k, label, t, opts]) => (
          <label key={k} className="block text-sm">{t === 'checkbox' ? null : label}
            {t === 'textarea' || t === 'lines' ? <textarea className="field mt-1" rows={t === 'lines' ? 4 : 3} placeholder={t === 'lines' ? 'One per line' : ''} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              : t === 'select' ? <select className="field mt-1" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>{opts.map((o) => <option key={o}>{o}</option>)}</select>
              : t === 'checkbox' ? <span className="flex items-center gap-2 font-medium"><input type="checkbox" checked={!!f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} />{label}</span>
              : t === 'image' ? <><input type="file" accept="image/*" className="mt-1 block" onChange={(e) => e.target.files[0] && upload(k, e.target.files[0])} />{f[k] && <img src={f[k]} alt="" className="mt-2 h-24 rounded-xl" />}</>
              : <input className="field mt-1" type={t === 'number' ? 'number' : 'text'} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
          </label>
        ))}
        <div className="flex gap-2"><button className="btn">{id ? 'Save changes' : 'Add'}</button>{id && <button type="button" className="btn-ghost" onClick={reset}>Cancel</button>}</div>
      </form>
      <div className="space-y-3">
        {rows === null ? <p className="text-ink/60">Loading…</p> : !rows.length ? <Empty>Nothing here yet.</Empty> : rows.map((r) => (
          <div key={r._id} className="rounded-3xl border border-ink/10 bg-white p-4">
            <p className="font-semibold">{r[titleKey]}{r.active === false && <span className="ml-2 text-xs text-ink/50">(hidden)</span>}</p>
            {r.role && <p className="text-sm text-ink/60">{r.role}</p>}
            <div className="mt-2 flex gap-4 text-sm font-semibold">
              <button className="text-cobalt" onClick={() => edit(r)}>Edit</button>
              {'active' in r && <button className="text-cobalt" onClick={() => toggle(r)}>{r.active ? 'Hide' : 'Show'}</button>}
              <button className="text-red-600" onClick={() => del(r)}>Delete</button>
            </div>
          </div>))}
      </div>
    </div>
  );
}

const SERVICE_FIELDS = [['title', 'Title', 'text'], ['slug', 'Slug (web address part, for example ai-data)', 'text'], ['icon', 'Icon', 'select', ['code', 'wifi', 'hardware', 'cpu', 'trend']],
  ['summary', 'Summary', 'textarea'], ['benefits', 'Benefits', 'lines'], ['order', 'Order', 'number'], ['active', 'Show on website', 'checkbox']];
const TEAM_FIELDS = [['name', 'Name', 'text'], ['role', 'Role', 'text'], ['bio', 'Short bio', 'textarea'], ['photo', 'Photo', 'image'], ['order', 'Order', 'number']];
const AD_FIELDS = [['title', 'Title', 'text'], ['subtitle', 'Subtitle', 'text'], ['ctaText', 'Button text', 'text'], ['ctaLink', 'Button link', 'text'], ['image', 'Image', 'image'], ['order', 'Order', 'number'], ['active', 'Active', 'checkbox']];

/* ---------- page ---------- */
const TABS = [['overview', 'Overview'], ['leads', 'Leads'], ['bookings', 'Bookings'], ['customers', 'Customers'], ['projects', 'Projects'], ['invoices', 'Invoices'], ['messages', 'Messages'], ['services', 'Services'], ['team', 'Team'], ['ads', 'Advertisement']];

export default function Admin() {
  const [ok, setOk] = useState(null);
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const fail = useCallback(() => setOk(false), []);
  const loadStats = useCallback(() => api.get('/admin/stats').then((r) => setStats(r.data)).catch(() => {}), []);
  useEffect(() => { api.get('/auth/me').then(() => setOk(true)).catch(() => setOk(false)); }, []);
  useEffect(() => { if (ok) loadStats(); }, [ok, tab, loadStats]);
  if (ok === null) return null;
  if (!ok) return <Login onDone={() => setOk(true)} />;

  const badge = { leads: stats?.newLeads, bookings: stats?.pendingBookings, invoices: stats?.invoicesDue, messages: stats?.unreadMessages };
  return (
    <Fail.Provider value={fail}>
      <div className="mx-auto max-w-6xl p-5 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl">CATVORA admin</h1>
          <div className="flex gap-4 font-semibold"><a href="/" className="text-ink/70 hover:text-cobalt">View website</a>
            <button onClick={async () => { await api.post('/auth/logout'); setOk(false); }} className="text-cobalt">Sign out</button></div>
        </div>
        <div className="my-5 flex gap-2 overflow-x-auto pb-2" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`shrink-0 rounded-full border px-4 py-2 font-semibold transition ${tab === id ? 'border-pline bg-peach' : 'border-transparent bg-leaf hover:border-pline'}`}>
              {label}{badge[id] > 0 && <span className="ml-2 rounded-full bg-cobalt px-2 py-0.5 text-xs text-white">{badge[id]}</span>}
            </button>))}
        </div>
        {tab === 'overview' && <Overview s={stats} setTab={setTab} />}
        {tab === 'leads' && <Records path="leads" cols={LEAD_COLS} statuses={['new', 'contacted', 'quoted', 'won', 'lost']} onChange={loadStats} />}
        {tab === 'bookings' && <Records path="bookings" cols={BOOKING_COLS} statuses={['pending', 'confirmed', 'done', 'cancelled']} onChange={loadStats} />}
        {tab === 'customers' && <Customers />}
        {tab === 'projects' && <Projects />}
        {tab === 'invoices' && <Invoices onChange={loadStats} />}
        {tab === 'messages' && <Messages onChange={loadStats} />}
        {tab === 'services' && <Crud path="services" fields={SERVICE_FIELDS} blank={{ title: '', slug: '', icon: 'code', summary: '', benefits: '', order: 0, active: true }} />}
        {tab === 'team' && <Crud path="team" fields={TEAM_FIELDS} titleKey="name" blank={{ name: '', role: '', bio: '', photo: '', order: 0 }} />}
        {tab === 'ads' && <Crud path="ads" fields={AD_FIELDS} blank={{ title: '', subtitle: '', ctaText: 'Book a call', ctaLink: '#book', image: '', order: 0, active: true }} />}
      </div>
    </Fail.Provider>
  );
}