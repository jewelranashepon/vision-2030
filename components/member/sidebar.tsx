// "use client";

// import { motion } from 'framer-motion';
// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Icons } from '@/components/icons';
// import { toast } from 'sonner';

// const navigation = [
//   {
//     name: 'Dashboard',
//     href: '/member/dashboard',
//     icon: Icons.home,
//     color: 'text-blue-600',
//     bgColor: 'bg-blue-50',
//   },
//   {
//     name: 'My Installments',
//     href: '/member/installments',
//     icon: Icons.creditCard,
//     color: 'text-green-600',
//     bgColor: 'bg-green-50',
//   },
// ];

// const sidebarVariants = {
//   hidden: { x: -300, opacity: 0 },
//   visible: {
//     x: 0,
//     opacity: 1,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { x: -20, opacity: 0 },
//   visible: {
//     x: 0,
//     opacity: 1,
//     transition: {
//       duration: 0.3,
//       ease: "easeOut",
//     },
//   },
// };

// export function MemberSidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogout = async () => {
//     setIsLoading(true);
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' });
//       toast.success('Logged out successfully');
//       router.push('/login');
//     } catch (error) {
//       toast.error('Logout failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       className="flex h-full w-64 flex-col bg-white border-r shadow-xl"
//       variants={sidebarVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       {/* Header */}
//       <motion.div 
//         className="flex h-16 items-center px-6 border-b bg-gradient-to-r from-green-50 to-blue-50"
//         variants={itemVariants}
//       >
//         <motion.div
//           whileHover={{ scale: 1.1, rotate: 360 }}
//           transition={{ duration: 0.6 }}
//         >
//           <Icons.users className="h-8 w-8 text-green-600" />
//         </motion.div>
//         <span className="ml-3 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//           Member Portal
//         </span>
//       </motion.div>
      
//       {/* Navigation */}
//       <nav className="flex-1 space-y-2 px-4 py-6">
//         {navigation.map((item, index) => {
//           const isActive = pathname === item.href;
//           return (
//             <motion.div
//               key={item.name}
//               variants={itemVariants}
//               whileHover={{ scale: 1.02, x: 5 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               <Link
//                 href={item.href}
//                 className={cn(
//                   'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
//                   isActive
//                     ? `${item.bgColor} ${item.color} shadow-lg border-2 border-opacity-20`
//                     : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
//                 )}
//               >
//                 <motion.div
//                   whileHover={{ rotate: isActive ? 0 : 360 }}
//                   transition={{ duration: 0.6 }}
//                 >
//                   <item.icon
//                     className={cn(
//                       'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
//                       isActive ? item.color : 'text-gray-400 group-hover:text-gray-500'
//                     )}
//                   />
//                 </motion.div>
//                 {item.name}
//                 {isActive && (
//                   <motion.div
//                     className="ml-auto w-2 h-2 bg-current rounded-full"
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ duration: 0.3 }}
//                   />
//                 )}
//               </Link>
//             </motion.div>
//           );
//         })}
//       </nav>
      
//       {/* Footer */}
//       <motion.div 
//         className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100"
//         variants={itemVariants}
//       >
//         <motion.div
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//         >
//           <Button
//             onClick={handleLogout}
//             variant="ghost"
//             className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
//             disabled={isLoading}
//           >
//             {isLoading ? (
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//               >
//                 <Icons.spinner className="mr-3 h-4 w-4" />
//               </motion.div>
//             ) : (
//               <Icons.logOut className="mr-3 h-4 w-4" />
//             )}
//             Logout
//           </Button>
//         </motion.div>
//       </motion.div>
//     </motion.div>
//   );
// }



























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
    href: '/member/dashboard',
    icon: Icons.home,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'My Installments',
    href: '/member/installments',
    icon: Icons.creditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
  exit: {
    x: -300,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn",
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

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function MemberSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
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

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md md:hidden"
          aria-label="Open sidebar"
        >
          <Icons.menu className="h-6 w-6 text-gray-700" />
        </button>
      )}

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={toggleMobileSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || isMobileOpen) && (
          <motion.div
            className={cn(
              "fixed md:relative z-40 flex h-full w-64 flex-col bg-white border-r shadow-xl",
              isMobile ? "fixed inset-y-0 left-0" : ""
            )}
            variants={sidebarVariants}
            initial={isMobile ? "hidden" : "visible"}
            animate="visible"
            exit={isMobile ? "exit" : "visible"}
          >
            {/* Header */}
            <motion.div 
              className="flex h-16 items-center px-6 border-b bg-gradient-to-r from-green-50 to-blue-50"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icons.users className="h-8 w-8 text-green-600" />
              </motion.div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Member Portal
              </span>
              {isMobile && (
                <button
                  onClick={toggleMobileSidebar}
                  className="ml-auto p-1 rounded-md hover:bg-gray-100"
                  aria-label="Close sidebar"
                >
                  <Icons.x className="h-5 w-5 text-gray-500" />
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
                      onClick={() => isMobile && setIsMobileOpen(false)}
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