import { motion } from 'motion/react';

function LoadingSpinner({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-screen"
    >
      <p className="text-lg font-bold mb-4">{text}</p>
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeIn' }}
        className="w-12 h-12 border-4 border-gray-300 border-solid border-t-transparent rounded-full animate-spin"
      />
    </motion.div>
  );
}

export default LoadingSpinner;