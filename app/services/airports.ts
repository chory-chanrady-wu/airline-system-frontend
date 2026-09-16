import type { ApiAirport } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

export async function fetchAirportsFromApi(search?: string) {
  const query = search ? `?${new URLSearchParams({ search })}` : "";
  const result = await apiProxy<unknown>(`/airports${query}`, {
    method: "GET",
  });
  return unpackArrayResult<ApiAirport>(result);
}

export async function fetchAirportByCodeFromApi(code: string) {
  return apiProxy<unknown>(`/airports/${encodeURIComponent(code)}`, {
    method: "GET",
  });
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
