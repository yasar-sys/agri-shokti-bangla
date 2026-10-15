import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (reduceMotion) { setDisplay(value); return; }
    const controls = animate(0, value, { duration: 0.32, onUpdate: (latest) => setDisplay(Math.round(latest)) });
    return () => controls.stop();
  }, [value, reduceMotion]);
  return <span className="font-mono tabular-nums">{display}{suffix}</span>;
}

export function Waveform({ active = false }: { active?: boolean }) {
  const reduced = useReducedMotion();
  return <div className="waveform" aria-hidden="true">
    {[8, 12, 20, 30, 16, 40, 24, 48, 32, 20, 38, 52, 28, 44, 22, 34, 18, 26, 12, 8].map((height, index) => (
      <motion.span key={index} initial={false} animate={{ height: active && !reduced ? height : Math.max(4, height * 0.45) }} transition={{ duration: 0.28 }} />
    ))}
  </div>;
}

export function CropLine({ className = "" }: { className?: string }) {
  return <svg className={className} width="100" height="120" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M46 113C48 88 54 54 69 14M47 100C31 78 22 62 20 42M50 83C66 68 79 56 83 35M45 107C64 90 75 79 87 75" />
    <path d="M61 35C49 35 48 25 52 24C58 22 63 30 61 35ZM65 25C58 19 60 10 64 11C69 13 70 20 65 25ZM66 29C76 26 80 32 77 36C73 41 67 38 66 29ZM56 48C44 48 42 38 47 37C54 35 58 43 56 48ZM59 44C70 39 75 45 71 50C66 55 61 51 59 44ZM52 61C39 60 38 51 43 50C49 49 55 56 52 61ZM55 59C64 54 69 59 66 64C61 69 56 67 55 59Z" />
    <path d="M30 73C18 71 12 62 16 59C22 56 29 66 30 73ZM35 83C38 69 45 64 48 69C51 75 41 84 35 83ZM67 90C72 77 80 75 83 80C85 86 75 92 67 90" />
  </svg>;
}