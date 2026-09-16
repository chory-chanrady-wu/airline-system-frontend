import type { ApiBooking } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

export async function fetchBookingsFromApi() {
  const result = await apiProxy<unknown>("/bookings", { method: "GET" });
  return unpackArrayResult<ApiBooking>(result);
}

export async function createBookingWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchBookingByIdFromApi(bookingId: string | number) {
  return apiProxy<unknown>(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: "GET",
  });
}

export async function updateBookingWithApi(
  bookingId: string | number,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteBookingWithApi(bookingId: string | number) {
  return apiProxy<unknown>(`/bookings/${encodeURIComponent(bookingId)}`, {
    method: "DELETE",
  });
}

export async function cancelBookingWithApi(bookingId: string | number) {
  return apiProxy<unknown>(`/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
}

export async function undoBookingCancellationWithApi(
  bookingId: string | number,
) {
  return apiProxy<unknown>(`/bookings/${encodeURIComponent(bookingId)}/undo`, {
    method: "POST",
  });
}
