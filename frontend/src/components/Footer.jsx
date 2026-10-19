import { FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { CONFIG } from '../config'; // adjust to your config file path

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Catvora Technologies</h3>
          <p>{CONFIG.address}</p>
          <p>{CONFIG.phone}</p>
          <div className="social">
            <a href={CONFIG.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href={`https://wa.me/${CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
            <a href={`mailto:${CONFIG.email}`} aria-label="Email">
              <FaEnvelope />
            </a>
          </div>
        </div>
        <div className="map-wrap">
          <iframe src={CONFIG.mapEmbed} title="Our location" loading="lazy" />
        </div>
      </div>
    </footer>
  );
}