"use client";

import { motion } from "framer-motion";
import { StatsCards } from "@/components/admin/stats-cards";
import { PaymentChart } from "@/components/admin/payment-chart";
import { RecentPayments } from "@/components/admin/recent-payments";
import { TopMembers } from "@/components/admin/top-members";
import { QuickActions } from "@/components/admin/quick-actions";
import { SystemOverview } from "@/components/admin/system-overview";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

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

export default function AdminDashboard() {
  return (
    <motion.div
      className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        variants={itemVariants}
      >
        {/* Title + Welcome Message */}
        <div className="space-y-1.5">
          <motion.h1
            className="text-4xl font-extrabold leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Admin Dashboard
          </motion.h1>

          {/* Subtitle - Hidden on small screens */}
          <motion.p
            className="text-gray-600 text-base md:text-lg hidden md:block"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Stay updated with your system performance, members, and payments.
          </motion.p>
        </div>

        {/* Right Side: Date + Role - Hidden on small screens */}
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

      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <StatsCards />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <QuickActions />
      </motion.div>

      {/* System Overview */}
      <motion.div variants={itemVariants}>
        <SystemOverview />
      </motion.div>

      {/* Charts Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={itemVariants}
      >
        <PaymentChart />
        <RecentPayments />
      </motion.div>

      {/* Top Members */}
      <motion.div variants={itemVariants}>
        <TopMembers />
      </motion.div>
    </motion.div>
  );
}
