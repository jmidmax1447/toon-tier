import { motion } from 'framer-motion';

const pageTransition = {
  duration: 0.4,
  ease: 'easeInOut',
};

export default function PageWrapper({ children }) {
  return (
    <motion.div
      className="tt-page-wrapper"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
