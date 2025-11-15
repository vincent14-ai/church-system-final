import { useMemo } from "react";

const loadingTexts = [
  "Be still and trust God — His timing is perfect.",
  "Those who wait on the Lord find new strength.",
  "Patience guards your heart and keeps you steady.",
  "The Lord is good to those who wait on Him.",
  "Let patience grow — it shapes your character."
];

export default function LoadingScreen() {
  const text = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * loadingTexts.length);
    return loadingTexts[randomIndex];
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 text-white bg-background/80 backdrop-blur-md z-[9999]">
      <div className="w-20 h-20 rounded-full animate-pulse bg-gradient-to-br from-primary/60 to-primary/30" />
      <p className="mt-4 text-muted-foreground text-sm text-center px-4 italic">
        {text}
      </p>
    </div>
  );
}
