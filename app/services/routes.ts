import type { ApiRoute } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

export async function fetchRoutesFromApi() {
  const result = await apiProxy<unknown>("/routes", { method: "GET" });
  return unpackArrayResult<ApiRoute>(result);
}

export async function fetchRouteFromApi(from: string, to: string) {
  return apiProxy<unknown>(
    `/routes/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
    { method: "GET" },
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

export async function fetchRouteDistanceFromApi(from: string, to: string) {
  return apiProxy<unknown>(
    `/routes/${encodeURIComponent(from)}/${encodeURIComponent(to)}/distance`,
    { method: "GET" },
  );
}

export async function optimizeRouteFromApi(
  from: string,
  to: string,
  type = "cheapest",
) {
  const query = new URLSearchParams({ from, to, type }).toString();
  return apiProxy<unknown>(`/routes/optimize?${query}`, { method: "GET" });
}
