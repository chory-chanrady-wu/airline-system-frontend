"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import {
  loadState,
  systemStats,
  type Flight,
} from "../../services/airline-system";

function flightStatus(flight: Flight) {
  if (flight.seatsAvailable === 0)
    return { label: "Full", className: "bg-[#fbeae7] text-[#c56d61]" };
  if (flight.seatsAvailable / flight.capacity < 0.15)
    return { label: "Almost full", className: "bg-[#fff5df] text-[#b1863f]" };
  return { label: "On time", className: "bg-[#e7f5ed] text-[#4d9b73]" };
}

function duration(flight: Flight) {
  const minutes = Math.max(
    0,
    Math.round(
      (new Date(flight.arrivalTime).getTime() -
        new Date(flight.departureTime).getTime()) /
        60000,
    ),
  );
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function FlightsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState<"Departures" | "Arrivals">("Departures");

  function refresh() {
    setFlights([]);
  }
  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const stats = systemStats();
  const visibleFlights = flights
    .filter((flight) =>
      `${flight.id} ${flight.airline} ${flight.from} ${flight.to}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(a.departureTime).getTime() -
        new Date(b.departureTime).getTime(),
    );

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Operations control center"
          title="Flight board"
          action="Schedule flight"
          onAction={() => router.push("/pages/flights/schedule")}
        />
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Flight board summary"
        >
          {[
            [
              "Flights today",
              flights.length.toString(),
              "Scheduled inventory",
              "plane",
            ],
            [
              "Airports",
              stats.totalAirports.toString(),
              "Network vertices",
              "globe",
            ],
            ["Routes", stats.totalRoutes.toString(), "Graph edges", "ticket"],
            [
              "Load factor",
              `${stats.overallLoadFactor}%`,
              `${stats.availableSeats} seats available`,
              "sparkle",
            ],
          ].map(([label, value, detail, icon]) => (
            <div
              key={label}
              className="rounded-xl border border-[#dce5e8] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e1f2ed] text-[#0e6b69]">
                  <Icon name={icon as "plane"} size={18} />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wide text-[#0e6b69]">
                  Live
                </span>
              </div>
              <p className="mt-5 text-[11px] text-[#839198]">{label}</p>
              <strong className="mt-1 block text-2xl">{value}</strong>
              <span className="mt-1 block text-[10px] text-[#71838a]">
                {detail}
              </span>
            </div>
          ))}
        </section>

        <section className="mt-7 overflow-hidden rounded-xl border border-[#dce5e8] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#eef2f3] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.6px] text-[#5b9994]">
                Live operations
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                Today&apos;s flight board
              </h3>
              <p className="mt-1 text-[11px] text-[#839198]">
                Monitor departures, arrivals, load status, and available seats.
              </p>
            </div>
            <div className="flex gap-2 rounded-lg bg-[#f1f6f5] p-1">
              {(["Departures", "Arrivals"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setBoard(item)}
                  className={`rounded-md px-3 py-2 text-[10px] font-bold ${board === item ? "bg-white text-[#0e6b69] shadow-sm" : "text-[#839198]"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flight-board-toolbar flex flex-wrap items-center gap-3 border-b border-[#eef2f3] bg-[#fbfdfd] p-4">
            <div className="flight-board-search flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[#94a2a6] sm:max-w-[360px]">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search flight, airline, or route"
                className="w-full bg-transparent text-[11px] outline-none"
              />
            </div>
            <span className="text-[10px] text-[#839198]">
              {visibleFlights.length} flights displayed
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[850px]">
              <div className="grid grid-cols-[1.1fr_1.7fr_1.2fr_1.2fr_1fr_1fr] bg-[#f7fafb] px-6 py-3 text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                <span>Flight</span>
                <span>Route</span>
                <span>Departure</span>
                <span>Arrival</span>
                <span>Duration</span>
                <span>Status</span>
              </div>
              {visibleFlights.map((flight) => {
                const status = flightStatus(flight);
                return (
                  <div
                    key={flight.id}
                    className="flight-board-row grid grid-cols-[1.1fr_1.7fr_1.2fr_1.2fr_1fr_1fr] items-center border-t border-[#eef2f3] px-6 py-4 text-[11px]"
                  >
                    <div>
                      <strong className="block text-[#0e6b69]">
                        {flight.id}
                      </strong>
                      <span className="text-[9px] text-[#839198]">
                        {flight.airline}
                      </span>
                    </div>
                    <span className="font-semibold">
                      {board === "Departures" ? flight.from : flight.to}{" "}
                      <span className="px-1 text-[#9cb7b3]">→</span>{" "}
                      {board === "Departures" ? flight.to : flight.from}
                    </span>
                    <span className="font-semibold">
                      {board === "Departures"
                        ? flight.departure
                        : flight.arrival}
                    </span>
                    <span className="text-[#71838a]">
                      {board === "Departures"
                        ? flight.arrival
                        : flight.departure}
                    </span>
                    <span className="text-[#71838a]">{duration(flight)}</span>
                    <span>
                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                      <small className="mt-2 block text-[#839198]">
                        {flight.seatsAvailable}/{flight.capacity} seats
                      </small>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {visibleFlights.length === 0 && (
            <p className="p-10 text-center text-[11px] text-[#839198]">
              No flights match your search.
            </p>
          )}
        </section>

        <div className="mt-5 flex flex-wrap gap-3 text-[11px]">
          <Link
            href="/pages/flights/airport"
            className="rounded-lg border border-[#dce5e8] bg-white px-4 py-2 font-semibold text-[#0e6b69]"
          >
            Manage airports →
          </Link>
          <Link
            href="/pages/flights/route"
            className="rounded-lg border border-[#dce5e8] bg-white px-4 py-2 font-semibold text-[#0e6b69]"
          >
            Manage routes →
          </Link>
          <Link
            href="/pages/flights/flight-list"
            className="rounded-lg border border-[#dce5e8] bg-white px-4 py-2 font-semibold text-[#0e6b69]"
          >
            Open flight list →
          </Link>
        </div>
      </div>
    </AirlineSystem>
  );
}
