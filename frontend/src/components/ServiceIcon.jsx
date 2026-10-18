import { FiCode, FiWifi, FiHardDrive, FiCpu, FiTrendingUp } from 'react-icons/fi';
const map = { code: FiCode, wifi: FiWifi, hardware: FiHardDrive, cpu: FiCpu, trend: FiTrendingUp };
export default function ServiceIcon({ name, size = 28 }) { const I = map[name] || FiCode; return <I size={size} aria-hidden />; }
