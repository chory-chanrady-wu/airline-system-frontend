export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export type ApiUser = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  password?: string;
};

export type ApiFlight = {
  id?: string | number;
  flightId?: string | number;
  airline?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  departure?: string;
  arrival?: string;
  price?: number;
  seatsAvailable?: number;
  capacity?: number;
};

const API_PREFIX = "/api/v1";
const PROXY_PREFIX = "/api/backend";

function parseJsonBody<T>(content: string): T | null {
  if (!content) return null;

  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
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

export async function loginWithApi(email: string, password: string) {
  return apiProxy<ApiUser | { user?: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).then((payload) => {
    if (payload && typeof payload === "object" && "user" in payload) {
      return payload.user as ApiUser;
    }
    return payload as ApiUser;
  });
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

export async function fetchFlightsFromApi() {
  const result = await apiProxy<unknown>("/flights", { method: "GET" });
  return unpackArrayResult<ApiFlight>(result);
}

export async function deleteFlightWithApi(flightId: string | number) {
  return apiProxy<unknown>(`/flights/${encodeURIComponent(flightId)}`, {
    method: "DELETE",
  });
}

export async function fetchAirportsFromApi() {
  const result = await apiProxy<unknown>("/airports", { method: "GET" });
  return unpackArrayResult<{
    code?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  }>(result);
}

export async function createAirportWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/airports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAirportWithApi(
  code: string,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(`/airports/${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAirportWithApi(code: string) {
  return apiProxy<unknown>(`/airports/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
}

export async function fetchBookingsFromApi() {
  const result = await apiProxy<unknown>("/bookings", { method: "GET" });
  return unpackArrayResult<unknown>(result);
}

export async function fetchPassengersFromApi() {
  const result = await apiProxy<unknown>("/passengers", { method: "GET" });
  return unpackArrayResult<unknown>(result);
}

export async function fetchDashboardStatsFromApi() {
  return apiProxy<unknown>("/analytics/dashboard", { method: "GET" });
}

export async function createBookingWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createPassengerWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/passengers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchRoutesFromApi() {
  const result = await apiProxy<unknown>("/routes", { method: "GET" });
  return unpackArrayResult<{ from?: string; to?: string; distance?: number }>(
    result,
  );
}

export async function createRouteWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/routes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRouteWithApi(
  from: string,
  to: string,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(
    `/routes/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function deleteRouteWithApi(from: string, to: string) {
  return apiProxy<unknown>(
    `/routes/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    {
      method: "DELETE",
    },
  );
}

export async function searchFlightsFromApi(
  from: string,
  to: string,
  date: string,
) {
  const query = new URLSearchParams({ from, to, date }).toString();
  return apiProxy<unknown>(`/flights/search?${query}`, { method: "GET" });
}

export async function fetchFlightScheduleFromApi(
  from: string,
  to: string,
  date: string,
  start: string,
  end: string,
) {
  const query = new URLSearchParams({ from, to, date, start, end }).toString();
  return apiProxy<unknown>(`/flights/schedule?${query}`, { method: "GET" });
}

export async function deletePassengerWithApi(passengerId: string | number) {
  return apiProxy<unknown>(`/passengers/${passengerId}`, {
    method: "DELETE",
  });
}

export async function cancelBookingWithApi(bookingId: string | number) {
  return apiProxy<unknown>(`/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}
