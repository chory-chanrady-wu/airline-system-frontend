"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import {
  createAircraftWithApi,
  fetchAircraftsFromApi,
} from "../../../services/api";

type AircraftForm = {
  registrationNumber: string;
  model: string;
  seatCapacity: string;
  active: boolean;
};

type AircraftRow = AircraftForm & {
  id: string;
  createdAt?: string;
};

const emptyForm: AircraftForm = {
  registrationNumber: "",
  model: "",
  seatCapacity: "",
  active: true,
};

export default function AircraftPage() {
  const [aircrafts, setAircrafts] = useState<AircraftRow[]>([]);
  const [form, setForm] = useState<AircraftForm>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function refresh() {
    try {
      const rows = await fetchAircraftsFromApi();
      setAircrafts(
        rows.map((aircraft) => ({
          id: String(aircraft.id ?? aircraft.registrationNumber ?? ""),
          registrationNumber: aircraft.registrationNumber ?? "",
          model: aircraft.model ?? "",
          seatCapacity: String(aircraft.seatCapacity ?? ""),
          active: aircraft.active ?? true,
          createdAt: aircraft.createdAt,
        })),
      );
    } catch (error) {
      setAircrafts([]);
      setMessage(
        error instanceof Error ? error.message : "Unable to load aircraft.",
      );
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createAircraftWithApi({
        registrationNumber: form.registrationNumber.trim().toUpperCase(),
        model: form.model.trim(),
        seatCapacity: Number(form.seatCapacity),
        active: form.active,
      });
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
      setMessage("Aircraft saved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save aircraft.",
      );
    }
  }

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Aircraft"
          title="Aircraft management"
          action={showForm ? "Close form" : "New aircraft"}
          onAction={() => {
            setShowForm((open) => !open);
            setForm(emptyForm);
          }}
        />
        {showForm && (
          <form
            onSubmit={submit}
            className="rounded-xl border border-[#dce5e8] bg-white p-5"
          >
            <h3 className="font-semibold">Add aircraft</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-[10px] font-bold text-[#839198]">
                Registration number
                <input
                  required
                  value={form.registrationNumber}
                  onChange={(event) =>
                    setForm({ ...form, registrationNumber: event.target.value })
                  }
                  placeholder="PK-GAA"
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
                />
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                Aircraft model
                <input
                  required
                  value={form.model}
                  onChange={(event) =>
                    setForm({ ...form, model: event.target.value })
                  }
                  placeholder="Boeing 737-800"
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
                />
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                Seat capacity
                <input
                  required
                  min="1"
                  type="number"
                  value={form.seatCapacity}
                  onChange={(event) =>
                    setForm({ ...form, seatCapacity: event.target.value })
                  }
                  placeholder="180"
                  className="mt-1 block w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal"
                />
              </label>
              <label className="flex items-center gap-2 pt-5 text-[11px] font-semibold text-[#526a73]">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) =>
                    setForm({ ...form, active: event.target.checked })
                  }
                />
                Active aircraft
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white">
                Save aircraft
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
          <p
            className="my-4 rounded-lg bg-[#eef8f5] px-4 py-3 text-[11px] text-[#0e6b69]"
            role="status"
          >
            {message}
          </p>
        )}
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#dce5e8] bg-white">
          <div className="min-w-200">
            <div className="grid grid-cols-[180px_1fr_150px_120px_180px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#839198]">
              <span>Registration</span>
              <span>Model</span>
              <span>Seat capacity</span>
              <span>Status</span>
              <span>Created at</span>
            </div>
            {aircrafts.map((aircraft) => (
              <div
                key={aircraft.id}
                className="grid grid-cols-[180px_1fr_150px_120px_180px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
              >
                <strong>{aircraft.registrationNumber}</strong>
                <span>{aircraft.model}</span>
                <span>{aircraft.seatCapacity} seats</span>
                <span
                  className={
                    aircraft.active ? "text-[#0e6b69]" : "text-[#c56d61]"
                  }
                >
                  {aircraft.active ? "Active" : "Inactive"}
                </span>
                <span className="text-[#71838a]">
                  {aircraft.createdAt
                    ? new Date(aircraft.createdAt).toLocaleString()
                    : "—"}
                </span>
              </div>
            ))}
            {aircrafts.length === 0 && (
              <p className="p-6 text-center text-[11px] text-[#839198]">
                No aircraft found.
              </p>
            )}
          </div>
        </div>
      </div>
    </AirlineSystem>
  );
}
