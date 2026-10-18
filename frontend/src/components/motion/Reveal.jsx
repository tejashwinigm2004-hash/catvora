import { Children } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const dirs = { up: { y: 32 }, down: { y: -32 }, left: { x: 40 }, right: { x: -40 }, none: {} };
const ease = [0.22, 1, 0.36, 1];

// Fades and slides one block in when it scrolls into view
export function Reveal({ children, delay = 0, from = 'up', className = '' }) {
  const still = useReducedMotion();
  if (still) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...dirs[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

// Reveals each child one after another (use it as the grid itself)
export function Stagger({ children, className = '', gap = 0.1 }) {
  const still = useReducedMotion();
  if (still) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {Children.map(children, (c) => (
        <motion.div variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}>
          {c}
        </motion.div>
      ))}
    </motion.div>
  );
}