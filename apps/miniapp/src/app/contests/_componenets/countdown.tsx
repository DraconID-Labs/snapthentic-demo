"use client";

import { useEffect, useState } from "react";

type Props = {
  endDate: Date;
};

export function Countdown({ endDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      setTimeLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="flex items-center gap-1">
      <p className="text-sm text-gray-500">{days}d</p>
      <p className="text-sm text-gray-500">{hours}h</p>
      <p className="text-sm text-gray-500">{minutes}m</p>
      <p className="text-sm text-gray-500">{seconds}s</p>
    </div>
  );
}
