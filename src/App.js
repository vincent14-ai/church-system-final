import React, { useState, useEffect, useRef } from 'react';
import { Login } from './components/login';
import { PersonalInfo } from './components/personal-info';
import { Attendance } from './components/attendance';
import { Reports } from './components/reports';
import { AttendanceTable } from './components/attendance-table';
import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import {
  Church,
  User,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  CalendarCheck,
  User2Icon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from "./components/ui/sonner";
import SplashScreen from './components/splash-screen';
import ViewPersonalRecords from './components/view-personal-records';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [activeView, setActiveView] = useState('personal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fallback to stop loading after 5 seconds in case splash screen hangs
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  // no-op mount effect (kept for structure)
  useEffect(() => { }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        const user = session.user;
        const role = user.user_metadata?.role || 'personal';
        setUser({ email: user.email, role });
        setActiveView(role);
      } else {
        // Trigger logout when session is null (e.g., token not refreshed or expired)
        // Only call handleLogout if user is currently logged in to prevent loops
        if (user) {
          handleLogout();
        }
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = session.user;
        const role = user.user_metadata?.role || 'personal';
        setUser({ email: user.email, role });
        setActiveView(role);
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const handleLogout = () => {
    supabase.auth.signOut();
    setUser(null);
    setActiveView("personal");
    setIsMobileMenuOpen(false);
    localStorage.removeItem("user");
  };

  const navigation = [
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
      label: 'Attendance',
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
      label: 'Reports',
      icon: FileText,
      available: user?.role === 'logsandreports'
    },
  ];

  const availableNavigation = navigation.filter(nav => nav.available);

  if (!user) {
    return (
      <div className="min-h-screen transition-colors duration-300">
        <Login isDark={isDark} onToggleTheme={toggleTheme} />
      </div>
    );
  }

  return loading ? (
    <SplashScreen onFinish={() => setLoading(false)} />
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 transition-all duration-500">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
              <Church className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                JPCC Balayan
              </h1>
              <p className="text-xs text-muted-foreground">Church Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="shadow-sm"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
            className="lg:hidden fixed top-16 left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border/50 z-40"
          >
            <div className="p-4 space-y-3">
              {availableNavigation.map((nav, index) => (
                <motion.div
                  key={nav.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={activeView === nav.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-11 shadow-sm transition-all duration-300 group ${activeView === nav.id
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground'
                      : 'hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/50 hover:shadow-md hover:scale-[1.02]'
                      }`}
                    onClick={() => {
                      setActiveView(nav.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <nav.icon className={`w-4 h-4 mr-3 transition-all duration-300 ${activeView === nav.id
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                      }`} />
                    <span className={`transition-all duration-300 ${activeView !== nav.id ? 'group-hover:translate-x-1' : ''
                      }`}>
                      {nav.label}
                    </span>
                    {activeView === nav.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-primary-foreground rounded-full ml-auto"
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: availableNavigation.length * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start h-11 shadow-sm transition-all duration-300 group hover:bg-destructive/10 hover:border-destructive/50 hover:shadow-md hover:scale-[1.02]"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3 transition-all duration-300 text-muted-foreground group-hover:text-destructive group-hover:scale-110" />
                  <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-destructive">
                    Logout
                  </span>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Desktop Sidebar - Fixed */}
        <div className="hidden lg:block w-72 fixed left-0 top-0 h-screen bg-card/95 backdrop-blur-md border-r border-border/50 shadow-xl z-40">
          <div className="p-6 h-full flex flex-col overflow-y-auto sidebar-scroll">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/20"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Church className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  JPCC Balayan
                </h1>
                <p className="text-sm text-muted-foreground">Church Management System</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="space-y-3 mb-8 flex-1">
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground px-3 mb-4">
                Navigation
              </h3>
              {availableNavigation.map((nav, index) => (
                <motion.div
                  key={nav.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={activeView === nav.id ? 'default' : 'ghost'}
                    className={`w-full justify-start h-12 text-left transition-all duration-300 group relative overflow-hidden ${activeView === nav.id
                      ? 'bg-gradient-to-r from-primary to-primary/90 shadow-lg text-primary-foreground'
                      : 'hover:bg-gradient-to-r hover:from-accent/80 hover:to-accent/50 hover:shadow-md hover:scale-[1.02] text-foreground hover:text-accent-foreground'
                      }`}
                    onClick={() => setActiveView(nav.id)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 transition-opacity duration-300 ${activeView !== nav.id ? 'group-hover:opacity-100' : ''
                      }`} />
                    <nav.icon className={`w-5 h-5 mr-3 flex-shrink-0 transition-all duration-300 ${activeView === nav.id
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                      }`} />
                    <span className={`flex-1 relative z-10 transition-all duration-300 ${activeView === nav.id
                      ? 'text-primary-foreground'
                      : 'group-hover:translate-x-1'
                      }`}>
                      {nav.label}
                    </span>
                    {activeView === nav.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-primary-foreground rounded-full ml-2"
                      />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* User Info & Actions */}
            <div className="space-y-4 border-t border-border/50 pt-6">
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground mb-2">Logged in as:</p>
                <p className="text-sm truncate">{user.email}</p>
                <p className="text-xs text-primary capitalize bg-primary/10 px-2 py-1 rounded-md inline-block">
                  {user.role} Access
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full h-10 shadow-sm hover:shadow-md transition-all duration-300 group hover:bg-destructive/10 hover:border-destructive/50 hover:scale-[1.02]"
                >
                  <LogOut className="w-4 h-4 mr-2 transition-all duration-300 text-muted-foreground group-hover:text-destructive group-hover:scale-110" />
                  <span className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-destructive">
                    Sign Out
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-72 overflow-auto pt-16 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="min-h-screen bg-gradient-to-br from-background/50 to-muted/20"
            >
              {activeView === 'personal' && <PersonalInfo isDark={isDark} onToggleTheme={toggleTheme} />}
              {activeView === 'view-personal-records' && <ViewPersonalRecords isDark={isDark} onToggleTheme={toggleTheme} />}
              {activeView === 'attendance' && <Attendance isDark={isDark} onToggleTheme={toggleTheme} />}
              {activeView === 'attendance-table' && <AttendanceTable isDark={isDark} onToggleTheme={toggleTheme} />}
              {activeView === 'logsandreports' && <Reports isDark={isDark} onToggleTheme={toggleTheme} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/*Global Toaster*/}
      <Toaster richColors position="top-right" />
    </div>
  );
}