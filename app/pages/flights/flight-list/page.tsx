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
  createFlightWithApi,
  deleteFlightWithApi,
  fetchFlightsFromApi,
  updateFlightWithApi,
} from "../../../services/api";

type FlightForm = {
  flightNumber: string;
  fromAirportCode: string;
  toAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
  seatCapacity: string;
  seatsAvailable: string;
  status: string;
};
const emptyForm: FlightForm = {
  flightNumber: "",
  fromAirportCode: "",
  toAirportCode: "",
  departureTime: "",
  arrivalTime: "",
  price: "",
  seatCapacity: "",
  seatsAvailable: "",
  status: "Scheduled",
};

export default function FlightListPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState("");
  const [found, setFound] = useState<Flight | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FlightForm>(emptyForm);
  const [message, setMessage] = useState("");

  async function refresh() {
    try {
      const backendFlights = await fetchFlightsFromApi();
      if (backendFlights.length > 0) {
        setFlights(
          backendFlights.map((flight) => ({
            id: String(
              flight.id ?? flight.flightId ?? flight.flightNumber ?? "",
            ),
            airline: flight.airline ?? "",
            logo: (flight.airline ?? "AV").slice(0, 2).toUpperCase(),
            from: flight.from ?? flight.fromAirportCode ?? "",
            to: flight.to ?? flight.toAirportCode ?? "",
            departure: flight.departure ?? "",
            arrival: flight.arrival ?? "",
            departureTime: flight.departureTime ?? new Date().toISOString(),
            arrivalTime: flight.arrivalTime ?? new Date().toISOString(),
            price: Number(flight.price ?? 0),
            capacity: Number(flight.capacity ?? flight.seatCapacity ?? 0),
            seatsAvailable: Number(flight.seatsAvailable ?? 0),
          })),
        );
        return;
      }
    } catch {}
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
  async function saveFlight(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      seatCapacity: Number(form.seatCapacity),
      seatsAvailable: Number(form.seatsAvailable),
    };
    try {
      if (editingId) await updateFlightWithApi(editingId, payload);
      else await createFlightWithApi(payload);
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      setMessage("Flight saved successfully.");
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save flight.",
      );
    }
  }
  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Flight List"
          title="Flight list"
          action={showForm ? "Close form" : "Add flight"}
          onAction={() => {
            setShowForm((open) => !open);
            setEditingId(null);
            setForm(emptyForm);
          }}
        />
        {showForm && (
          <form
            onSubmit={saveFlight}
            className="mb-5 rounded-xl border border-[#dce5e8] bg-white p-5"
          >
            <h3 className="font-semibold">
              {editingId ? "Edit flight" : "Create flight"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["flightNumber", "Flight number"],
                  ["fromAirportCode", "From airport"],
                  ["toAirportCode", "To airport"],
                  ["departureTime", "Departure time"],
                  ["arrivalTime", "Arrival time"],
                  ["price", "Price"],
                  ["seatCapacity", "Seat capacity"],
                  ["seatsAvailable", "Seats available"],
                ] as const
              ).map(([field, label]) => (
                <label
                  key={field}
                  className="text-[10px] font-bold text-[#839198]"
                >
                  {label}
                  <input
                    required
                    type={
                      field.includes("Time")
                        ? "datetime-local"
                        : field === "price" ||
                            field.includes("Capacity") ||
                            field.includes("Available")
                          ? "number"
                          : "text"
                    }
                    value={form[field]}
                    onChange={(event) =>
                      setForm({ ...form, [field]: event.target.value })
                    }
                    className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
                  />
                </label>
              ))}
              <label className="text-[10px] font-bold text-[#839198]">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
                >
                  <option>Scheduled</option>
                  <option>Delayed</option>
                  <option>Cancelled</option>
                  <option>Completed</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white">
                {editingId ? "Update flight" : "Create flight"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {message && (
          <p className="mb-4 rounded-lg bg-[#eef8f5] px-4 py-3 text-[11px] text-[#0e6b69]">
            {message}
          </p>
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
                onClick={() => {
                  setEditingId(flight.id);
                  setForm({
                    flightNumber: flight.id,
                    fromAirportCode: flight.from,
                    toAirportCode: flight.to,
                    departureTime: flight.departureTime.slice(0, 16),
                    arrivalTime: flight.arrivalTime.slice(0, 16),
                    price: String(flight.price),
                    seatCapacity: String(flight.capacity),
                    seatsAvailable: String(flight.seatsAvailable),
                    status: "Scheduled",
                  });
                  setShowForm(true);
                }}
                className="font-semibold text-[#0e6b69]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await deleteFlightWithApi(flight.id);
                  } catch {}
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
