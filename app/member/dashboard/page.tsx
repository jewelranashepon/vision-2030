"use client";

import { motion } from "framer-motion";
import { MemberStats } from "@/components/member/member-stats";
import { PaymentHistory } from "@/components/member/payment-history";
import { PaymentChart } from "@/components/member/payment-chart";
import { MemberProfile } from "@/components/member/member-profile";

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
      className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Section */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
      >
        <MemberProfile />
      </motion.div>

      {/* Charts and History Section */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 h-[600px]"
          whileHover={{ y: -5 }}
        >
          <PaymentChart />
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 h-[600px] overflow-auto"
          whileHover={{ y: -5 }}
        >
          <PaymentHistory />
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center text-sm text-gray-500 pt-8"
        variants={itemVariants}
      >
        <p>Need help? Contact our support team at support@example.com</p>
      </motion.div>
    </motion.div>
  );
}
