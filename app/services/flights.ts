import type { ApiFlight } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

function airlineName(airline: ApiFlight["airline"]) {
  if (airline && typeof airline === "object") return airline.name ?? "";
  return airline ?? "";
}

// Flattens both the legacy flat flight shape and the nested airline/airport response into UI-ready fields.
export function normalizeApiFlight(flight: ApiFlight) {
  const name = airlineName(flight.airline) || flight.airlineCode || "";
  const from =
    flight.fromAirport?.code ?? flight.from ?? flight.fromAirportCode ?? "";
  const to = flight.toAirport?.code ?? flight.to ?? flight.toAirportCode ?? "";
  return {
    id: String(flight.id ?? flight.flightId ?? ""),
    flightNumber: String(flight.flightNumber ?? ""),
    aircraftId: String(flight.aircraftId ?? ""),
    airline: name,
    logo: name.slice(0, 2).toUpperCase() || "AV",
    from,
    to,
    fromCity: flight.fromAirport?.city ?? "",
    toCity: flight.toAirport?.city ?? "",
    departure: flight.departure ?? "",
    arrival: flight.arrival ?? "",
    departureTime: flight.departureTime ?? new Date().toISOString(),
    arrivalTime: flight.arrivalTime ?? new Date().toISOString(),
    price: Number(flight.price ?? 0),
    capacity: Number(flight.capacity ?? flight.seatCapacity ?? 0),
    seatsAvailable: Number(flight.seatsAvailable ?? 0),
    status: flight.status ?? "Scheduled",
  };
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

export async function searchFlightsFromApi(
  from: string,
  to: string,
  date: string,
) {
  const query = new URLSearchParams({ from, to, date }).toString();
  const result = await apiProxy<unknown>(`/flights/search?${query}`, {
    method: "GET",
  });
  return unpackArrayResult<ApiFlight>(result);
}

export async function fetchFlightScheduleFromApi(
  from: string,
  to: string,
  date: string,
  start: string,
  end: string,
) {
  const query = new URLSearchParams({ from, to, date, start, end }).toString();
  const result = await apiProxy<unknown>(`/flights/schedule?${query}`, {
    method: "GET",
  });
  return unpackArrayResult<ApiFlight>(result);
}

export async function createFlightWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/flights", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchFlightByIdFromApi(flightId: string | number) {
  return apiProxy<unknown>(`/flights/${encodeURIComponent(flightId)}`, {
    method: "GET",
  });
}

export async function updateFlightWithApi(
  flightId: string | number,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(`/flights/${encodeURIComponent(flightId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function fetchFlightLookupFromApi(flightId: string | number) {
  return apiProxy<unknown>(`/flights/lookup/${encodeURIComponent(flightId)}`, {
    method: "GET",
  });
}

export async function fetchFlightWaitlistFromApi(flightId: string | number) {
  const result = await apiProxy<unknown>(
    `/flights/${encodeURIComponent(flightId)}/waitlist`,
    { method: "GET" },
  );
  return unpackArrayResult<unknown>(result);
}

export async function addFlightWaitlistEntryWithApi(
  flightId: string | number,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(
    `/flights/${encodeURIComponent(flightId)}/waitlist`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function promoteFlightWaitlistWithApi(
  flightId: string | number,
  bookingId: string | number,
) {
  return apiProxy<unknown>(
    `/flights/${encodeURIComponent(flightId)}/waitlist/promote`,
    { method: "POST", body: JSON.stringify({ bookingId }) },
  );
}

export async function removeFlightWaitlistEntryWithApi(
  flightId: string | number,
  bookingId: string | number,
) {
  return apiProxy<unknown>(
    `/flights/${encodeURIComponent(flightId)}/waitlist/${encodeURIComponent(bookingId)}`,
    { method: "DELETE" },
  );
}

export async function fetchRadarFromApi() {
  const result = await apiProxy<unknown>("/flights/radar", { method: "GET" });
  return unpackArrayResult<unknown>(result);
}

export async function fetchRadarStatusFromApi() {
  return apiProxy<unknown>("/flights/radar/status", { method: "GET" });
}

export async function fetchFlightRadarFromApi(flightId: string | number) {
  return apiProxy<unknown>(`/flights/radar/${encodeURIComponent(flightId)}`, {
    method: "GET",
  });
}
