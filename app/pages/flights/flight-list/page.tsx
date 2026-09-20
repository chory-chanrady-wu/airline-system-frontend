"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import { usePermissions } from "../../../hooks/use-permissions";
import { displayPrice, findFlight } from "../../../services/airline-system";
import {
  createFlightWithApi,
  deleteFlightWithApi,
  fetchAircraftsFromApi,
  fetchFlightsFromApi,
  fetchRoutesFromApi,
  normalizeApiFlight,
  updateFlightWithApi,
} from "../../../services/api";
import type { Flight, Route } from "../../../ustils/type";

type FlightForm = {
  flightNumber: string;
  aircraftId: string;
  fromAirportCode: string;
  toAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  price: string;
  seatCapacity: string;
  seatsAvailable: string;
  status: string;
};
const DEFAULT_AIRLINE_ID = "10000000";
const emptyForm: FlightForm = {
  flightNumber: "",
  aircraftId: "",
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
  const { canWrite } = usePermissions();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [aircrafts, setAircrafts] = useState<
    {
      id: string;
      registrationNumber: string;
      model: string;
      seatCapacity: number;
    }[]
  >([]);
  const [query, setQuery] = useState("");
  const [lookup, setLookup] = useState("");
  const [found, setFound] = useState<Flight | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Flight | null>(null);
  const [form, setForm] = useState<FlightForm>(emptyForm);
  const [message, setMessage] = useState("");

  async function refresh() {
    try {
      const backendRoutes = await fetchRoutesFromApi();
      setRoutes(
        backendRoutes
          .map((route) => {
            const rawRoute = route as typeof route & Record<string, unknown>;
            const routeId = route.id ?? rawRoute.routeId;
            return {
              id:
                typeof routeId === "string" || typeof routeId === "number"
                  ? routeId
                  : undefined,
              from: String(
                route.from ??
                  route.fromAirportCode ??
                  rawRoute.origin ??
                  rawRoute.originAirportCode ??
                  "",
              )
                .trim()
                .toUpperCase(),
              to: String(
                route.to ??
                  route.toAirportCode ??
                  rawRoute.destination ??
                  rawRoute.destinationAirportCode ??
                  "",
              )
                .trim()
                .toUpperCase(),
              distance: Number(
                route.distance ??
                  route.distanceKm ??
                  rawRoute.distanceInKm ??
                  0,
              ),
              durationMinutes: Number(
                route.durationMinutes ?? rawRoute.duration ?? 0,
              ),
            };
          })
          .filter((route) => route.from && route.to),
      );
    } catch {
      setRoutes([]);
    }

    try {
      const backendAircrafts = await fetchAircraftsFromApi();
      setAircrafts(
        backendAircrafts
          .filter((aircraft) => aircraft.active !== false)
          .map((aircraft) => ({
            id: String(aircraft.id ?? ""),
            registrationNumber: aircraft.registrationNumber ?? "",
            model: aircraft.model ?? "",
            seatCapacity: Number(aircraft.seatCapacity ?? 0),
          }))
          .filter((aircraft) => aircraft.id && aircraft.seatCapacity > 0),
      );
    } catch {
      setAircrafts([]);
    }

    try {
      const backendFlights = await fetchFlightsFromApi();
      if (backendFlights.length > 0) {
        setFlights(
          backendFlights.map((flight) => {
            const normalized = normalizeApiFlight(flight);
            return {
              ...normalized,
              id: String(
                flight.flightNumber ?? flight.flightId ?? flight.id ?? "",
              ),
              databaseId: String(flight.id ?? flight.flightId ?? ""),
            };
          }),
        );
      } else {
        setFlights([]);
      }
    } catch {
      setFlights([]);
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const visible = flights.filter((flight) =>
    `${flight.id} ${flight.from} ${flight.to} ${flight.airline}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const selectedAircraft = aircrafts.find(
    (aircraft) => aircraft.id === form.aircraftId,
  );

  function getRouteDuration(from: string, to: string) {
    const route = routes.find((item) => item.from === from && item.to === to);
    if (route?.durationMinutes && route.durationMinutes > 0) {
      return route.durationMinutes;
    }
    return route?.distance
      ? Math.max(60, Math.round((route.distance / 800) * 60))
      : 120;
  }

  function formatDuration(durationMinutes: number) {
    const totalSeconds = Math.max(0, Math.round(durationMinutes * 60));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  function getFlightDuration(flight: Flight) {
    const departure = new Date(flight.departureTime).getTime();
    const arrival = new Date(flight.arrivalTime).getTime();
    if (Number.isFinite(departure) && Number.isFinite(arrival)) {
      const durationMinutes = (arrival - departure) / (1000 * 60);
      if (durationMinutes > 0) return durationMinutes;
    }
    return getRouteDuration(flight.from, flight.to);
  }

  function calculateArrivalTime(
    departureDateTime: string,
    from: string,
    to: string,
  ) {
    if (!departureDateTime || !from || !to) return "";
    const [datePart, timePart = "00:00"] = departureDateTime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    const arrival = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes + getRouteDuration(from, to),
    );
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${arrival.getFullYear()}-${pad(arrival.getMonth() + 1)}-${pad(arrival.getDate())}T${pad(arrival.getHours())}:${pad(arrival.getMinutes())}`;
  }

  useEffect(() => {
    if (!form.departureTime || !form.fromAirportCode || !form.toAirportCode) {
      return;
    }
    const arrivalTime = calculateArrivalTime(
      form.departureTime,
      form.fromAirportCode,
      form.toAirportCode,
    );
    if (arrivalTime !== form.arrivalTime) {
      setForm((current) => ({ ...current, arrivalTime }));
    }
  }, [form.departureTime, form.fromAirportCode, form.toAirportCode, routes]);

  async function saveFlight(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canWrite("FLIGHTS")) {
      setMessage("You do not have permission to manage flights.");
      return;
    }
    if (
      !form.fromAirportCode ||
      !form.toAirportCode ||
      !form.aircraftId ||
      !form.departureTime ||
      !form.arrivalTime
    ) {
      setMessage(
        "Please select an aircraft, route, and departure date/time first.",
      );
      return;
    }
    if (!selectedAircraft) {
      setMessage("Please select an active aircraft.");
      return;
    }
    const seatCapacity = Number(form.seatCapacity);
    const seatsAvailable = Number(form.seatsAvailable);
    if (seatCapacity !== selectedAircraft.seatCapacity) {
      setMessage("Seat capacity must match the selected aircraft capacity.");
      return;
    }
    if (seatsAvailable > seatCapacity) {
      setMessage("Available seats cannot exceed seat capacity.");
      return;
    }
    const selectedRoute = routes.find(
      (route) =>
        route.from === form.fromAirportCode && route.to === form.toAirportCode,
    );
    const payload = {
      flightNumber: form.flightNumber.trim(),
      airlineId: DEFAULT_AIRLINE_ID,
      aircraftId: form.aircraftId,
      routeId: String(selectedRoute?.id ?? "10000000"),
      fromAirportCode: form.fromAirportCode,
      toAirportCode: form.toAirportCode,
      departureTime: `${form.departureTime}:00`,
      arrivalTime: `${form.arrivalTime}:00`,
      price: Number(form.price),
      seatCapacity,
      seatsAvailable,
      status: form.status,
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

  async function confirmDelete() {
    if (!pendingDelete) return;
    if (!canWrite("FLIGHTS")) {
      setMessage("You do not have permission to delete flights.");
      return;
    }
    try {
      await deleteFlightWithApi(pendingDelete.databaseId || pendingDelete.id);
      await refresh();
      setMessage("Flight removed successfully.");
      setPendingDelete(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to remove flight.",
      );
    }
  }

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Flight List"
          title="Flight list"
          action={
            canWrite("FLIGHTS")
              ? showForm
                ? "Close form"
                : "Add flight"
              : undefined
          }
          onAction={
            canWrite("FLIGHTS")
              ? () => {
                  setShowForm((open) => !open);
                  setEditingId(null);
                  setForm(emptyForm);
                }
              : undefined
          }
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
                  ["departureTime", "Departure time"],
                  ["price", "Price"],
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
                      field === "departureTime"
                        ? "datetime-local"
                        : field === "price" ||
                            field.includes("Capacity") ||
                            field.includes("Available")
                          ? "number"
                          : "text"
                    }
                    value={form[field]}
                    min={field === "seatsAvailable" ? 1 : undefined}
                    max={
                      field === "seatsAvailable"
                        ? selectedAircraft?.seatCapacity
                        : undefined
                    }
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm({
                        ...form,
                        [field]: value,
                        ...(field === "departureTime"
                          ? {
                              arrivalTime: calculateArrivalTime(
                                value,
                                form.fromAirportCode,
                                form.toAirportCode,
                              ),
                            }
                          : {}),
                      });
                    }}
                    className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
                  />
                </label>
              ))}
              <label className="text-[10px] font-bold text-[#839198]">
                Aircraft
                <select
                  required
                  value={form.aircraftId}
                  onChange={(event) => {
                    const aircraft = aircrafts.find(
                      (item) => item.id === event.target.value,
                    );
                    setForm({
                      ...form,
                      aircraftId: event.target.value,
                      seatCapacity: aircraft
                        ? String(aircraft.seatCapacity)
                        : "",
                      seatsAvailable: aircraft
                        ? String(aircraft.seatCapacity)
                        : "",
                    });
                  }}
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
                >
                  <option value="">Select an aircraft</option>
                  {aircrafts.map((aircraft) => (
                    <option key={aircraft.id} value={aircraft.id}>
                      {aircraft.registrationNumber} · {aircraft.model}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                Seat capacity (automatic)
                <input
                  readOnly
                  value={form.seatCapacity}
                  placeholder="Select an aircraft"
                  className="flight-auto-field mt-1 block w-full rounded-lg border px-3 py-2 text-[11px] font-normal"
                />
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                Route
                <select
                  required
                  value={
                    form.fromAirportCode && form.toAirportCode
                      ? `${form.fromAirportCode}-${form.toAirportCode}`
                      : ""
                  }
                  onChange={(event) => {
                    const [from, to] = event.target.value.split("-");
                    setForm({
                      ...form,
                      fromAirportCode: from ?? "",
                      toAirportCode: to ?? "",
                      arrivalTime: calculateArrivalTime(
                        form.departureTime,
                        from ?? "",
                        to ?? "",
                      ),
                    });
                  }}
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option
                      key={`${route.from}-${route.to}`}
                      value={`${route.from}-${route.to}`}
                    >
                      {route.from} → {route.to}
                    </option>
                  ))}
                </select>
                {routes.length === 0 && (
                  <span className="mt-1 block font-normal text-[#c56d61]">
                    Create a route first.
                  </span>
                )}
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                Arrival time (automatic)
                <input
                  readOnly
                  value={form.arrivalTime}
                  placeholder="Select a route and date/time"
                  className="flight-auto-field mt-1 block w-full rounded-lg border px-3 py-2 text-[11px] font-normal"
                />
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                Flight duration (automatic)
                <input
                  readOnly
                  value={
                    form.fromAirportCode && form.toAirportCode
                      ? formatDuration(
                          getRouteDuration(
                            form.fromAirportCode,
                            form.toAirportCode,
                          ),
                        )
                      : ""
                  }
                  placeholder="Select a route"
                  className="flight-auto-field mt-1 block w-full rounded-lg border px-3 py-2 text-[11px] font-normal"
                />
              </label>
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
        {pendingDelete && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-[#172b3a]/45 px-5">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-flight-title"
              className="w-full max-w-md rounded-xl border border-[#dce5e8] bg-white p-6 text-[#172b3a] shadow-2xl"
            >
              <h2
                id="delete-flight-title"
                className="text-[15px] font-semibold"
              >
                Remove flight {pendingDelete.id}?
              </h2>
              <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingDelete(null)}
                  className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold text-[#526a73]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="rounded-lg bg-[#c56d61] px-4 py-2 text-[11px] font-bold text-white"
                >
                  Remove flight
                </button>
              </div>
            </div>
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
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#dce5e8] bg-white">
          <div className="min-w-275">
            <div className="grid grid-cols-[130px_minmax(180px,1fr)_190px_190px_120px_100px_130px_110px_130px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#839198]">
              <span>Flight number</span>
              <span>Route</span>
              <span>Departure</span>
              <span>Arrival</span>
              <span>Duration</span>
              <span>Price</span>
              <span>Seats</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {visible.map((flight) => (
              <div
                key={flight.id}
                className="grid grid-cols-[130px_minmax(180px,1fr)_190px_190px_120px_100px_130px_110px_130px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
              >
                <strong>{flight.id}</strong>
                <span>
                  {flight.from} → {flight.to}
                </span>
                <span>{flight.departureTime.replace("T", " ")}</span>
                <span>{flight.arrivalTime.replace("T", " ")}</span>
                <span>{formatDuration(getFlightDuration(flight))}</span>
                <span>{displayPrice(flight.price)}</span>
                <span>
                  {flight.seatsAvailable}/{flight.capacity} seats
                </span>
                <span>{flight.status ?? "Scheduled"}</span>
                {canWrite("FLIGHTS") && (
                  <span className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(flight.databaseId || flight.id);
                        setForm({
                          flightNumber: flight.id,
                          aircraftId: flight.aircraftId ?? "",
                          fromAirportCode: flight.from,
                          toAirportCode: flight.to,
                          departureTime: flight.departureTime.slice(0, 16),
                          arrivalTime: calculateArrivalTime(
                            flight.departureTime.slice(0, 16),
                            flight.from,
                            flight.to,
                          ),
                          price: String(flight.price),
                          seatCapacity: String(flight.capacity),
                          seatsAvailable: String(flight.seatsAvailable),
                          status: flight.status ?? "Scheduled",
                        });
                        setShowForm(true);
                      }}
                      className="font-semibold text-[#0e6b69]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(flight)}
                      className="font-semibold text-[#c56d61]"
                    >
                      Remove
                    </button>
                  </span>
                )}
              </div>
            ))}
          </div>
          {visible.length === 0 && (
            <p className="m-4 rounded-lg border border-dashed border-[#cbdcdf] p-6 text-center text-[11px] text-[#839198]">
              No flights match your search.
            </p>
          )}
        </div>
      </div>
    </AirlineSystem>
  );
}
