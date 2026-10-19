import { FaWhatsapp, FaPhoneAlt } from 'react-icons/fa';
import { CONFIG } from '../config'; // adjust to your config file path

export default function QuickContact() {
  return (
    <div className="quick-contact">
      <a href={`https://wa.me/${CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer">
        <FaWhatsapp /> WhatsApp
      </a>
      <a href={`tel:${CONFIG.phone.replace(/\s/g, '')}`}>
        <FaPhoneAlt /> Call
      </a>
    </div>
  );
}