"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import {
  createAirportWithApi,
  deleteAirportWithApi,
  fetchAirportsFromApi,
  updateAirportWithApi,
} from "../../../services/api";

const AirportLocationPicker = dynamic(
  () =>
    import("../../../components/airport-location-picker").then(
      (module) => module.AirportLocationPicker,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-65 place-items-center rounded-lg border border-[#dce5e8] text-[11px] text-[#839198]">
        Loading map…
      </div>
    ),
  },
);

type AirportForm = {
  code: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
  timezone: string;
};
type AirportRow = Omit<AirportForm, "latitude" | "longitude"> & {
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function AirportPage() {
  const [airports, setAirports] = useState<AirportRow[]>([]);
  const [form, setForm] = useState<AirportForm>({
    code: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    timezone: "",
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function refresh() {
    try {
      const backendAirports = await fetchAirportsFromApi();
      if (backendAirports.length > 0) {
        setAirports(
          backendAirports.map((airport) => ({
            code: String(airport.code ?? ""),
            city: String(airport.city ?? ""),
            country: String(airport.country ?? ""),
            latitude: airport.latitude,
            longitude: airport.longitude,
            timezone: String(airport.timezone ?? ""),
            createdAt: airport.createdAt,
            updatedAt: airport.updatedAt,
          })),
        );
        return;
      }
    } catch {}
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
      const airport = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      if (editing) {
        await updateAirportWithApi(editing, {
          city: airport.city,
          country: airport.country,
          latitude: airport.latitude,
          longitude: airport.longitude,
          timezone: airport.timezone,
        });
      } else {
        await createAirportWithApi({
          code: airport.code,
          city: airport.city,
          country: airport.country,
          latitude: airport.latitude,
          longitude: airport.longitude,
          timezone: airport.timezone,
        });
      }
      setForm({
        code: "",
        city: "",
        country: "",
        latitude: "",
        longitude: "",
        timezone: "",
      });
      setEditing(null);
      setShowForm(false);
      await refresh();
      setMessage("Airport saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save airport.",
      );
      setForm({
        code: "",
        city: "",
        country: "",
        latitude: "",
        longitude: "",
        timezone: "",
      });
      setEditing(null);
      setShowForm(false);
      await refresh();
    }
  }

  function cancelEditing() {
    setEditing(null);
    setForm({
      code: "",
      city: "",
      country: "",
      latitude: "",
      longitude: "",
      timezone: "",
    });
    setMessage("");
    setShowForm(false);
  }

  function openNewAirportForm() {
    cancelEditing();
    setShowForm(true);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const airportCode = pendingDelete;
    try {
      await deleteAirportWithApi(airportCode);
      setMessage(`Airport ${airportCode} removed successfully.`);
      setPendingDelete(null);
      await refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : `Unable to remove airport ${airportCode}. It may still be used by a route or flight.`,
      );
    }
  }

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Airport"
          title="Airport management"
          action={showForm ? "Close form" : "New airport"}
          onAction={showForm ? cancelEditing : openNewAirportForm}
        />
        {showForm && (
          <form
            onSubmit={submit}
            className="rounded-xl border border-[#dce5e8] bg-white p-5"
          >
            <h3 className="font-semibold">
              {editing ? "Edit airport" : "Add airport vertex"}
            </h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                required
                disabled={Boolean(editing)}
                placeholder="Airport code"
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value.toUpperCase() })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                placeholder="Country (e.g. Cambodia)"
                value={form.country}
                onChange={(event) =>
                  setForm({ ...form, country: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                type="number"
                step="any"
                placeholder="Latitude (e.g. 40.6413)"
                value={form.latitude}
                onChange={(event) =>
                  setForm({ ...form, latitude: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                type="number"
                step="any"
                placeholder="Longitude (e.g. -73.7781)"
                value={form.longitude}
                onChange={(event) =>
                  setForm({ ...form, longitude: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                placeholder="City"
                value={form.city}
                onChange={(event) =>
                  setForm({ ...form, city: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                placeholder="Timezone (e.g. WIB)"
                value={form.timezone}
                onChange={(event) =>
                  setForm({
                    ...form,
                    timezone: event.target.value.toUpperCase(),
                  })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
            </div>
            <div className="mt-4">
              <AirportLocationPicker
                latitude={form.latitude ? Number(form.latitude) : undefined}
                longitude={form.longitude ? Number(form.longitude) : undefined}
                onChange={(latitude, longitude) =>
                  setForm({
                    ...form,
                    latitude: String(latitude),
                    longitude: String(longitude),
                  })
                }
                onAddressChange={(city, country, timezone) =>
                  setForm((current) => ({
                    ...current,
                    city: city || current.city,
                    country: country || current.country,
                    timezone: timezone || current.timezone,
                  }))
                }
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white">
                {editing ? "Update airport" : "Add airport"}
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
                Remove airport {pendingDelete}?
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                Airports used by routes or flights cannot be removed.
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
          <div className="grid min-w-[1050px] grid-cols-[90px_1.2fr_1.2fr_110px_130px_170px_140px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[.8px] text-[#839198]">
            <span>Code</span>
            <span>City</span>
            <span>Country</span>
            <span>Timezone</span>
            <span>Coordinates</span>
            <span>Updated</span>
            <span>Actions</span>
          </div>
          {airports.map((airport) => (
            <div
              key={airport.code}
              className="grid min-w-[1050px] grid-cols-[90px_1.2fr_1.2fr_110px_130px_170px_140px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
            >
              <strong>{airport.code}</strong>
              <span>{airport.city}</span>
              <span>{airport.country || "—"}</span>
              <span>{airport.timezone || "—"}</span>
              <span className="text-[10px] text-[#71838a]">
                {airport.latitude ?? "—"}, {airport.longitude ?? "—"}
              </span>
              <span className="text-[10px] text-[#71838a]">
                {airport.updatedAt
                  ? new Date(airport.updatedAt).toLocaleDateString()
                  : airport.createdAt
                    ? new Date(airport.createdAt).toLocaleDateString()
                    : "—"}
              </span>
              <span className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(airport.code);
                    setShowForm(true);
                    setForm({
                      code: airport.code,
                      city: airport.city,
                      country: airport.country ?? "",
                      latitude: String(airport.latitude ?? ""),
                      longitude: String(airport.longitude ?? ""),
                      timezone: airport.timezone ?? "",
                    });
                  }}
                  className="font-semibold text-[#0e6b69]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(airport.code)}
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
