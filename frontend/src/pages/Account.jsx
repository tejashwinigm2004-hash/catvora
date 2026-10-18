import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

/* ---------- helpers ---------- */
const fmt = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
const day = (d) => new Date(d).toLocaleDateString('en-IN', { dateStyle: 'medium' });
const inr = (n) => '₹' + new Intl.NumberFormat('en-IN').format(n || 0);
// the server stores text with HTML characters escaped; turn them back for display (React keeps it safe)
const dec = (s = '') => String(s).replace(/&#x27;/g, "'").replace(/&#x2F;/g, '/').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const tone = { good: 'bg-leaf', warn: 'bg-peach border-pline', bad: 'bg-red-100 text-red-700 border-red-200', plain: 'bg-white' };
const Badge = ({ t = 'plain', children }) => (
  <span className={`inline-block rounded-full border border-ink/10 px-3 py-1 text-xs font-semibold ${tone[t]}`}>{children}</span>
);
const LEAD = { new: ['Received', 'warn'], contacted: ['We have contacted you', 'plain'], quoted: ['Quote sent', 'good'], won: ['Accepted', 'good'], lost: ['Closed', 'plain'] };
const BOOKING = { pending: ['Waiting for confirmation', 'warn'], confirmed: ['Confirmed', 'good'], done: ['Completed', 'plain'], cancelled: ['Cancelled', 'bad'] };
const INVOICE = { due: ['Due', 'warn'], overdue: ['Overdue', 'bad'], paid: ['Paid', 'good'] };
const STAGES = ['Discuss', 'Plan', 'Build', 'Support'];

// loads a list or object from the API; signs the customer out if the session has expired
function useFetch(path) {
  const { setUser } = useAuth();
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const load = useCallback(() => {
    if (!path) return Promise.resolve();
    return api.get(path)
      .then((r) => { setData(r.data); setErr(false); })
      .catch((e) => { if (e.response?.status === 401) setUser(null); else setErr(true); });
  }, [path, setUser]);
  useEffect(() => { load(); }, [load]);
  return { data, err, load };
}

function State({ f, empty, children }) {
  if (f.err) return <div className="rounded-3xl bg-leaf p-6">Could not load this. <button className="font-semibold underline" onClick={f.load}>Try again</button></div>;
  if (f.data === null) return <p className="py-10 text-ink/60">Loading…</p>;
  if (Array.isArray(f.data) && !f.data.length) return <div className="rounded-3xl bg-leaf p-8 text-center">{empty}</div>;
  return children;
}

/* ---------- Overview ---------- */
function Overview({ s, setTab }) {
  const tiles = [
    ['Open enquiries', s?.openEnquiries, 'enquiries'],
    ['Upcoming calls', s?.upcomingBookings, 'bookings'],
    ['Active projects', s?.activeProjects, 'projects'],
    ['Unread messages', s?.unreadMessages, 'messages'],
    ['Invoices due', s ? `${s.invoicesDue}${s.invoicesDue ? ' · ' + inr(s.amountDue) : ''}` : null, 'invoices'],
  ];
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([label, val, tab]) => (
          <button key={label} onClick={() => setTab(tab)} className="rounded-3xl bg-leaf p-6 text-left transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-sm text-ink/70">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{val ?? '…'}</p>
          </button>
        ))}
        <div className="rounded-3xl border border-ink/10 p-6">
          <p className="font-semibold">Need something new?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/contact" className="btn !px-4 !py-2 text-sm">Request a quote</Link>
            <button className="btn-ghost !px-4 !py-2 text-sm" onClick={() => window.dispatchEvent(new Event('open-booking'))}>Book a call</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Enquiries ---------- */
function Enquiries() {
  const f = useFetch('/user/leads');
  return (
    <State f={f} empty={<><p className="font-semibold">No enquiries yet</p><p className="mt-1 text-ink/70">Send a quote request while signed in and it will show up here.</p><Link to="/contact" className="btn mt-4">Request a quote</Link></>}>
      <div className="space-y-3">
        {f.data?.map((l) => {
          const [label, t] = LEAD[l.status] || [l.status, 'plain'];
          return (
            <div key={l._id} className="rounded-3xl bg-leaf p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{dec(l.service) || 'General enquiry'} <span className="font-normal text-ink/60">· {l.type === 'quote' ? 'Quote request' : 'Enquiry'}</span></p>
                <Badge t={t}>{label}</Badge>
              </div>
              <p className="mt-2 text-ink/75">{dec(l.message)}</p>
              <p className="mt-2 text-xs text-ink/50">Sent {fmt(l.createdAt)}</p>
            </div>
          );
        })}
      </div>
    </State>
  );
}

