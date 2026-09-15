"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import {
  calculateDistance,
  loadState,
  type Route,
} from "../../../services/airline-system";
import {
  createRouteWithApi,
  deleteRouteWithApi,
  fetchAirportsFromApi,
  fetchRoutesFromApi,
  updateRouteWithApi,
} from "../../../services/api";

export default function RoutePage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [airports, setAirports] = useState<
    ReturnType<typeof loadState>["airports"]
  >([]);
  const [form, setForm] = useState<Route>({
    from: "",
    to: "",
    distance: 0,
  });
  const [editing, setEditing] = useState<Route | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Route | null>(null);
  const [message, setMessage] = useState("");
  const calculatedDistance = calculateDistance(form.from, form.to, airports);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function refresh() {
    try {
      const [backendRoutes, backendAirports] = await Promise.all([
        fetchRoutesFromApi(),
        fetchAirportsFromApi(),
      ]);
      const loadedAirports = backendAirports.map((airport) => ({
        code: String(airport.code ?? "")
          .trim()
          .toUpperCase(),
        city: String(airport.city ?? ""),
        latitude: airport.latitude,
        longitude: airport.longitude,
      }));
      if (backendRoutes.length > 0 || backendAirports.length > 0) {
        setRoutes(
          backendRoutes.map((route) => {
            const from = String(
              (route as Record<string, unknown>).from ??
                (route as Record<string, unknown>).fromAirportCode ??
                "",
            )
              .trim()
              .toUpperCase();
            const to = String(
              (route as Record<string, unknown>).to ??
                (route as Record<string, unknown>).toAirportCode ??
                "",
            )
              .trim()
              .toUpperCase();
            const backendDistance = Number(
              (route as Record<string, unknown>).distance ??
                (route as Record<string, unknown>).distanceKm ??
                0,
            );
            const calculatedRouteDistance = calculateDistance(
              from,
              to,
              loadedAirports,
            );
            return {
              from,
              to,
              distance:
                backendDistance > 0
                  ? backendDistance
                  : (calculatedRouteDistance ?? 0),
            };
          }),
        );
        setAirports(loadedAirports);
        return;
      }
    } catch {}
    setRoutes([]);
    setAirports([]);
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const routeDistance = calculatedDistance ?? form.distance;
    if (!form.from || !form.to || routeDistance <= 0) {
      setMessage(
        "Select two airports with valid coordinates to detect the distance.",
      );
      return;
    }
    try {
      if (editing) {
        await updateRouteWithApi(editing.from, editing.to, {
          fromAirportCode: form.from,
          toAirportCode: form.to,
          distanceKm: routeDistance,
          active: true,
        });
        setMessage("Route updated successfully.");
      } else {
        await createRouteWithApi({
          fromAirportCode: form.from,
          toAirportCode: form.to,
          distanceKm: routeDistance,
          active: true,
        });
        setMessage("Route saved successfully.");
      }
      setEditing(null);
      setShowForm(false);
      setForm({ from: "", to: "", distance: 0 });
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save route.",
      );
      setEditing(null);
      setShowForm(false);
      setForm({ from: "", to: "", distance: 0 });
      await refresh();
    }
  }

  function cancelEditing() {
    setEditing(null);
    setShowForm(false);
    setForm({ from: "", to: "", distance: 0 });
    setMessage("");
  }

  function openNewRouteForm() {
    cancelEditing();
    setShowForm(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const route = pendingDelete;
    try {
      await deleteRouteWithApi(route.from, route.to);
      setMessage(`Route ${route.from} → ${route.to} removed successfully.`);
      setPendingDelete(null);
      await refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "";
      const isReferencedRoute =
        errorMessage.toLowerCase().includes("foreign key") ||
        errorMessage.toLowerCase().includes("still referenced") ||
        errorMessage.toLowerCase().includes("violates foreign key");
      setMessage(
        isReferencedRoute
          ? `Cannot remove route ${route.from} → ${route.to}: one or more flights still use this route. Delete or reassign those flights first.`
          : errorMessage ||
              `Unable to remove route ${route.from} → ${route.to}.`,
      );
    }
  }

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Route"
          title="Route management"
          action={showForm ? "Close form" : "New route"}
          onAction={showForm ? cancelEditing : openNewRouteForm}
        />
        {showForm && (
          <form
            onSubmit={submit}
            className="rounded-xl border border-[#dce5e8] bg-white p-5"
          >
            <h3 className="font-semibold">
              {editing ? "Edit route edge" : "Add route edge"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-[10px] font-bold text-[#839198]">
                Origin
                <select
                  value={form.from}
                  onChange={(event) =>
                    setForm({ ...form, from: event.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
                >
                  {airports.map((airport) => (
                    <option key={airport.code}>{airport.code}</option>
                  ))}
                </select>
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                Destination
                <select
                  value={form.to}
                  onChange={(event) =>
                    setForm({ ...form, to: event.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal"
                >
                  {airports.map((airport) => (
                    <option key={airport.code}>{airport.code}</option>
                  ))}
                </select>
              </label>
              <div className="text-[10px] font-bold text-[#839198]">
                Calculated distance
                <div className="mt-1 flex h-7.75 items-center rounded-lg border border-[#c5e2dc] bg-[#eef8f5] px-3 text-[11px] font-bold text-[#0e6b69]">
                  {calculatedDistance === null
                    ? "Add coordinates to both airports"
                    : `${calculatedDistance.toLocaleString()} km`}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white">
                {editing ? "Update route" : "Add route"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
        {message && (
          <p
            className="my-4 rounded-lg bg-[#eef8f5] px-4 py-3 text-[11px] text-[#0e6b69]"
            role="status"
          >
            {message}
          </p>
        )}
        {pendingDelete && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-[#172b3a]/20 px-5">
            <div className="w-full max-w-90 rounded-xl border border-[#dce5e8] bg-white p-6 text-[#172b3a] shadow-2xl">
              <p className="text-[15px] font-semibold">
                Remove route {pendingDelete.from} → {pendingDelete.to}?
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                Routes used by flights cannot be removed.
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
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#dce5e8] bg-white">
          <div className="grid grid-cols-[1fr_1fr_1fr_180px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase text-[#839198]">
            <span>Origin</span>
            <span>Destination</span>
            <span>Distance</span>
            <span>Actions</span>
          </div>
          {routes.map((route) => (
            <div
              key={`${route.from}-${route.to}`}
              className="grid grid-cols-[1fr_1fr_1fr_180px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
            >
              <strong>{route.from}</strong>
              <span>{route.to}</span>
              <span>{route.distance.toLocaleString()} km</span>
              <span className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(route);
                    setShowForm(true);
                    setForm(route);
                  }}
                  className="font-semibold text-[#0e6b69]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(route)}
                  className="font-semibold text-[#c56d61]"
                >
                  Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </AirlineSystem>
  );
}
