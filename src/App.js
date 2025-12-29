import React, { useState, useEffect, useMemo } from 'react';
import { Login } from './components/login';
import { PersonalInfo } from './components/personal-info';
import { Attendance } from './components/attendance';
import { Reports } from './components/reports';
import { AttendanceTable } from './components/attendance-table';
import { ThemeToggle } from './components/theme-toggle'; // Kept for mobile header
import { Button } from './components/ui/button';
import {
  User,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  CalendarCheck,
  User2Icon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from "./components/ui/sonner";
import SplashScreen from './components/splash-screen';
import ViewPersonalRecords from './components/view-personal-records';
import { supabase } from './lib/supabaseClient';

// --- IMPORT LOGOS (CORRECTED PATH based on your file structure) ---
import ChurchLogoBlue from './components/assets/LOGO BLUE.png';
import ChurchLogoWhite from './components/assets/LOGO WHITE.png';
// --------------------

export default function App() {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState('personal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Theme management - Restored
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Fallback to stop loading after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Theme Toggle Function - Restored
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    let subscription;

    const setupAuthListener = async () => {
      // Check initial session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = session.user;
        const role = user.user_metadata?.role || 'personal';
        setUser({ email: user.email, role });
        setActiveView(role);
        setLoading(false);
      } else {
        setLoading(false);
      }

      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          const user = session.user;
          const role = user.user_metadata?.role || 'personal';
          setUser({ email: user.email, role });
          setActiveView(role);
          setLoading(false);
        } else {
          setUser(null);
          setActiveView('personal');
          setLoading(false);
        }
      });
      subscription = data.subscription;
    };

    setupAuthListener();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleLogout = () => {
    supabase.auth.signOut();
    setUser(null);
    setActiveView("personal");
    setIsMobileMenuOpen(false);
    localStorage.removeItem("user");
  };

  // Memoized navigation for efficiency
  const navigation = useMemo(() => ([
    {
      id: 'personal',
      label: 'Personal Info',
      icon: User,
      available: user?.role === 'personal'
    },
    {
      id: 'view-personal-records',
      label: 'View Records',
      icon: User2Icon,
      available: user?.role === 'personal'
    },
    {
      id: 'attendance',
      label: 'Attendance Marking',
      icon: Calendar,
      available: user?.role === 'attendance'
    },
    {
      id: 'attendance-table',
      label: 'Attendance Records',
      icon: CalendarCheck,
      available: user?.role === 'attendance'
    },
    {
      id: 'logsandreports',
      label: 'Reports & Logs',
      icon: FileText,
      available: user?.role === 'logsandreports'
    },
  ]), [user?.role]);

  const availableNavigation = navigation.filter(nav => nav.available);

  const ViewComponents = useMemo(() => ({
    'personal': PersonalInfo,
    'view-personal-records': ViewPersonalRecords,
    'attendance': Attendance,
    'attendance-table': AttendanceTable, // The component needing theme logic
    'logsandreports': Reports,
  }), []);

  const CurrentView = ViewComponents[activeView];

  // Dynamic logo selection
  const churchLogo = isDark ? ChurchLogoWhite : ChurchLogoBlue;

  if (!user) {
    return (
      <div className="min-h-screen transition-colors duration-300 dark:bg-gray-900">
        <Login isDark={isDark} onToggleTheme={toggleTheme} />
        <Toaster richColors position="top-right" />
      </div>
    );
  }

  return loading ? (
    <SplashScreen onFinish={() => setLoading(false)} />
  ) : (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-all duration-500">

      {/* Mobile Header - Theme Toggle is KEPT here */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg z-50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <img src={churchLogo} alt="Church Logo" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                JPCC Balayan
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="shadow-sm border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden fixed top-[57px] left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl z-40"
          >
            <div className="p-4 space-y-3">
              {availableNavigation.map((nav, index) => (
                <motion.div
                  key={nav.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant={activeView === nav.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-11 text-base shadow-sm transition-all duration-300 group ${activeView === nav.id
                      ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    onClick={() => {
                      setActiveView(nav.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <nav.icon className={`w-5 h-5 mr-3 transition-all duration-300 ${activeView === nav.id ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                    <span className="flex-1 text-left">
                      {nav.label}
                    </span>
                    {activeView === nav.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full ml-auto"
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: availableNavigation.length * 0.05 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start h-11 text-base shadow-sm transition-all duration-300 group border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3 transition-all duration-300" />
                  <span className="flex-1 text-left">
                    Logout
                  </span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl z-40">
          <div className="p-5 h-full flex flex-col overflow-y-auto sidebar-scroll">

            {/* Header / Logo Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              // The 'items-center' class handles the horizontal centering of children
              className="flex flex-col items-center gap-2 mb-8 p-4 border-b border-gray-200 dark:border-gray-800"
            >
              <img src={churchLogo} alt="Church Logo" className="w-full h-auto object-contain" />

              {/* The H1 tag is now correctly centered by the parent's items-center class */}
              <h1 className="text-sm text-gray-500 dark:text-gray-400 text-center">
                JPCC Members' Information
              </h1>

              {/* The P tag is now correctly centered by the parent's items-center class */}
              <p className="text-sm text-gray-500 dark:text-gray-400">Management System</p>
            </motion.div>

            {/* Navigation */}
            <div className="space-y-2 mb-8 flex-1">
              <h3 className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-3 font-semibold">
                Main Menu
              </h3>
              {availableNavigation.map((nav, index) => (
                <motion.div
                  key={nav.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant={activeView === nav.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-11 text-base transition-all duration-200 group relative ${activeView === nav.id
                      ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 shadow-md text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    onClick={() => setActiveView(nav.id)}
                  >
                    <nav.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-all duration-200 ${activeView === nav.id
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`} />
                    <span className={`flex-1 relative z-10 text-left`}>
                      {nav.label}
                    </span>
                    {activeView === nav.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full ml-2"
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* User Info & Actions */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-5">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 space-y-1 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Logged in as:</p>
                <p className="text-sm font-semibold truncate text-gray-800 dark:text-gray-100">{user.email}</p>
                <span className="text-xs font-medium text-blue-600 capitalize bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50 px-2 py-0.5 rounded-full inline-block">
                  {user.role} Access
                </span>
              </div>

              {/* Desktop Theme Toggle - REMOVED AS REQUESTED */}
              {/*
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <span className="text-sm text-gray-500 dark:text-gray-400">Toggle Theme:</span>
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              </div>
              */}

              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full h-10 shadow-sm border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 overflow-auto pt-[57px] lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950"
            >
              {/* Theme props are passed to ALL child components (PersonalInfo, 
                Attendance, AttendanceTable, Reports, etc.)
              */}
              {CurrentView && <CurrentView isDark={isDark} onToggleTheme={toggleTheme} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/*Global Toaster*/}
      <Toaster richColors position="top-right" />
    </div>
  );
}