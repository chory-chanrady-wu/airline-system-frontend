export type RealtimeAction = "created" | "updated" | "deleted";

export type RealtimeEvent = {
  resource: string;
  action: RealtimeAction;
  path: string;
  timestamp: string;
};

type Subscriber = (event: RealtimeEvent) => void;

const subscribers = new Set<Subscriber>();

export function subscribeToRealtimeEvents(subscriber: Subscriber) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

export function publishRealtimeEvent(
  resource: string,
  action: RealtimeAction,
  path: string,
) {
  const event: RealtimeEvent = {
    resource,
    action,
    path,
    timestamp: new Date().toISOString(),
  };

  subscribers.forEach((subscriber) => subscriber(event));
}
