"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
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

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      toast.success('Login successful!');
      
      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/member/dashboard');
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              className="flex items-center justify-center mb-4"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Icons.users className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter your credentials to access the membership system
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={itemVariants}
            >
              <motion.div 
                className="space-y-2"
                whileFocus={{ scale: 1.02 }}
              >
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </motion.div>
              
              <motion.div 
                className="space-y-2"
                whileFocus={{ scale: 1.02 }}
              >
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300"
                  required
                />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Icons.spinner className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Icons.users className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </motion.div>
            </motion.form>
            
            <motion.div 
              className="mt-8 text-center text-sm text-gray-600 space-y-3"
              variants={itemVariants}
            >
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-gray-700 mb-2">Demo Credentials:</p>
                <div className="space-y-1">
                  <p><span className="font-medium">Admin:</span> admin@example.com / admin123</p>
                  <p><span className="font-medium">Member:</span> jakir@example.com / member123</p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}