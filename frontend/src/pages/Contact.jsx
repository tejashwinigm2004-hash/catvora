import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Seo from '../components/Seo.jsx';
import { api } from '../api.js';
import { CONFIG } from '../config.js';

export default function Contact() {
  const [qs] = useSearchParams();
  const service = qs.get('service') || '';
  const note = qs.get('note') || '';
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    values: { name: '', email: '', phone: '', message: note || (service ? `I would like a quote for ${service}.` : '') },
  });

  const submit = async (d) => {
    try {
      await api.post('/leads', { ...d, service, type: service ? 'quote' : 'contact' });
      toast.success('Message sent. We will reply soon.');
      reset();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not send. Try again or use WhatsApp.');
    }
  };

  const err = (k) => errors[k] && <p className="mt-1 text-sm text-red-600">{errors[k].message}</p>;

  return (
    <div className="pt-24">
      <Seo title="Contact us" desc="Contact CATVORA Technology for a quote or a free call about software, networking and AI solutions." />
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-32 pt-12 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-extrabold">Contact us</h1>
          <p className="mt-4 text-ink/70">
            {CONFIG.phone}<br />
            {CONFIG.email}<br />
            {CONFIG.address}
          </p>
          <iframe title="Map" src={CONFIG.mapEmbed} loading="lazy" className="mt-6 h-64 w-full rounded-xl border-0" />
        </div>
        <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
          <div>
            <input className="field" placeholder="Your name" {...register('name', { required: 'Enter your name' })} />
            {err('name')}
          </div>
          <div>
            <input className="field" type="email" placeholder="Email"
              {...register('email', { required: 'Enter your email', pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' } })} />
            {err('email')}
          </div>
          <input className="field" placeholder="Phone (optional)" {...register('phone')} />
          <div>
            <textarea className="field" rows={5} placeholder="How can we help?" {...register('message', { required: 'Tell us how we can help' })} />
            {err('message')}
          </div>
          <button className="btn w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send message'}</button>
        </form>
      </section>
    </div>
  );
}