"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const actions = [
  {
    title: 'Add New Member',
    description: 'Register a new member to the system',
    icon: Icons.userPlus,
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    href: '/admin/members',
  },
  {
    title: 'Record Payment',
    description: 'Add installment payment for members',
    icon: Icons.creditCard,
    color: 'from-green-500 to-green-600',
    hoverColor: 'hover:from-green-600 hover:to-green-700',
    href: '/admin/installments',
  },
  {
    title: 'View Reports',
    description: 'Generate and download reports',
    icon: Icons.barChart,
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    href: '/admin/reports',
  },
  {
    title: 'Member Analytics',
    description: 'View detailed member statistics',
    icon: Icons.pieChart,
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:from-orange-600 hover:to-orange-700',
    href: '/admin/members',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
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

export function QuickActions() {
  const router = useRouter();

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
          <Icons.activity className="h-6 w-6 mr-3 text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => router.push(action.href)}
                className={`
                  w-full h-auto p-6 bg-gradient-to-r ${action.color} ${action.hoverColor}
                  text-white shadow-lg hover:shadow-xl transition-all duration-300
                  flex flex-col items-center space-y-3 rounded-xl border-0
                `}
              >
                <div className="p-3 bg-white/20 rounded-full">
                  <action.icon className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{action.title}</div>
                  <div className="text-sm opacity-90 mt-1">{action.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}