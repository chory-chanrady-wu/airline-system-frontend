"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import { loadState, type Airport } from "../../../services/airline-system";
import {
  createAirportWithApi,
  deleteAirportWithApi,
  fetchAirportsFromApi,
  updateAirportWithApi,
} from "../../../services/api";

type AirportForm = {
  code: string;
  city: string;
  latitude: string;
  longitude: string;
};

export default function AirportPage() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [form, setForm] = useState<AirportForm>({
    code: "",
    city: "",
    latitude: "",
    longitude: "",
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [apiNotice, setApiNotice] = useState("");

  async function refresh() {
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
        setApiNotice("Live airport data loaded from backend.");
        return;
      }
    } catch {
      setApiNotice("Backend unavailable — airport data cannot be loaded.");
    }
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
          code: airport.code,
          city: airport.city,
          latitude: airport.latitude,
          longitude: airport.longitude,
        });
      } else {
        await createAirportWithApi({
          code: airport.code,
          city: airport.city,
          latitude: airport.latitude,
          longitude: airport.longitude,
        });
      }
      setForm({ code: "", city: "", latitude: "", longitude: "" });
      setEditing(null);
      await refresh();
      setMessage("Airport saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save airport.",
      );
      setForm({ code: "", city: "", latitude: "", longitude: "" });
      setEditing(null);
      await refresh();
    }
  }

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Airport"
          title="Airport management"
        />
        {apiNotice && (
          <div className="mb-4 rounded-lg border border-[#dfeae8] bg-[#edf7f5] px-4 py-3 text-[11px] text-[#0e6b69]">
            {apiNotice}
          </div>
        )}
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
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white">
              {editing ? "Update airport" : "Add airport"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ code: "", city: "", latitude: "", longitude: "" });
                }}
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
          <div className="grid grid-cols-[1fr_2fr_140px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase text-[#839198]">
            <span>Code</span>
            <span>City</span>
            <span>Actions</span>
          </div>
          {airports.map((airport) => (
            <div
              key={airport.code}
              className="grid grid-cols-[1fr_2fr_140px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
            >
              <strong>{airport.code}</strong>
              <span>{airport.city}</span>
              <span className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(airport.code);
                    setForm({
                      code: airport.code,
                      city: airport.city,
                      latitude: String(airport.latitude ?? ""),
                      longitude: String(airport.longitude ?? ""),
                    });
                  }}
                  className="font-semibold text-[#0e6b69]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deleteAirportWithApi(airport.code);
                    } catch {
                      setMessage("Unable to remove airport.");
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
