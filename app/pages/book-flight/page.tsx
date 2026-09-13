"use client";

import { useState } from "react";
import { AirlineSystem } from "../../components/airline-system";
import { FlightCard } from "../../components/flight-card";
import {
  FlightSearch,
  type FlightSearchValues,
} from "../../components/flight-search";
import { PageTitle } from "../../components/page-title";
import {
  getSession,
  loadState,
  bookFlight,
  findItineraries,
  searchFlights,
  toFlightCard,
  type Flight,
  type User,
} from "../../services/airline-system";

export default function BookFlightPage() {
  const [availableFlights, setAvailableFlights] = useState<Flight[]>(() =>
    loadState().flights.filter(
      (flight) => flight.from === "JFK" && flight.to === "LHR",
    ),
  );
  const [session] = useState<User | null>(
    () =>
      getSession() ??
      loadState().users.find((user) => user.role === "Passenger") ??
      null,
  );
  const [message, setMessage] = useState("");
  const airports = loadState().airports;
  const [routeFrom, setRouteFrom] = useState("JFK");
  const [routeTo, setRouteTo] = useState("NRT");
  const [itineraries, setItineraries] = useState<ReturnType<
    typeof findItineraries
  > | null>(null);

  function handleSearch(values: FlightSearchValues) {
    setAvailableFlights(
      searchFlights(values.from, values.to, values.departureDate),
    );
  }

  function selectFlight(flightId: string) {
    if (!session) {
      setMessage("Log in as a passenger before booking a seat.");
      return;
    }
    try {
      const booking = bookFlight(flightId, session);
      setMessage(
        booking.status === "Confirmed"
          ? `Booking ${booking.id} confirmed.`
          : `Flight full. You are waitlisted at position ${booking.waitlistPosition}.`,
      );
      setAvailableFlights(
        loadState().flights.filter(
          (flight) => flight.from === "JFK" && flight.to === "LHR",
        ),
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to complete booking.",
      );
    }
  }

  return (
    <AirlineSystem initialModule="Book flight">
      <div className="module-page">
        <PageTitle eyebrow="Reservation workspace" title="Book a new flight" />
        <div className="w-full">
          <FlightSearch overlap={false} onSearch={handleSearch} />
          <div className="mt-8">
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#839198]">
                Available inventory
              </p>
              <h3 className="mt-1 text-[18px] font-semibold">
                Select a flight
              </h3>
            </div>
            <div className="grid gap-3">
              {availableFlights.map((flight, index) => (
                <FlightCard
                  key={flight.id}
                  {...toFlightCard(flight)}
                  featured={index === 0}
                  onSelect={() => selectFlight(flight.id)}
                />
              ))}
            </div>
            {availableFlights.length === 0 && (
              <p className="rounded-lg border border-dashed border-[#cbdcdf] p-6 text-center text-[11px] text-[#839198]">
                No flights match that route and date.
              </p>
            )}
            {message && (
              <p
                className="mt-4 rounded-lg bg-[#eef8f5] px-4 py-3 text-[11px] text-[#0e6b69]"
                role="status"
              >
                {message}
              </p>
            )}
            <div className="mt-8 rounded-xl border border-[#dce5e8] bg-white p-5">
              <h3 className="font-semibold">Route planner</h3>
              <p className="mt-1 text-[11px] text-[#839198]">
                Cheapest, fastest, and fewest-stop routes are calculated with
                graph algorithms.
              </p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <label className="text-[10px] font-bold text-[#839198]">
                  From
                  <select
                    value={routeFrom}
                    onChange={(event) => setRouteFrom(event.target.value)}
                    className="mt-1 block rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
                  >
                    {airports.map((airport) => (
                      <option key={airport.code}>{airport.code}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[10px] font-bold text-[#839198]">
                  To
                  <select
                    value={routeTo}
                    onChange={(event) => setRouteTo(event.target.value)}
                    className="mt-1 block rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
                  >
                    {airports.map((airport) => (
                      <option key={airport.code}>{airport.code}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setItineraries(findItineraries(routeFrom, routeTo))
                  }
                  className="rounded-lg bg-[#0e6b69] px-3 py-2 text-[11px] font-bold text-white"
                >
                  Compare routes
                </button>
              </div>
              {itineraries && (
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {(["cheapest", "fastest", "fewestStops"] as const).map(
                    (kind) => {
                      const itinerary = itineraries[kind];
                      return (
                        <div
                          key={kind}
                          className="rounded-lg border border-[#eef2f3] p-3 text-[11px]"
                        >
                          <strong className="block capitalize">
                            {kind === "fewestStops" ? "Fewest stops" : kind}
                          </strong>
                          {itinerary ? (
                            <>
                              <span className="mt-2 block text-[#526a73]">
                                {itinerary.route}
                              </span>
                              <span className="mt-1 block text-[#839198]">
                                {itinerary.layovers.length
                                  ? `Layovers: ${itinerary.layovers.join(", ")}`
                                  : "Nonstop"}
                              </span>
                              <span className="mt-1 block font-semibold">
                                ${itinerary.price} · {itinerary.durationMinutes}{" "}
                                min
                              </span>
                            </>
                          ) : (
                            <span className="mt-2 block text-[#c56d61]">
                              No route found
                            </span>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AirlineSystem>
  );
}
