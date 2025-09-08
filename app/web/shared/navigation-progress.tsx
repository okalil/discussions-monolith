import React from "react";
import { useNavigation } from "react-router";

export function NavigationProgress() {
  const [progress, setProgress] = React.useState(0);
  const { state } = useNavigation();

  React.useEffect(() => {
    if (state === "loading") {
      const timer = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.05 * Math.pow(1 - Math.sqrt(prev), 2);
          return Math.min(next, 1);
        });
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [state]);
  React.useEffect(() => {
    if (state === "idle" && progress > 0) {
      setProgress(1);
      const timer = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(timer);
    }
  }, [state, progress]);

  if (!progress) return null;

  return (
    <div className="h-1 fixed z-30 top-0 left-0 right-0">
      <div
        className="bg-blue-700 h-full transition-all"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
