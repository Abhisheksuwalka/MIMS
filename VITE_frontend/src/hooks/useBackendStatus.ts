import { BASE_URL } from "@/env";
import { useEffect, useState } from "react";

export type BackendStatus = "online" | "offline" | "checking";

/**
 * Hook to check backend health status
 * Pings the backend every 30 seconds
 */
export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${BASE_URL}/health`, {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        setStatus(response.ok ? "online" : "offline");
      } catch (error) {
        setStatus("offline");
      }
    };

    // Check only once on mount
    checkHealth();
  }, []);

  return status;
}
