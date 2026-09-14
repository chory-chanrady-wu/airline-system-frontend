"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import { displayPrice, type Flight } from "../../../services/airline-system";
import {
  fetchAirportsFromApi,
  fetchFlightScheduleFromApi,
} from "../../../services/api";

export default function SchedulePage() {
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [start, setStart] = useState("00:00");
  const [end, setEnd] = useState("23:59");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<
    Awaited<ReturnType<typeof fetchAirportsFromApi>>
  >([]);
  const [apiNotice, setApiNotice] = useState("");

  async function search(event?: React.FormEvent) {
    event?.preventDefault();
    try {
      const backendFlights = await fetchFlightScheduleFromApi(
        from,
        to,
        date,
        start,
        end,
      );
      if (
        backendFlights &&
        Array.isArray(backendFlights) &&
        backendFlights.length > 0
      ) {
        setFlights(
          backendFlights.map((flight) => ({
            id: String((flight as Record<string, unknown>).id ?? ""),
            airline: String((flight as Record<string, unknown>).airline ?? ""),
            logo: String((flight as Record<string, unknown>).airline ?? "AV")
              .slice(0, 2)
              .toUpperCase(),
            from: String((flight as Record<string, unknown>).from ?? ""),
            to: String((flight as Record<string, unknown>).to ?? ""),
            departure: String(
              (flight as Record<string, unknown>).departure ?? "",
            ),
            arrival: String((flight as Record<string, unknown>).arrival ?? ""),
            departureTime: String(
              (flight as Record<string, unknown>).departureTime ??
                new Date().toISOString(),
            ),
            arrivalTime: String(
              (flight as Record<string, unknown>).arrivalTime ??
                new Date().toISOString(),
            ),
            price: Number((flight as Record<string, unknown>).price ?? 0),
            capacity: Number((flight as Record<string, unknown>).capacity ?? 0),
            seatsAvailable: Number(
              (flight as Record<string, unknown>).seatsAvailable ?? 0,
            ),
          })),
        );
        setApiNotice("Live schedule loaded from backend.");
        return;
      }
    } catch {
      setApiNotice("Backend unavailable — showing local schedule data.");
    }
    setFlights([]);
  }

  useEffect(() => {
    const loadAirports = async () => {
      try {
        const backendAirports = await fetchAirportsFromApi();
        if (backendAirports.length > 0) {
          setAirports(
            backendAirports.map((airport) => ({
              code: String(airport.code ?? ""),
              city: String(airport.city ?? ""),
              latitude: airport.latitude,
              longitude: airport.longitude,
            })),
          );
          return;
        }
      } catch {
        setApiNotice("Backend unavailable — showing local schedule data.");
      }
      setAirports([]);
    };
    const timer = window.setTimeout(() => {
      void loadAirports();
      void search();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [date, end, from, start, to]);
  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle eyebrow="Flight Management / Schedule" title="Schedule" />
        {apiNotice && (
          <div className="mb-4 rounded-lg border border-[#dfeae8] bg-[#edf7f5] px-4 py-3 text-[11px] text-[#0e6b69]">
            {apiNotice}
          </div>
        )}
        <form
          onSubmit={search}
          className="rounded-xl border border-[#dce5e8] bg-white p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-[10px] font-bold text-[#839198]">
              Date
              <input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
              />
            </label>
            <label className="text-[10px] font-bold text-[#839198]">
              From
              <select
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
              >
                {airports.map((airport) => (
                  <option key={airport.code}>{airport.code}</option>
                ))}
              </select>
            </label>
            <label className="text-[10px] font-bold text-[#839198]">
              To
              <select
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
              >
                {airports.map((airport) => (
                  <option key={airport.code}>{airport.code}</option>
                ))}
              </select>
            </label>
            <label className="text-[10px] font-bold text-[#839198]">
              Start time
              <input
                required
                type="time"
                value={start}
                onChange={(event) => setStart(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
              />
            </label>
            <label className="text-[10px] font-bold text-[#839198]">
              End time
              <input
                required
                type="time"
                value={end}
                onChange={(event) => setEnd(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
              />
            </label>
          </div>
          <button className="mt-4 rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white">
            Browse schedule
          </button>
        </form>
        <div className="mt-6 grid gap-3">
          {flights.map((flight) => (
            <div
              key={flight.id}
              className="grid gap-4 rounded-xl border border-[#dce5e8] bg-white p-4 text-[11px] sm:grid-cols-[1fr_1.4fr_1fr_1fr_1fr] sm:items-center"
            >
              <div>
                <strong className="block text-[#0e6b69]">{flight.id}</strong>
                <span className="text-[10px] text-[#839198]">
                  {flight.airline}
                </span>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-[#839198]">
                  Route
                </span>
                <strong>
                  {flight.from} → {flight.to}
                </strong>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-[#839198]">
                  Departure
                </span>
                <strong>{flight.departure}</strong>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-[#839198]">
                  Arrival
                </span>
                <strong>{flight.arrival}</strong>
              </div>
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-[#839198]">
                  Fare / seats
                </span>
                <strong>{displayPrice(flight.price)}</strong>
                <span className="ml-2 text-[#71838a]">
                  {flight.seatsAvailable}/{flight.capacity}
                </span>
              </div>
            </div>
          ))}
          {flights.length === 0 && (
            <p className="rounded-lg border border-dashed border-[#cbdcdf] p-6 text-center text-[11px] text-[#839198]">
              No departures in this window.
            </p>
          )}
        </div>
      </div>
    </AirlineSystem>
  );
}
