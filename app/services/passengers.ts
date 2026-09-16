import type { ApiBooking, ApiPassenger } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

export async function fetchPassengersFromApi(search?: string) {
  const query = search ? `?${new URLSearchParams({ search })}` : "";
  const result = await apiProxy<unknown>(`/passengers${query}`, {
    method: "GET",
  });
  return unpackArrayResult<ApiPassenger>(result);
}

export async function fetchPassengerByIdFromApi(passengerId: string | number) {
  return apiProxy<unknown>(`/passengers/${encodeURIComponent(passengerId)}`, {
    method: "GET",
  });
}

export async function createPassengerWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/passengers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePassengerWithApi(
  passengerId: string | number,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(`/passengers/${encodeURIComponent(passengerId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deletePassengerWithApi(passengerId: string | number) {
  return apiProxy<unknown>(`/passengers/${passengerId}`, {
    method: "DELETE",
  });
}

export async function fetchPassengerBookingsFromApi(
  passengerId: string | number,
) {
  const result = await apiProxy<unknown>(
    `/passengers/${encodeURIComponent(passengerId)}/bookings`,
    { method: "GET" },
  );
  return unpackArrayResult<ApiBooking>(result);
}

export async function fetchPassengerBookingHistoryFromApi(
  passengerId: string | number,
) {
  const result = await apiProxy<unknown>(
    `/passengers/${encodeURIComponent(passengerId)}/bookings/history`,
    { method: "GET" },
  );
  return unpackArrayResult<unknown>(result);
}
