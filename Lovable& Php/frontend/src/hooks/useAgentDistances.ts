import { useState, useEffect, useRef } from 'react';
import { getDistanceToAddress } from '@/lib/distance';

interface AgentDistance {
  distanceKm: number;
  travelTimeMin: number;
}

interface UseAgentDistancesResult {
  distances: Record<string, AgentDistance>;
  isLoading: boolean;
}

/**
 * Hook to calculate distances from user location to multiple agent locations
 * Implements rate limiting to respect Nominatim API limits (1 req/sec)
 */
export function useAgentDistances(
  userLocation: { latitude: number; longitude: number } | null,
  agents: Array<{ id: string; location: string }>
): UseAgentDistancesResult {
  const [distances, setDistances] = useState<Record<string, AgentDistance>>({});
  const [isLoading, setIsLoading] = useState(false);
  const processedRef = useRef<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  // Stabilize agents list by serializing IDs
  const agentKey = agents.map(a => a.id).sort().join(',');

  useEffect(() => {
    if (!userLocation || agents.length === 0) return;

    // Abort any previous run
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const run = async () => {
      const unprocessed = agents.filter(a => !processedRef.current.has(a.id));
      if (unprocessed.length === 0) return;

      setIsLoading(true);

      for (const agent of unprocessed) {
        if (controller.signal.aborted) break;
        if (processedRef.current.has(agent.id)) continue;

        try {
          const result = await getDistanceToAddress(
            userLocation.latitude,
            userLocation.longitude,
            agent.location
          );

          if (result && !controller.signal.aborted) {
            setDistances(prev => ({ ...prev, [agent.id]: result }));
          }
          processedRef.current.add(agent.id);

          // Rate limit: 1 req/sec for Nominatim
          if (!controller.signal.aborted) {
            await new Promise(resolve => setTimeout(resolve, 1100));
          }
        } catch {
          processedRef.current.add(agent.id);
        }
      }

      if (!controller.signal.aborted) setIsLoading(false);
    };

    run();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation?.latitude, userLocation?.longitude, agentKey]);

  return { distances, isLoading };
}
