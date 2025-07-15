"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/icons";

interface DashboardStats {
  totalMembers: number;
  totalCollection: number;
  totalPending: number;
  thisMonthCollection: number;
}

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

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalCollection: 0,
    totalPending: 0,
    thisMonthCollection: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Icons.users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "Total Collection",
      value: `৳${stats.totalCollection.toLocaleString()}`,
      icon: Icons.dollarSign,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      textColor: "text-green-700",
      change: "+8.2%",
      changeColor: "text-green-600",
    },
    {
      title: "Pending Amount",
      value: `৳${stats.totalPending.toLocaleString()}`,
      icon: Icons.alertCircle,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      textColor: "text-orange-700",
      change: "-3.1%",
      changeColor: "text-red-600",
    },
    {
      title: "This Month",
      value: `৳${stats.thisMonthCollection.toLocaleString()}`,
      icon: Icons.trendingUp,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
      change: "+15.3%",
      changeColor: "text-green-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          whileHover={{ scale: 1.04, y: -4 }}
          whileTap={{ scale: 0.96 }}
        >
          <Card
            className={`relative border-0 overflow-hidden group 
              bg-gradient-to-br ${card.bgGradient} shadow-lg
              transition-transform duration-300 rounded-2xl
            `}
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-300 rounded-2xl pointer-events-none" />

            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start">
                {/* Text Section */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-600 tracking-wide">
                    {card.title}
                  </p>
                  <p className={`text-3xl font-extrabold ${card.textColor}`}>
                    {card.value}
                  </p>
                  <div className="flex items-center space-x-1 text-sm">
                    <span className={`font-medium ${card.changeColor}`}>
                      {card.change}
                    </span>
                    <span className="text-gray-500">vs last month</span>
                  </div>
                </div>

                {/* Icon */}
                <motion.div
                  className={`p-3 rounded-full ${card.iconBg} shadow-md`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </motion.div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${card.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${60 + index * 10}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
