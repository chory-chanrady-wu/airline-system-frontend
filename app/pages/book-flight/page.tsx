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
  findItineraries,
  toFlightCard,
  type Flight,
  type User,
} from "../../services/airline-system";
import {
  createBookingWithApi,
  createPassengerWithApi,
  fetchAirportsFromApi,
  fetchFlightsFromApi,
  fetchPassengersFromApi,
  normalizeApiFlight,
  searchFlightsFromApi,
} from "../../services/api";
import type { ApiPassenger } from "../../ustils/type";

type PassengerOption = {
  id: string;
  name: string;
  passportNumber: string;
};

const emptyNewPassenger = {
  fullName: "",
  passportNumber: "",
  nationality: "",
  phone: "",
  dateOfBirth: "",
  emergencyContact: "",
};

export default function BookFlightPage() {
  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [session] = useState<User | null>(() => getSession());
  const [message, setMessage] = useState("");
  const [passengers, setPassengers] = useState<PassengerOption[]>([]);
  const [airports, setAirports] = useState<
    Awaited<ReturnType<typeof fetchAirportsFromApi>>
  >([]);
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [itineraries, setItineraries] = useState<ReturnType<
    typeof findItineraries
  > | null>(null);
  const [bookingFlightId, setBookingFlightId] = useState<string | null>(null);
  const [passengerMode, setPassengerMode] = useState<"existing" | "new">(
    "existing",
  );
  const [selectedPassengerId, setSelectedPassengerId] = useState("");
  const [newPassenger, setNewPassenger] = useState(emptyNewPassenger);
  const [booking, setBooking] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  async function refreshPassengers() {
    try {
      const backendPassengers = await fetchPassengersFromApi();
      setPassengers(
        backendPassengers.map((passenger: ApiPassenger) => ({
          id: String(passenger.id ?? ""),
          name: String(
            passenger.fullName ??
              passenger.userName ??
              `Passenger #${passenger.id}`,
          ),
          passportNumber: String(passenger.passportNumber ?? ""),
        })),
      );
    } catch {
      setPassengers([]);
    }
  }

  useState(() => {
    void (async () => {
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
        }
      } catch {}
    })();
    void refreshPassengers();
    void (async () => {
      try {
        const allFlights = await fetchFlightsFromApi();
        setAvailableFlights(allFlights.map(normalizeApiFlight));
      } catch {
        setAvailableFlights([]);
      }
    })();
  });

  async function handleSearch(values: FlightSearchValues) {
    try {
      const backendFlights = await searchFlightsFromApi(
        values.from,
        values.to,
        values.departureDate,
      );
      if (
        backendFlights &&
        Array.isArray(backendFlights) &&
        backendFlights.length > 0
      ) {
        setAvailableFlights(backendFlights.map(normalizeApiFlight));
        return;
      }
    } catch {}
    // Backend /flights/search currently returns no results, fall back to client-side filtering.
    try {
      const allFlights = await fetchFlightsFromApi();
      const matches = allFlights
        .map(normalizeApiFlight)
        .filter(
          (flight) =>
            flight.from === values.from &&
            flight.to === values.to &&
            flight.departureTime.slice(0, 10) === values.departureDate,
        );
      setAvailableFlights(matches);
      return;
    } catch {}
    setAvailableFlights([]);
  }

  async function selectFlight(flightId: string) {
    if (!session) {
      setMessage("Log in before booking a seat.");
      return;
    }
    setMessage("");
    setBookingFlightId(flightId);
    setPassengerMode(passengers.length > 0 ? "existing" : "new");
    setSelectedPassengerId(passengers[0]?.id ?? "");
    setNewPassenger(emptyNewPassenger);
  }

  async function confirmBooking() {
    const flight = availableFlights.find((item) => item.id === bookingFlightId);
    if (!bookingFlightId || !flight) return;
    setBooking(true);
    try {
      let passengerId = "";
      let passengerName = "";
      if (passengerMode === "existing") {
        const passenger = passengers.find(
          (item) => item.id === selectedPassengerId,
        );
        if (!passenger) {
          setMessage("Please select a passenger.");
          setBooking(false);
          return;
        }
        passengerId = passenger.id;
        passengerName = passenger.name;
      } else {
        if (
          !newPassenger.fullName ||
          !newPassenger.passportNumber ||
          !newPassenger.nationality ||
          !newPassenger.phone ||
          !newPassenger.dateOfBirth ||
          !newPassenger.emergencyContact
        ) {
          setMessage("Please fill in all new passenger fields.");
          setBooking(false);
          return;
        }
        // Not linked to the logged-in session: a user can only have one passenger profile.
        const created = (await createPassengerWithApi({
          userId: null,
          fullName: newPassenger.fullName,
          passportNumber: newPassenger.passportNumber,
          nationality: newPassenger.nationality,
          phone: newPassenger.phone,
          dateOfBirth: newPassenger.dateOfBirth,
          emergencyContact: newPassenger.emergencyContact,
        })) as Record<string, unknown>;
        const createdPassenger = (created.passenger ?? created) as Record<
          string,
          unknown
        >;
        passengerId = String(createdPassenger.id ?? "");
        passengerName = newPassenger.fullName;
        await refreshPassengers();
        // Switch to the newly created passenger so a retry doesn't create another duplicate.
        setPassengerMode("existing");
        setSelectedPassengerId(passengerId);
        setNewPassenger(emptyNewPassenger);
      }
      const bookingPayload = {
        passengerId,
        passengerName,
        flightId: bookingFlightId,
        amount: flight.price,
        currency: "USD",
        status: "CONFIRMED",
      };
      const backendBooking = await createBookingWithApi(bookingPayload);
      if (backendBooking && typeof backendBooking === "object") {
        const payload = backendBooking as Record<string, unknown>;
        const id = String(payload.bookingId ?? payload.id ?? bookingFlightId);
        const status = String(payload.status ?? "CONFIRMED").toUpperCase();
        const waitlistPosition = payload.waitlistPosition;
        setMessage(
          status === "CONFIRMED"
            ? `Booking ${id} confirmed.`
            : `Flight full. You are waitlisted at position ${waitlistPosition}.`,
        );
      }
      setBookingFlightId(null);
      try {
        const backendFlights = await fetchFlightsFromApi();
        setAvailableFlights(backendFlights.map(normalizeApiFlight));
      } catch {
        setAvailableFlights([]);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to complete booking.",
      );
    } finally {
      setBooking(false);
    }
  }

  return (
    <AirlineSystem initialModule="Book flight">
      <div className="module-page">
        <PageTitle eyebrow="Reservation workspace" title="Book a new flight" />
        <div className="w-full">
          {bookingFlightId && (
            <div className="fixed inset-0 z-40 grid place-items-center bg-[#172b3a]/20 px-5">
              <div className="w-full max-w-md rounded-xl border border-[#dce5e8] bg-white p-6 text-[#172b3a] shadow-2xl">
                <p className="text-[15px] font-semibold">Confirm passenger</p>
                <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                  Select an existing passenger or create a new one for this
                  booking.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPassengerMode("existing")}
                    className={`rounded-lg border px-3 py-2 text-[11px] font-bold ${passengerMode === "existing" ? "border-[#0e6b69] bg-[#eef8f5] text-[#0e6b69]" : "border-[#dce5e8] text-[#526a73]"}`}
                  >
                    Existing passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setPassengerMode("new")}
                    className={`rounded-lg border px-3 py-2 text-[11px] font-bold ${passengerMode === "new" ? "border-[#0e6b69] bg-[#eef8f5] text-[#0e6b69]" : "border-[#dce5e8] text-[#526a73]"}`}
                  >
                    New passenger
                  </button>
                </div>
                {passengerMode === "existing" ? (
                  <select
                    value={selectedPassengerId}
                    onChange={(event) =>
                      setSelectedPassengerId(event.target.value)
                    }
                    className="mt-4 w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px]"
                  >
                    <option value="">Select passenger</option>
                    {passengers.map((passenger) => (
                      <option key={passenger.id} value={passenger.id}>
                        {passenger.name} · {passenger.passportNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-4 grid gap-2">
                    <input
                      placeholder="Full name"
                      value={newPassenger.fullName}
                      onChange={(event) =>
                        setNewPassenger({
                          ...newPassenger,
                          fullName: event.target.value,
                        })
                      }
                      className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
                    />
                    <input
                      placeholder="Passport number"
                      value={newPassenger.passportNumber}
                      onChange={(event) =>
                        setNewPassenger({
                          ...newPassenger,
                          passportNumber: event.target.value,
                        })
                      }
                      className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
                    />
                    <input
                      placeholder="Nationality"
                      value={newPassenger.nationality}
                      onChange={(event) =>
                        setNewPassenger({
                          ...newPassenger,
                          nationality: event.target.value,
                        })
                      }
                      className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
                    />
                    <input
                      placeholder="Phone number"
                      value={newPassenger.phone}
                      onChange={(event) =>
                        setNewPassenger({
                          ...newPassenger,
                          phone: event.target.value,
                        })
                      }
                      className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
                    />
                    <input
                      type="date"
                      placeholder="Date of birth"
                      value={newPassenger.dateOfBirth}
                      onChange={(event) =>
                        setNewPassenger({
                          ...newPassenger,
                          dateOfBirth: event.target.value,
                        })
                      }
                      className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
                    />
                    <input
                      placeholder="Emergency contact number"
                      value={newPassenger.emergencyContact}
                      onChange={(event) =>
                        setNewPassenger({
                          ...newPassenger,
                          emergencyContact: event.target.value,
                        })
                      }
                      className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
                    />
                  </div>
                )}
                {message && (
                  <p
                    className="mt-4 rounded-lg bg-[#fbeae7] px-3 py-2 text-[11px] text-[#c56d61]"
                    role="status"
                  >
                    {message}
                  </p>
                )}
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={booking}
                    onClick={() => setBookingFlightId(null)}
                    className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold text-[#526a73]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={booking}
                    onClick={confirmBooking}
                    className="rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white disabled:opacity-60"
                  >
                    {booking ? "Booking..." : "Confirm booking"}
                  </button>
                </div>
              </div>
            </div>
          )}
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
