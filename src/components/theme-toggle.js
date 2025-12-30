import React, { useState, useEffect } from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 1. Mocked Button Component (Replacement for './ui/button') ---
const Button = React.forwardRef(({ className, variant, size, onClick, children, ...props }, ref) => {
  let baseClasses = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const sizeClasses = {
    'icon': 'h-10 w-10',
    'default': 'h-10 py-2 px-4',
  }[size] || 'h-10 py-2 px-4';

  const variantClasses = {
    'outline': 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-800 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
  }[variant] || '';

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

// --- 2. ThemeToggle Component (Icon Animation) ---
// Note: onToggle now expects the click event (e)
export function ThemeToggle({ isDark, onToggle }) {
  return (
    <Button
      variant="outline"
      size="icon"
      // Pass the click event to the handler
      onClick={onToggle} 
      className="
        relative overflow-hidden group 
        transition-all duration-300
        dark:bg-transparent dark:border-white/30 dark:hover:bg-white/10
        border-gray-300 bg-white/80 hover:bg-white
        shadow-lg
      "
    >
      {/* SUN ICON: Light mode appearance. */}
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? 180 : 0,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-amber-500" />
      </motion.div>
      
      {/* MOON ICON: Dark mode appearance. */}
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : -180,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-indigo-300" />
      </motion.div>
    </Button>
  );
}

// --- 3. Circular Reveal Overlay Component ---
const CircularRevealOverlay = ({ x, y, targetIsDark, onRevealComplete }) => {
  // The color of the expanding circle should match the *target* background color
  const bgColor = targetIsDark ? 'bg-gray-950' : 'bg-gray-100';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 150 }} // Scale up 150x to cover the entire screen
      exit={{ scale: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 100, 
        damping: 20, 
        duration: 0.7 
      }}
      onAnimationComplete={onRevealComplete}
      style={{
        top: y,
        left: x,
        width: '10px', // Initial small size for the ripple effect
        height: '10px',
      }}
      className={`fixed ${bgColor} rounded-full transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none`}
    />
  );
};


// --- 4. Main Application Component ---
const App = () => {
  // Initialize theme state based on system preference or saved setting
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // State to manage the circular reveal animation: { x: number, y: number, targetIsDark: boolean }
  const [reveal, setReveal] = useState(null); 

  const handleRevealComplete = () => {
    // Clear the reveal state once the animation is complete (700ms)
    setReveal(null);
  };

  const handleThemeToggle = (e) => {
    // Check if e is defined and has getBoundingClientRect (for robustness)
    if (!e || !e.currentTarget || reveal) return; 

    // 1. Calculate the click position (center of the button)
    const rect = e.currentTarget.getBoundingClientRect();
    // Get the center of the button relative to the viewport
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const targetIsDark = !isDark;
    
    // 2. Start the reveal animation from the calculated point
    setReveal({ x, y, targetIsDark });

    // 3. Update the theme class and state mid-animation (300ms)
    // This allows the expanding circle to carry the new color
    setTimeout(() => {
      setIsDark(targetIsDark);
    }, 300); 
  };

  // Effect to apply 'dark' class to the HTML element and save preference
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col items-center justify-center p-4 antialiased">
      
      {/* Main Content Card */}
      <div 
        className="
          w-full max-w-lg p-8 md:p-12 rounded-3xl 
          bg-white dark:bg-gray-800 
          shadow-2xl dark:shadow-indigo-900/50 
          text-gray-900 dark:text-gray-100
          transition-colors duration-500 ease-in-out
          flex flex-col items-center space-y-8
        "
      >
        <div className="flex items-center space-x-3 text-2xl font-bold">
            <Zap className="h-6 w-6 text-indigo-500" />
            <span>Circular Reveal Theme</span>
        </div>
        
        <p className="text-center text-lg leading-relaxed">
          The theme changes with a circular ripple that begins exactly at the button you click.
        </p>

        <ThemeToggle isDark={isDark} onToggle={handleThemeToggle} />
        
        <p className="text-sm font-mono text-center opacity-70">
            Current Mode: <span className="font-semibold">{isDark ? 'Dark' : 'Light'}</span>
        </p>

      </div>
      
      <div className="absolute top-4 right-4 md:right-8 md:top-8">
        {/* Important: Both buttons use the same handler */}
        <ThemeToggle isDark={isDark} onToggle={handleThemeToggle} />
      </div>

      {/* RENDER THE CIRCULAR REVEAL OVERLAY */}
      <AnimatePresence>
        {reveal && (
          <CircularRevealOverlay 
            x={reveal.x} 
            y={reveal.y} 
            targetIsDark={reveal.targetIsDark}
            onRevealComplete={handleRevealComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;