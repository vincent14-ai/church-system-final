import { useEffect, useState } from "react";
import logo from "./assets/jpcc_logo.svg";

<img src={logo} alt="Logo" />


export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish(); // tells App.jsx it’s done
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen">
      <div className="flex flex-col items-center justify-center w-[30vw] h-[50vh] rounded-2xl bg-slate-900 text-white select-none transition-opacity duration-700">
        <img
          src={logo}
          alt="App Logo"
          className="w-28 h-28 object-contain animate-scale-in"
        />

        <p className="mt-2 text-center opacity-0 animate-fade-in text-sm">
          “But those who trust in the Lord will find new strength.”
          <span className="block text-xs opacity-70">
            — Isaiah 40:31 (NLT)
          </span>
        </p>

        {/* shimmer bar */}
        <div className="w-36 h-1.5 rounded-full mt-6 overflow-hidden bg-slate-700">
          <div className="h-full w-full animate-shimmer bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500"></div>
        </div>
      </div>
    </div>
  );
}
