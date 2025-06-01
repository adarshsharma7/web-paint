// components/PingDetection.jsx

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const usePingMonitor = (socket) => {

  const [ping, setPing] = useState("check");
  const [status, setStatus] = useState("connected"); // connected, slow, disconnected
  const timeoutRef = useRef(null);
  const tickTimerRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const interval = setInterval(() => {

      const start = Date.now();
      const pingId = Math.random().toString(36).slice(2); // Optional but useful for matching
      if (tickTimerRef.current) clearInterval(tickTimerRef.current);


      tickTimerRef.current = setInterval(() => {
        const now = Date.now();
        if (ping != null && ping != "check") {
          setPing(now - start);
        }
      }, 1000); // latency live update


      const handlePong = () => {
        if (tickTimerRef.current) clearInterval(tickTimerRef.current);
        const latency = Date.now() - start;

        setPing(latency);
        clearTimeout(timeoutRef.current);


        if (latency > 500) {

          toast({
            title: "Network Issue",
            description: "Your network is unstable (High latency)",
          });
        } else {
          setStatus("connected");
        }
      };


      timeoutRef.current = setTimeout(() => {
        toast({
          title: "Trying to reconnect...",
          description: "Your connection is slow or temporarily lost.",
          variant: "destructive",
        });
      }, 4000);


      // ❗ Ye important check add karo
      if (!navigator.onLine || !socket.connected) {
        setStatus("disconnected");
        setPing(null);
        return;
      }

      socket.emit("ping-check", { id: pingId });
      socket.once("pong-check", (data) => {
        if (data?.id === pingId) {
          handlePong(); // Only if correct response
        }
      });

    }, 5000);

    return () => clearInterval(interval);
  }, [socket]);

  const getSignalLevel = () => {
    if (ping === null || status === "disconnected") return 0;
    if (ping < 100) return 3;
    if (ping < 250) return 2;
    return 1;
  };

  return { ping, status, getSignalLevel };
};
