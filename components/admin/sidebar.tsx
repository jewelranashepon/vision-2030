"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: Icons.home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Members',
    href: '/admin/members',
    icon: Icons.users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Installments',
    href: '/admin/installments',
    icon: Icons.creditCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: Icons.barChart,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
  mobileHidden: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  mobileVisible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      {!isDesktop && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed z-40 top-4 left-4 p-2 rounded-md bg-white shadow-lg lg:hidden"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? (
            <Icons.x className="h-6 w-6 text-gray-700" />
          ) : (
            <Icons.menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      )}

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-black lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isDesktop || isMobileOpen) && (
          <motion.div
            className={cn(
              "fixed lg:relative z-40 flex h-full w-64 flex-col bg-white border-r shadow-xl",
              !isDesktop && "fixed inset-y-0 left-0"
            )}
            variants={isDesktop ? sidebarVariants : {
              hidden: sidebarVariants.mobileHidden,
              visible: sidebarVariants.mobileVisible
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Header with close button for mobile */}
            <motion.div 
              className="flex h-16 items-center justify-between px-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icons.users className="h-8 w-8 text-blue-600" />
                </motion.div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </div>
              
              {/* Close button for mobile */}
              {!isDesktop && (
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 lg:hidden"
                  aria-label="Close sidebar"
                >
                  <Icons.x className="h-6 w-6 text-gray-600" />
                </button>
              )}
            </motion.div>
            
            {/* Navigation */}
            <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => !isDesktop && setIsMobileOpen(false)}
                      className={cn(
                        'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                        isActive
                          ? `${item.bgColor} ${item.color} shadow-lg border-2 border-opacity-20`
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <motion.div
                        whileHover={{ rotate: isActive ? 0 : 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <item.icon
                          className={cn(
                            'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                            isActive ? item.color : 'text-gray-400 group-hover:text-gray-500'
                          )}
                        />
                      </motion.div>
                      {item.name}
                      {isActive && (
                        <motion.div
                          className="ml-auto w-2 h-2 bg-current rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            
            {/* Footer */}
            <motion.div 
              className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Icons.spinner className="mr-3 h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Icons.logOut className="mr-3 h-4 w-4" />
                  )}
                  Logout
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}