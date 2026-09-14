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
  const [message, setMessage] = useState("");
  const calculatedDistance = calculateDistance(form.from, form.to, airports);

  async function refresh() {
    try {
      const [backendRoutes, backendAirports] = await Promise.all([
        fetchRoutesFromApi(),
        fetchAirportsFromApi(),
      ]);
      if (backendRoutes.length > 0 || backendAirports.length > 0) {
        setRoutes(
          backendRoutes.map((route) => ({
            from: String((route as Record<string, unknown>).from ?? ""),
            to: String((route as Record<string, unknown>).to ?? ""),
            distance: Number((route as Record<string, unknown>).distance ?? 0),
          })),
        );
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
    try {
      if (editing) {
        await updateRouteWithApi(editing.from, editing.to, {
          from: form.from,
          to: form.to,
          distance: form.distance,
        });
        setMessage("Route updated successfully.");
      } else {
        await createRouteWithApi({
          from: form.from,
          to: form.to,
          distance: form.distance,
        });
        setMessage("Route saved successfully.");
      }
      setEditing(null);
      setForm({ from: "", to: "", distance: 0 });
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save route.",
      );
      setEditing(null);
      setForm({ from: "", to: "", distance: 0 });
      await refresh();
    }
  }

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Route"
          title="Route management"
        />
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
              <div className="mt-1 flex h-[31px] items-center rounded-lg border border-[#c5e2dc] bg-[#eef8f5] px-3 text-[11px] font-bold text-[#0e6b69]">
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
                onClick={() => setEditing(null)}
                className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        {message && (
          <p
            className="my-4 rounded-lg bg-[#eef8f5] px-4 py-3 text-[11px] text-[#0e6b69]"
            role="status"
          >
            {message}
          </p>
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
                    setForm(route);
                  }}
                  className="font-semibold text-[#0e6b69]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deleteRouteWithApi(route.from, route.to);
                    } catch {
                      setMessage("Unable to remove route.");
                    }
                    await refresh();
                  }}
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
