import { useState, useEffect } from "react";

export const useCountdown = (targetDate?: string) => {
  const [state, setState] = useState<{
    isExpired: boolean;
    timeLeft: string;
  }>({
    isExpired: false,
    timeLeft: "",
  });

  const calculateTimeLeft = () => {
    if (!targetDate) return null;

    const difference = +new Date(targetDate) - +new Date();
    let newTimeLeft = "";

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      if (hours > 0) {
        newTimeLeft = `${hours}h ${minutes}m`;
      } else {
        newTimeLeft = `${minutes}m ${seconds}s`;
      }
    }

    return newTimeLeft || null;
  };

  const recalculateState = () => {
    if (state.isExpired) return;
    const timeLeft = calculateTimeLeft();

    setState({
      isExpired: timeLeft === null,
      timeLeft: timeLeft ?? "",
    });
  };

  useEffect(() => {
    if (!targetDate) return;
    recalculateState();
    const timer = setInterval(() => {
      recalculateState();
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return state;
};
