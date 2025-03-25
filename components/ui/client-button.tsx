"use client";

import { motion } from "framer-motion";

export const ClientButton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="absolute right-7 top-10 z-50"
    >
      <button className="px-5 py-2 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 text-white focus:ring-2 focus:ring-emerald-400 hover:shadow-xl transition duration-200">
  Get Started
</button>
    </motion.div>
  );
};