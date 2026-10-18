import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FiPhoneCall, FiX } from 'react-icons/fi';
import { api } from '../api.js';
import { CONFIG } from '../config.js';

function BookingModal({ onClose }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm();
  const submit = async (d) => {
    try { await api.post('/bookings', d); toast.success('Call booked. Check your email.'); onClose(); }
    catch (e) { toast.error(e.response?.data?.message || 'Could not book the call. Try again.'); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label="Book a call">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md space-y-3 rounded-3xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Book a call</h2>
          <button type="button" onClick={onClose} aria-label="Close"><FiX size={22} /></button>
        </div>
        <input className="field" placeholder="Your name" {...register('name', { required: 'Enter your name' })} />
        <input className="field" placeholder="Email" {...register('email', { required: 'Enter your email' })} />
        <input className="field" placeholder="Phone" {...register('phone', { required: 'Enter your phone number' })} />
        <Controller name="date" control={control} rules={{ required: 'Pick a date and time' }} render={({ field }) => (
          <DatePicker selected={field.value} onChange={field.onChange} showTimeSelect minDate={new Date()} dateFormat="d MMM yyyy, h:mm aa"
            placeholderText="Pick a date and time" className="field" wrapperClassName="w-full" />)} />
        <textarea className="field" rows={2} placeholder="What should we cover? (optional)" {...register('note')} />
        {Object.values(errors)[0] && <p className="text-sm text-red-600">{Object.values(errors)[0].message}</p>}
        <button className="btn w-full" disabled={isSubmitting}>{isSubmitting ? 'Booking…' : 'Book call'}</button>
      </form>
    </div>
  );
}

export default function Floating() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setOpen(true);
    window.addEventListener('open-booking', f);
    return () => window.removeEventListener('open-booking', f);
  }, []);
  const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hi CATVORA, I would like to know more about your services.')}`;
  const round = 'grid h-12 w-12 place-items-center rounded-full text-white shadow-lg transition hover:scale-105';
  return (
    <>
      <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
        <a href={CONFIG.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className={`${round} bg-pink-600`}><FaInstagram size={22} /></a>
        <a href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp" className={`${round} bg-green-500`}><FaWhatsapp size={24} /></a>
        <button onClick={() => setOpen(true)} className="btn shadow-lg"><FiPhoneCall /> Book a call</button>
      </div>
      {open && <BookingModal onClose={() => setOpen(false)} />}
    </>
  );
}