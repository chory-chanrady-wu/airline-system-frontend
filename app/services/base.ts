import type {
  ApiAirport,
  ApiBooking,
  ApiFlight,
  ApiPassenger,
  ApiRole,
  ApiRoute,
  ApiUser,
  ApiSession,
} from "../ustils/type";

export const API_PREFIX = "/api/v1";
export const PROXY_PREFIX = "/api/backend";

export function parseJsonBody<T>(content: string): T | null {
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const value = payload as {
      message?: string;
      error?: string;
      data?: { message?: string; error?: string };
    };

    if (value.message) return value.message;
    if (value.error) return value.error;
    if (value.data && typeof value.data === "object") {
      if (value.data.message) return value.data.message;
      if (value.data.error) return value.data.error;
    }
  }

  return fallback;
}

export function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === "object") {
    const value = payload as {
      data?: T;
      result?: T;
      success?: boolean;
    };

    if ("data" in value) return (value.data ?? payload) as T;
    if ("result" in value) return (value.result ?? payload) as T;
    if ("success" in value && !("message" in value || "error" in value)) {
      return payload as T;
    }
  }

  return payload as T;
}

export async function apiProxy<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${PROXY_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const rawText = await response.text();
  const payload = parseJsonBody<T>(rawText);

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload,
        `Request failed with status ${response.status}.`,
      ),
    );
  }

  return unwrapApiData<T>(payload ?? (rawText as unknown as T));
}

export function buildBackendUrl(path: string) {
  return `${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
}

export function unpackArrayResult<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];

  if (result && typeof result === "object") {
    const value = result as {
      data?: T[];
      result?: T[];
      items?: T[];
      records?: T[];
    };

    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.result)) return value.result;
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.records)) return value.records;
  }

  return [] as T[];
}

export type ApiModuleTypes = {
  ApiAirport: ApiAirport;
  ApiBooking: ApiBooking;
  ApiFlight: ApiFlight;
  ApiPassenger: ApiPassenger;
  ApiRole: ApiRole;
  ApiRoute: ApiRoute;
  ApiUser: ApiUser;
  ApiSession: ApiSession;
};
