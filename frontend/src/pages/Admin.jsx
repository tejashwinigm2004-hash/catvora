import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api.js';

const fmt = (d) => new Date(d).toLocaleString();
const Row = ({ children }) => <tr className="border-b border-ink/10 align-top">{children}</tr>;

function Login({ onDone }) {
  const [f, setF] = useState({ email: '', password: '' });
  const go = async (e) => { e.preventDefault(); try { await api.post('/auth/login', f); onDone(); } catch (x) { toast.error(x.response?.data?.message || 'Sign in failed'); } };
  return (
    <form onSubmit={go} className="mx-auto mt-32 w-full max-w-sm space-y-3 rounded-2xl bg-white p-6">
      <h1 className="text-2xl font-extrabold">Admin sign in</h1>
      <input className="field" placeholder="Email" onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className="field" type="password" placeholder="Password" onChange={(e) => setF({ ...f, password: e.target.value })} />
      <button className="btn w-full">Sign in</button>
    </form>
  );
}

function Table({ path, cols, statuses }) {
  const [rows, setRows] = useState([]);
  const load = () => api.get(`/admin/${path}`).then((r) => setRows(r.data));
  useEffect(() => { load(); }, [path]);
  const setStatus = async (id, status) => { await api.put(`/admin/${path}/${id}`, { status }); load(); };
  return (
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead><tr className="border-b border-ink/20">{[...cols.map((c) => c[0]), 'Status'].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <Row key={r._id}>
        {cols.map(([h, k, isDate]) => <td key={h} className="p-2">{isDate ? fmt(r[k]) : r[k]}</td>)}
        <td className="p-2"><select value={r.status} onChange={(e) => setStatus(r._id, e.target.value)} className="rounded border p-1">{statuses.map((s) => <option key={s}>{s}</option>)}</select></td>
      </Row>)}</tbody>
    </table>{!rows.length && <p className="p-4 text-ink/60">Nothing here yet.</p>}</div>
  );
}

function Ads() {
  const blank = { title: '', subtitle: '', ctaText: 'Book a call', ctaLink: '#book', image: '', active: true };
  const [rows, setRows] = useState([]); const [f, setF] = useState(blank);
  const load = () => api.get('/admin/ads').then((r) => setRows(r.data));
  useEffect(() => { load(); }, []);
  const upload = async (file) => { const fd = new FormData(); fd.append('image', file); try { const { data } = await api.post('/admin/upload', fd); setF((x) => ({ ...x, image: data.url })); } catch (e) { toast.error(e.response?.data?.message || 'Upload failed'); } };
  const save = async (e) => { e.preventDefault(); await api.post('/admin/ads', f); setF(blank); toast.success('Ad added'); load(); };
  const toggle = async (a) => { await api.put(`/admin/ads/${a._id}`, { active: !a.active }); load(); };
  const del = async (a) => { await api.delete(`/admin/ads/${a._id}`); load(); };
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={save} className="space-y-3">
        {['title', 'subtitle', 'ctaText', 'ctaLink'].map((k) => <input key={k} className="field" placeholder={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}
        <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && upload(e.target.files[0])} />
        {f.image && <img src={f.image} alt="" className="h-24 rounded" />}
        <button className="btn">Add advertisement</button>
      </form>
      <div className="space-y-3">{rows.map((a) => (
        <div key={a._id} className="rounded-lg bg-white p-3"><p className="font-bold">{a.title}</p>
          <button className="mr-3 text-cobalt" onClick={() => toggle(a)}>{a.active ? 'Hide' : 'Show'}</button>
          <button className="text-red-600" onClick={() => del(a)}>Delete</button></div>))}</div>
    </div>
  );
}

export default function Admin() {
  const [ok, setOk] = useState(null); const [tab, setTab] = useState('leads');
  useEffect(() => { api.get('/auth/me').then(() => setOk(true)).catch(() => setOk(false)); }, []);
  if (ok === null) return null;
  if (!ok) return <Login onDone={() => setOk(true)} />;
  return (
    <div className="mx-auto max-w-6xl p-5">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">CATVORA admin</h1>
        <button onClick={async () => { await api.post('/auth/logout'); setOk(false); }} className="font-bold text-cobalt">Sign out</button></div>
      <div className="my-5 flex gap-2">{['leads', 'bookings', 'ads'].map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 font-bold ${tab === t ? 'bg-ink text-white' : 'bg-white'}`}>{t === 'ads' ? 'Advertisement' : t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      {tab === 'leads' && <Table path="leads" statuses={['new', 'contacted', 'won', 'lost']} cols={[['Date', 'createdAt', 1], ['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Service', 'service'], ['Message', 'message']]} />}
      {tab === 'bookings' && <Table path="bookings" statuses={['pending', 'confirmed', 'done', 'cancelled']} cols={[['Call time', 'date', 1], ['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Note', 'note']]} />}
      {tab === 'ads' && <Ads />}
    </div>
  );
}
