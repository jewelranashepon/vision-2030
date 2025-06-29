"use client";

import { motion } from 'framer-motion';
import { MemberStats } from '@/components/member/member-stats';
import { PaymentHistory } from '@/components/member/payment-history';
import { PaymentChart } from '@/components/member/payment-chart';
import { MemberProfile } from '@/components/member/member-profile';

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

export default function MemberDashboard() {
  return (
    <motion.div
      className="p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div className="space-y-2">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            My Dashboard
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Welcome to your member portal. Track your payments and membership details.
          </motion.p>
        </div>
        
        <motion.div 
          className="text-right"
          variants={itemVariants}
        >
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-lg font-semibold text-gray-700 mt-1">
            Welcome back!
          </div>
        </motion.div>
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div variants={itemVariants}>
        <MemberStats />
      </motion.div>

      {/* Profile Section */}
      <motion.div variants={itemVariants}>
        <MemberProfile />
      </motion.div>
      
      {/* Charts and History Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={itemVariants}
      >
        <PaymentChart />
        <PaymentHistory />
      </motion.div>
    </motion.div>
  );
}