"use client";

import { useEffect, useRef } from "react";
import type { RealtimeEvent } from "../services/realtime";

export function useRealtimeRefresh(
  resource: string,
  refresh: (event?: RealtimeEvent) => void | Promise<void>,
) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    const events = new EventSource(
      `/api/events?resource=${encodeURIComponent(resource)}`,
    );

    events.onmessage = (message) => {
      try {
        const event = JSON.parse(message.data) as RealtimeEvent;
        void refreshRef.current(event);
      } catch {
        // Ignore malformed events and keep the stream connected.
      }
    };

    return () => events.close();
  }, [resource]);
}
