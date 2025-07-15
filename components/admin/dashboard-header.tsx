"use client";

import { motion } from "framer-motion";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function DashboardHeader() {
  return (
    <motion.div
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      variants={itemVariants}
    >
      {/* Title + Subtitle */}
      <div className="space-y-1.5">
        <motion.h1
          className="text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Admin Dashboard
        </motion.h1>

        {/* Hidden on mobile */}
        <motion.p
          className="text-gray-600 text-base md:text-lg hidden md:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Stay updated with your system performance, members, and payments.
        </motion.p>
      </div>

      {/* Right Side - Hidden on small screens */}
      <motion.div
        className="flex-col text-right space-y-1 hidden md:flex"
        variants={itemVariants}
      >
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div className="text-gray-700 text-lg font-semibold">
          Welcome back, <span className="text-indigo-600">Admin</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
