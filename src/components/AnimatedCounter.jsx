import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);

    const id = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(id);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}