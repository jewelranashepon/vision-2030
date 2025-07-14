"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import {
  User,
  Award,
  DollarSign,
  CreditCard,
  Calendar,
  CalendarDays,
  Clock,
  Trophy,
  Info,
  Target,
  AlertCircle,
  IdCard,
  Loader2,
} from "lucide-react";

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

export function MemberProfile() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/member/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedMonthlyShare =
    profile && profile.paymentCount > 0
      ? Math.round(profile.totalPaid / profile.paymentCount)
      : 0;

  const today = new Date();
  const end = new Date("2030-12-01");
  const start = profile ? new Date(profile.createdAt) : new Date();
  const remainingMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1;

  const targetAmount = estimatedMonthlyShare * remainingMonths;
  const dynamicMembershipProgress =
    targetAmount > 0 && profile
      ? Math.min((profile.totalPaid / targetAmount) * 100, 100)
      : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm w-full max-w-4xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 mx-auto text-rose-500" />
            <h3 className="text-xl font-semibold text-gray-800 mt-4">
              Profile Not Found
            </h3>
            <p className="text-gray-600 mt-2">
              Unable to load member profile data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm overflow-hidden">
          {/* Header with gradient */}
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-white flex items-center">
                <User className="h-6 w-6 mr-3 text-white" />
                Member Dashboard
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                {profile.active ? "Active" : "Inactive"} Member
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Profile Section */}
              <motion.div
                className="lg:col-span-1 space-y-6"
                variants={itemVariants}
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar className="w-28 h-28 mx-auto border-4 border-white shadow-lg">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-3xl font-bold">
                        {profile.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <h3 className="text-2xl font-bold text-gray-800 mt-4">
                    {profile.user.name}
                  </h3>
                  <p className="text-gray-600">{profile.user.email}</p>

                  <div className="mt-4">
                    <Badge
                      variant={profile.active ? "default" : "secondary"}
                      className={`${
                        profile.active
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      } text-sm font-medium`}
                    >
                      {profile.active ? "Active Member" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200 shadow-sm">
                    <div className="text-sm font-medium text-blue-700 flex items-center">
                      <IdCard className="h-4 w-4 mr-2" />
                      Membership ID
                    </div>
                    <div className="text-lg font-bold text-blue-800 mt-1">
                      {profile.membershipId}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Section */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                variants={itemVariants}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl border border-purple-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="py-1 bg-purple-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-purple-700">
                        Total Paid
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-800 mt-2">
                      ৳{profile.totalPaid.toLocaleString()}
                    </div>
                    <div className="text-xs text-purple-500 mt-1">
                      Lifetime contributions
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-4 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl border border-teal-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="py-1 bg-teal-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-teal-600" />
                      </div>
                      <span className="text-sm font-medium text-teal-700">
                        Payments
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-teal-800 mt-2">
                      {profile.paymentCount}
                    </div>
                    <div className="text-xs text-teal-500 mt-1">
                      Total transactions
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-4 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl border border-pink-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="py-1 bg-pink-100 rounded-lg">
                        <CreditCard className="h-5 w-5 text-pink-600" />
                      </div>
                      <span className="text-sm font-medium text-pink-700">
                        Share Amount
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-pink-800 mt-2">
                      ৳{estimatedMonthlyShare.toLocaleString()}
                    </div>
                    <div className="text-xs text-pink-500 mt-1">Per Month</div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="p-4 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl border border-indigo-200 shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="py-1 bg-indigo-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="text-sm font-medium text-indigo-700">
                        Last Payment
                      </span>
                    </div>
                    <div className="text-xl font-bold text-indigo-800 mt-2">
                      {profile.lastPayment
                        ? (() => {
                            try {
                              const [year, month] =
                                profile.lastPayment.split("-");
                              const date = new Date(
                                parseInt(year),
                                parseInt(month) - 1,
                                1
                              );
                              return format(date, "MMM yyyy");
                            } catch (error) {
                              return profile.lastPayment;
                            }
                          })()
                        : "None"}
                    </div>
                    <div className="text-xs text-indigo-500 mt-1">
                      Most recent contribution
                    </div>
                  </motion.div>
                </div>

                {/* Membership Progress */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                      Membership Progress
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-blue-100/50 text-blue-700 border-blue-200 font-medium"
                    >
                      {dynamicMembershipProgress.toFixed(1)}% Complete
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Progress to ৳{targetAmount.toLocaleString()} target
                      </span>
                      <span className="font-semibold text-blue-700">
                        ৳{profile.totalPaid.toLocaleString()} / ৳{targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={dynamicMembershipProgress}
                      className="h-3 bg-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-4 bg-gradient-to-r from-green-100 to-green-50 rounded-xl border border-green-200 shadow-sm"
                    >
                      <div className="text-sm font-medium text-green-700 flex items-center justify-center">
                        <Award className="h-4 w-4 mr-2" />
                        Average Payment
                      </div>
                      <div className="text-xl font-bold text-green-800 mt-1">
                        ৳
                        {profile.paymentCount > 0
                          ? (profile.totalPaid / profile.paymentCount).toFixed(
                              0
                            )
                          : 0}
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl border border-blue-200 shadow-sm"
                    >
                      <div className="text-sm font-medium text-blue-700 flex items-center justify-center">
                        <Target className="h-4 w-4 mr-2" />
                        Remaining
                      </div>
                      <div className="text-xl font-bold text-blue-800 mt-1">
                        ৳
                        {Math.max(
                          0,
                          targetAmount - profile.totalPaid
                        ).toLocaleString()}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
