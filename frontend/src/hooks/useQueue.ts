import { useState, useEffect } from 'react';
import { queueService } from '../services/QueueService';

/**
 * Hook for managing queue status
 */
export function useQueue() {
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await queueService.getQueueStatus();
      setQueue(data);
    } catch (err) {
      setError('Failed to fetch queue status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  return { queue, loading, error, refresh: fetchQueue };
}
