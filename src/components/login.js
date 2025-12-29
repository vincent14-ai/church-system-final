import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './theme-toggle';
import { supabase } from '../lib/supabaseClient';

// Import both image files
import ChurchLogoBlue from './assets/LOGO BLUE.png'; 
import ChurchLogoWhite from './assets/LOGO WHITE.png';

export function Login({ isDark, onToggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const user = data.user;
      const role = user.user_metadata?.role || 'personal';

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "The email or password you entered is incorrect. Please try again.");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-4 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* NEW APPROACH: Set the default text color for the whole Card */}
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm **text-gray-800 dark:text-white**">
          <CardHeader className="text-center space-y-6 pb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
             // w-24 h-24 (96px)
             className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <img
                src={isDark ? ChurchLogoWhite : ChurchLogoBlue} 
                alt="Church Logo"
                className="w-full h-full object-contain" 
              />
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-3xl bg-gradient-to-r from-primary/90 dark:from-white/90 to-primary dark:to-white bg-clip-text text-transparent">
             
               </CardTitle>
              {/* Reset CardDescription to inherit (or use text-white if necessary) */}
              <CardDescription className="text-base text-black-800 dark:text-white">
                JPCC Members' Information Management System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  {/* Reset Label to inherit the Card's text color */}
                  <Label htmlFor="email" className="text-sm font-medium text-black-800 dark:text-white">
                    Email Address
                  </Label>
                  <div className="relative">
                    {/* The icon must remain muted to look nice */}
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-input-background"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
  <Label htmlFor="password" className="text-sm font-medium text-black-800 dark:text-white">
    Password
  </Label>
  <div className="relative">
    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      id="password"
      type={showPassword ? "text" : "password"}
      placeholder="Enter your password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      /* Added pr-12 to prevent text from overlapping your custom button */
      className="pl-10 pr-12 h-12 bg-input-background hide-password-toggle"
      required
    />
    <Button
      type="button"
      variant="ghost"
      size="sm"
      /* Higher z-index to stay on top */
      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 z-10 hover:bg-transparent"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4 text-muted-foreground" />
      ) : (
        <Eye className="w-4 h-4 text-muted-foreground" />
      )}
    </Button>
  </div>
</div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                >
                  {/* Reset error text color to destructive */}
                  <p className="text-destructive text-sm text-center text-black-800 dark:text-white">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                // The button text MUST be explicitly white as the background is colored
                className="w-full h-12 text-base text-black-800 dark:text-white bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}