import { useState, useEffect } from 'react';
import { queueService } from '../services/QueueService';

/**
 * Hook for managing queue status
 */
export function useQueue(options?: string | { doctorId?: string; date?: string }) {
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateParam = typeof options === "object" ? options?.date : undefined;
  const doctorIdParam = typeof options === "string" ? options : options?.doctorId;

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queueService.getQueueStatus({
        doctorId: doctorIdParam,
        date: dateParam,
      });
      setQueue(data);
    } catch (err) {
      setError("Failed to fetch queue status");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();

    const handleLocalSync = () => {
      fetchQueue();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "medirxcare:last_appointment_booking") {
        fetchQueue();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchQueue();
      }
    };

    window.addEventListener("medirxcare:appointment-booked", handleLocalSync);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel("medirxcare_sync");
        channel.onmessage = (event) => {
          if (event.data?.type === "APPOINTMENT_BOOKED") {
            fetchQueue();
          }
        };
      } catch (_e) {}
    }

    const interval = setInterval(fetchQueue, 20000);

    return () => {
      window.removeEventListener("medirxcare:appointment-booked", handleLocalSync);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (channel) {
        channel.close();
      }
      clearInterval(interval);
    };
  }, [dateParam, doctorIdParam]);

  return { queue, loading, error, refresh: fetchQueue };
}
