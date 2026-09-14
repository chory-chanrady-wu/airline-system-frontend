"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import {
  displayPrice,
  findFlight,
  type Flight,
} from "../../../services/airline-system";
import {
  deleteFlightWithApi,
  fetchFlightsFromApi,
} from "../../../services/api";

export default function FlightListPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState("");
  const [found, setFound] = useState<Flight | undefined>();
  const [apiNotice, setApiNotice] = useState("");

  async function refresh() {
    try {
      const backendFlights = await fetchFlightsFromApi();
      if (backendFlights.length > 0) {
        setFlights(
          backendFlights.map((flight) => ({
            id: String(flight.id ?? flight.flightId ?? ""),
            airline: flight.airline ?? "",
            logo: (flight.airline ?? "AV").slice(0, 2).toUpperCase(),
            from: flight.from ?? "",
            to: flight.to ?? "",
            departure: flight.departure ?? "",
            arrival: flight.arrival ?? "",
            departureTime: flight.departureTime ?? new Date().toISOString(),
            arrivalTime: flight.arrivalTime ?? new Date().toISOString(),
            price: Number(flight.price ?? 0),
            capacity: Number(flight.capacity ?? 0),
            seatsAvailable: Number(flight.seatsAvailable ?? 0),
          })),
        );
        setApiNotice("Live flight list loaded from backend.");
        return;
      }
    } catch {
      setApiNotice("Backend unavailable — flight data cannot be loaded.");
    }
    setFlights([]);
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const visible = flights.filter((flight) =>
    `${flight.id} ${flight.from} ${flight.to} ${flight.airline}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Flight List"
          title="Flight list"
        />
        {apiNotice && (
          <div className="mb-4 rounded-lg border border-[#dfeae8] bg-[#edf7f5] px-4 py-3 text-[11px] text-[#0e6b69]">
            {apiNotice}
          </div>
        )}
        <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setFound(findFlight(lookup));
            }}
            className="rounded-xl border border-[#dce5e8] bg-white p-5"
          >
            <h3 className="font-semibold">Instant flight lookup</h3>
            <p className="mt-1 text-[11px] text-[#839198]">
              Hash table lookup by flight ID.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                required
                placeholder="e.g. AV-208"
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <button className="rounded-lg bg-[#0e6b69] px-3 py-2 text-[11px] font-bold text-white">
                Find
              </button>
            </div>
            {found && (
              <div className="mt-4 rounded-lg bg-[#eef8f5] p-3 text-[11px] text-[#0e6b69]">
                {found.id}: {found.from} → {found.to} ·{" "}
                {displayPrice(found.price)} · {found.seatsAvailable} seats
                available
              </div>
            )}
            {lookup && !found && (
              <p className="mt-4 text-[11px] text-[#c56d61]">
                No flight found.
              </p>
            )}
          </form>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <h3 className="font-semibold">Browse flights</h3>
            <input
              placeholder="Search by ID, airline, or route"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mt-4 w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
            />
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {visible.map((flight) => (
            <div
              key={flight.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-[#dce5e8] bg-white p-4 text-[11px]"
            >
              <strong className="w-20">{flight.id}</strong>
              <span className="flex-1">
                {flight.airline} · {flight.from} → {flight.to}
              </span>
              <span>{flight.departureTime.replace("T", " ")}</span>
              <span>{displayPrice(flight.price)}</span>
              <span>
                {flight.seatsAvailable}/{flight.capacity} seats
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteFlightWithApi(flight.id);
                  } catch {
                    setApiNotice("Unable to remove flight from backend.");
                  }
                  await refresh();
                }}
                className="font-semibold text-[#c56d61]"
              >
                Remove
              </button>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="rounded-lg border border-dashed border-[#cbdcdf] p-6 text-center text-[11px] text-[#839198]">
              No flights match your search.
            </p>
          )}
        </div>
      </div>
    </AirlineSystem>
  );
}
