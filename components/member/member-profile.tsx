"use client";

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Icons } from '@/components/icons';
import { format } from 'date-fns';

interface MemberProfile {
  membershipId: string;
  active: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  totalPaid: number;
  paymentCount: number;
  lastPayment: string | null;
}

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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function MemberProfile() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/member/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-32">
            <Icons.spinner className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const membershipProgress = Math.min((profile.totalPaid / 50000) * 100, 100);
  const membershipDuration = Math.floor(
    (new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
          <Icons.users className="h-6 w-6 mr-3 text-blue-600" />
          Member Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Info */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            variants={itemVariants}
          >
            <div className="text-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar className="w-24 h-24 mx-auto border-4 border-blue-200 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white text-2xl font-bold">
                    {profile.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <h3 className="text-xl font-bold text-gray-800 mt-4">{profile.user.name}</h3>
              <p className="text-gray-600">{profile.user.email}</p>
              
              <div className="flex items-center justify-center mt-3">
                <Badge 
                  variant={profile.active ? "default" : "secondary"}
                  className={profile.active ? "bg-green-100 text-green-700" : ""}
                >
                  {profile.active ? 'Active Member' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="text-sm font-medium text-blue-700">Membership ID</div>
                <div className="text-lg font-bold text-blue-800">{profile.membershipId}</div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-sm font-medium text-green-700">Member Since</div>
                <div className="text-lg font-bold text-green-800">
                  {format(new Date(profile.createdAt), 'MMM dd, yyyy')}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {membershipDuration} days ago
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats and Progress */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icons.dollarSign className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Total Paid</span>
                </div>
                <div className="text-2xl font-bold text-purple-800 mt-1">
                  ₹{profile.totalPaid.toLocaleString()}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icons.creditCard className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Payments</span>
                </div>
                <div className="text-2xl font-bold text-orange-800 mt-1">
                  {profile.paymentCount}
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icons.calendar className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Last Payment</span>
                </div>
                <div className="text-lg font-bold text-indigo-800 mt-1">
                  {profile.lastPayment ? (() => {
                    try {
                      const [year, month] = profile.lastPayment.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                      return format(date, 'MMM yyyy');
                    } catch (error) {
                      return profile.lastPayment;
                    }
                  })() : 'None'}
                </div>
              </div>
            </div>

            {/* Membership Progress */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Membership Progress</h4>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {membershipProgress.toFixed(1)}% Complete
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress to ₹50,000 milestone</span>
                  <span className="font-semibold">₹{profile.totalPaid.toLocaleString()} / ₹50,000</span>
                </div>
                <Progress value={membershipProgress} className="h-3" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="text-sm font-medium text-green-700">Average Payment</div>
                  <div className="text-lg font-bold text-green-800">
                    ₹{profile.paymentCount > 0 ? (profile.totalPaid / profile.paymentCount).toFixed(0) : 0}
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-sm font-medium text-blue-700">Remaining</div>
                  <div className="text-lg font-bold text-blue-800">
                    ₹{Math.max(0, 50000 - profile.totalPaid).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}