/* ---------- Bookings: cancel or reschedule ---------- */
function Bookings({ onChange }) {
  const f = useFetch('/user/bookings');
  const [edit, setEdit] = useState(null); // { id, date }
  const act = async (id, body, ok) => {
    try { await api.patch(`/user/bookings/${id}`, body); toast.success(ok); setEdit(null); f.load(); onChange(); }
    catch (e) { toast.error(e.response?.data?.message || 'Could not update. Try again.'); }
  };
  return (
    <div>
      <button className="btn mb-4" onClick={() => window.dispatchEvent(new Event('open-booking'))}>Book a call</button>
      <State f={f} empty={<><p className="font-semibold">No call bookings yet</p><p className="mt-1 text-ink/70">Book a call and it will appear here.</p></>}>
        <div className="space-y-3">
          {f.data?.map((b) => {
            const [label, t] = BOOKING[b.status] || [b.status, 'plain'];
            const live = ['pending', 'confirmed'].includes(b.status) && new Date(b.date) > new Date();
            const editing = edit?.id === b._id;
            return (
              <div key={b._id} className="rounded-3xl bg-leaf p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{fmt(b.date)}</p>
                  <Badge t={t}>{label}</Badge>
                </div>
                {b.note && <p className="mt-2 text-ink/75">{dec(b.note)}</p>}
                {live && !editing && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="btn-ghost !px-4 !py-2 text-sm" onClick={() => setEdit({ id: b._id, date: new Date(b.date) })}>Reschedule</button>
                    <button className="btn-ghost !px-4 !py-2 text-sm" onClick={() => window.confirm('Cancel this call?') && act(b._id, { action: 'cancel' }, 'Booking cancelled')}>Cancel call</button>
                  </div>
                )}
                {editing && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <DatePicker selected={edit.date} onChange={(d) => setEdit({ ...edit, date: d })} showTimeSelect minDate={new Date()}
                      dateFormat="d MMM yyyy, h:mm aa" className="field" />
                    <button className="btn !px-4 !py-2 text-sm" disabled={!edit.date} onClick={() => act(b._id, { date: edit.date.toISOString() }, 'New time requested')}>Save</button>
                    <button className="btn-ghost !px-4 !py-2 text-sm" onClick={() => setEdit(null)}>Close</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </State>
    </div>
  );
}

/* ---------- Projects: stage, progress and updates ---------- */
function Projects() {
  const f = useFetch('/user/projects');
  const [all, setAll] = useState({});
  return (
    <State f={f} empty={<><p className="font-semibold">No projects yet</p><p className="mt-1 text-ink/70">When we start work together, your project and its progress will appear here.</p></>}>
      <div className="space-y-4">
        {f.data?.map((p) => {
          const at = Math.max(0, STAGES.indexOf(p.stage));
          const ups = [...(p.updates || [])].reverse();
          const shown = all[p._id] ? ups : ups.slice(0, 3);
          return (
            <div key={p._id} className="rounded-3xl bg-leaf p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-xl">{p.title}</h3>
                  <p className="text-sm text-ink/60">{p.service}{p.dueDate ? ` · Due ${day(p.dueDate)}` : ''}</p>
                </div>
                <Badge t={p.status === 'done' ? 'good' : p.status === 'paused' ? 'plain' : 'warn'}>{p.status === 'done' ? 'Done' : p.status === 'paused' ? 'Paused' : 'In progress'}</Badge>
              </div>

              <ol className="mt-4 grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                {STAGES.map((s, i) => (
                  <li key={s} className={`rounded-full border px-2 py-1.5 ${i <= at ? 'border-pline bg-peach' : 'border-ink/10 bg-white text-ink/50'}`}>{s}</li>
                ))}
              </ol>

              <div className="mt-4">
                <div className="flex justify-between text-sm"><span>Progress</span><span className="font-semibold">{p.progress}%</span></div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-cobalt transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="mt-5">
                <p className="font-semibold">Updates from the team</p>
                {ups.length === 0 ? <p className="mt-1 text-sm text-ink/60">No updates yet.</p> : (
                  <ul className="mt-2 space-y-2">
                    {shown.map((u, i) => (
                      <li key={i} className="rounded-2xl bg-white p-3">
                        <p>{dec(u.text)}</p>
                        <p className="mt-1 text-xs text-ink/50">{fmt(u.date)}{u.stage ? ` · ${u.stage}` : ''}{u.progress != null ? ` · ${u.progress}%` : ''}</p>
                      </li>
                    ))}
                  </ul>
                )}
                {ups.length > 3 && <button className="mt-2 text-sm font-semibold underline" onClick={() => setAll({ ...all, [p._id]: !all[p._id] })}>{all[p._id] ? 'Show fewer' : `Show all ${ups.length} updates`}</button>}
              </div>
            </div>
          );
        })}
      </div>
    </State>
  );
}

/* ---------- Messages with the team ---------- */
function Messages({ onRead }) {
  const f = useFetch('/user/messages');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const box = useRef(null);

  useEffect(() => { // new replies appear without refreshing
    const t = setInterval(() => { if (!document.hidden) f.load(); }, 15000);
    return () => clearInterval(t);
  }, [f.load]);
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
    if (f.data) onRead();
  }, [f.data?.length]); // eslint-disable-line

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setBusy(true);
    try { await api.post('/user/messages', { text: t }); setText(''); await f.load(); }
    catch (x) { toast.error(x.response?.data?.message || 'Could not send. Try again.'); }
    finally { setBusy(false); }
  };

  if (f.err) return <div className="rounded-3xl bg-leaf p-6">Could not load messages. <button className="font-semibold underline" onClick={f.load}>Try again</button></div>;
  if (f.data === null) return <p className="py-10 text-ink/60">Loading…</p>;
  return (
    <div className="rounded-3xl bg-leaf p-4 md:p-6">
      <div ref={box} className="h-[420px] space-y-3 overflow-y-auto rounded-2xl bg-white p-4" aria-live="polite">
        {f.data.length === 0 && <p className="py-16 text-center text-ink/60">No messages yet. Write to the CATVORA team below.</p>}
        {f.data.map((m) => (
          <div key={m._id} className={`flex ${m.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.from === 'customer' ? 'border border-pline bg-peach' : 'bg-leaf'}`}>
              <p className="whitespace-pre-wrap break-words">{dec(m.text)}</p>
              <p className="mt-1 text-[11px] text-ink/50">{m.from === 'team' ? 'CATVORA team · ' : ''}{fmt(m.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <textarea className="field" rows={2} maxLength={2000} placeholder="Write a message…" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn self-end" disabled={busy || !text.trim()}>{busy ? 'Sending…' : 'Send'}</button>
      </form>
    </div>
  );
}

/* ---------- Invoices: list, detail, print ---------- */
function Invoices({ setTab }) {
  const f = useFetch('/user/invoices');
  const { user } = useAuth();
  const [inv, setInv] = useState(null);
  const open = async (id) => {
    try { const { data } = await api.get(`/user/invoices/${id}`); setInv(data); }
    catch { toast.error('Could not open the invoice.'); }
  };

  if (inv) {
    const [label, t] = INVOICE[inv.status] || [inv.status, 'plain'];
    return (
      <div>
        <style>{'@media print{body *{visibility:hidden}.print-area,.print-area *{visibility:visible}.print-area{position:absolute;left:0;top:0;width:100%}}'}</style>
        <div className="mb-4 flex gap-2">
          <button className="btn-ghost" onClick={() => setInv(null)}>← All invoices</button>
          <button className="btn" onClick={() => window.print()}>Print or save as PDF</button>
        </div>
        <div className="print-area rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap justify-between gap-4">
            <div><p className="font-display text-2xl font-semibold">CATVORA Technology</p><p className="text-sm text-ink/60">Invoice {inv.number}</p></div>
            <Badge t={t}>{label}</Badge>
          </div>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div><p className="text-ink/60">Billed to</p><p className="font-semibold">{user.name}</p><p>{user.email}</p></div>
            <div><p className="text-ink/60">Issued {day(inv.createdAt)}</p>{inv.dueDate && <p className="text-ink/60">Due {day(inv.dueDate)}</p>}{inv.paidAt && <p className="text-ink/60">Paid {day(inv.paidAt)}</p>}{inv.project?.title && <p>Project: {inv.project.title}</p>}</div>
          </div>
          <table className="mt-6 w-full text-left text-sm">
            <thead><tr className="border-b border-ink/20"><th className="py-2">Description</th><th className="py-2 text-right">Amount</th></tr></thead>
            <tbody>{inv.items.map((i, k) => <tr key={k} className="border-b border-ink/10"><td className="py-2">{dec(i.description)}</td><td className="py-2 text-right">{inr(i.amount)}</td></tr>)}</tbody>
            <tfoot><tr><td className="pt-3 font-semibold">Total</td><td className="pt-3 text-right text-lg font-semibold">{inr(inv.amount)}</td></tr></tfoot>
          </table>
          {inv.note && <p className="mt-4 text-sm text-ink/70">{dec(inv.note)}</p>}
          {inv.status !== 'paid' && <p className="mt-6 text-sm text-ink/70">To pay, <button className="font-semibold underline print:hidden" onClick={() => setTab('messages')}>message the team</button> and we will share the payment details.</p>}
        </div>
      </div>
    );
  }

  return (
    <State f={f} empty={<><p className="font-semibold">No invoices yet</p><p className="mt-1 text-ink/70">Invoices from CATVORA will appear here.</p></>}>
      <div className="space-y-3">
        {f.data?.map((i) => {
          const [label, t] = INVOICE[i.status] || [i.status, 'plain'];
          return (
            <button key={i._id} onClick={() => open(i._id)} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-3xl bg-leaf p-5 text-left transition hover:-translate-y-1 hover:shadow-lg">
              <div><p className="font-semibold">{i.number}</p><p className="text-sm text-ink/60">Issued {day(i.createdAt)}{i.dueDate ? ` · Due ${day(i.dueDate)}` : ''}</p></div>
              <div className="flex items-center gap-3"><span className="font-display text-xl font-semibold">{inr(i.amount)}</span><Badge t={t}>{label}</Badge></div>
            </button>
          );
        })}
      </div>
    </State>
  );
}

/* ---------- Profile ---------- */
function Profile({ user, onLogout }) {
  return (
    <div className="max-w-xl rounded-3xl bg-leaf p-6">
      <p className="text-sm text-ink/60">Name</p><p className="text-lg font-semibold">{user.name}</p>
      <p className="mt-4 text-sm text-ink/60">Email</p><p className="text-lg font-semibold">{user.email}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/services" className="btn-ghost">Browse services</Link>
        <button className="btn" onClick={onLogout}>Sign out</button>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
const TABS = [['overview', 'Overview'], ['enquiries', 'Enquiries'], ['bookings', 'Bookings'], ['projects', 'Projects'], ['messages', 'Messages'], ['invoices', 'Invoices'], ['profile', 'Profile']];

export default function Account() {
  const { user, logout } = useAuth();
  const go = useNavigate();
  const [qs, setQs] = useSearchParams();
  const tab = TABS.some((t) => t[0] === qs.get('tab')) ? qs.get('tab') : 'overview';
  const setTab = (t) => setQs({ tab: t });
  const sum = useFetch(user ? '/user/summary' : null);
  useEffect(() => { if (user) sum.load(); }, [tab, user]); // eslint-disable-line

  if (user === undefined) return <div className="min-h-screen" />; // still checking the session
  if (!user) return <Navigate to="/login" replace />;

  const unread = sum.data?.unreadMessages || 0;
  const signOut = async () => { await logout(); go('/'); };

  return (
    <div className="bg-paper px-5 pb-24 pt-28">
      <Seo title="My account" desc="Your CATVORA Technology dashboard." />
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl sm:text-4xl">Hi, {user.name.split(' ')[0]}</h1>
        <p className="mt-1 text-ink/70">Signed in as {user.email}</p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`shrink-0 rounded-full border px-4 py-2 font-semibold transition ${tab === id ? 'border-pline bg-peach' : 'border-transparent bg-leaf hover:border-pline'}`}>
              {label}{id === 'messages' && unread > 0 && <span className="ml-2 rounded-full bg-cobalt px-2 py-0.5 text-xs text-white">{unread}</span>}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'overview' && <Overview s={sum.data} setTab={setTab} />}
          {tab === 'enquiries' && <Enquiries />}
          {tab === 'bookings' && <Bookings onChange={sum.load} />}
          {tab === 'projects' && <Projects />}
          {tab === 'messages' && <Messages onRead={sum.load} />}
          {tab === 'invoices' && <Invoices setTab={setTab} />}
          {tab === 'profile' && <Profile user={user} onLogout={signOut} />}
        </div>
      </div>
    </div>
  );
}