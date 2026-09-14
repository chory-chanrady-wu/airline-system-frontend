"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import { loadState, type User } from "../../services/airline-system";
import {
  createPassengerWithApi,
  deletePassengerWithApi,
  fetchPassengersFromApi,
} from "../../services/api";

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [apiNotice, setApiNotice] = useState("");

  async function refresh() {
    try {
      const backendPassengers = await fetchPassengersFromApi();
      if (backendPassengers.length > 0) {
        setPassengers(
          backendPassengers.map((passenger) => ({
            id: String((passenger as Record<string, unknown>).id ?? ""),
            name: String(
              (passenger as Record<string, unknown>).name ?? "Passenger",
            ),
            email: String((passenger as Record<string, unknown>).email ?? ""),
            password: String(
              (passenger as Record<string, unknown>).password ?? "",
            ),
            role:
              ((passenger as Record<string, unknown>).role as
                | "Passenger"
                | "Admin") ?? "Passenger",
          })),
        );
        setApiNotice("Live passenger directory loaded from backend.");
        return;
      }
    } catch {
      setApiNotice("Backend unavailable — passenger data cannot be loaded.");
    }
    setPassengers([]); // Clear passengers to prevent reading local demo records
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const state = loadState();
  const bookingCount = (id: string) =>
    state.bookings.filter((booking) => booking.passengerId === id).length;
  const activePassengers = passengers.filter(
    (passenger) => bookingCount(passenger.id) > 0,
  ).length;
  const waitlistedPassengers = state.bookings.filter(
    (booking) => booking.status === "Waitlisted",
  ).length;
  const visiblePassengers = passengers.filter((passenger) =>
    `${passenger.name} ${passenger.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  async function createPassenger(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createPassengerWithApi({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "Passenger",
      });
      setForm({ name: "", email: "", password: "" });
      setShowForm(false);
      await refresh();
      setMessage("Passenger account created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create passenger.",
      );
      await refresh();
    }
  }

  async function deletePassenger(id: string) {
    try {
      await deletePassengerWithApi(id);
      await refresh();
      setMessage("Passenger removed successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to remove passenger.",
      );
      await refresh();
    }
  }

  return (
    <AirlineSystem initialModule="Passengers">
      <div className="module-page w-full">
        <PageTitle
          eyebrow="Customer records"
          title="Passengers"
          action={showForm ? "Close form" : "Add passenger"}
          onAction={() => setShowForm((open) => !open)}
        />
        {apiNotice && (
          <div className="mb-4 rounded-lg border border-[#dfeae8] bg-[#edf7f5] px-4 py-3 text-[11px] text-[#0e6b69]">
            {apiNotice}
          </div>
        )}
        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Passenger analytics"
        >
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5 shadow-sm">
            <p className="text-[11px] text-[#839198]">Registered passengers</p>
            <strong className="mt-2 block text-2xl">{passengers.length}</strong>
            <span className="mt-1 block text-[10px] text-[#0e6b69]">
              User hash table
            </span>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5 shadow-sm">
            <p className="text-[11px] text-[#839198]">Active travelers</p>
            <strong className="mt-2 block text-2xl">{activePassengers}</strong>
            <span className="mt-1 block text-[10px] text-[#0e6b69]">
              At least one booking
            </span>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5 shadow-sm">
            <p className="text-[11px] text-[#839198]">Waitlisted passengers</p>
            <strong className="mt-2 block text-2xl">
              {waitlistedPassengers}
            </strong>
            <span className="mt-1 block text-[10px] text-[#b1863f]">
              FIFO waitlist
            </span>
          </div>
        </section>
        {showForm && (
          <form
            onSubmit={createPassenger}
            className="mt-6 rounded-xl border border-[#dce5e8] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e1f2ed] text-[#0e6b69]">
                <Icon name="user" size={18} />
              </span>
              <div>
                <h3 className="font-semibold">Add passenger account</h3>
                <p className="mt-1 text-[11px] text-[#839198]">
                  Create a Passenger login for the booking system.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                minLength={6}
                type="password"
                placeholder="Temporary password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
            </div>
            <button className="mt-4 rounded-lg bg-[#0e6b69] px-4 py-2.5 text-[11px] font-bold text-white">
              Create passenger
            </button>
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
        <section className="mt-6 overflow-hidden rounded-xl border border-[#dce5e8] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f3] p-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#5b9994]">
                Customer directory
              </p>
              <h3 className="mt-1 text-lg font-semibold">Passenger profiles</h3>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#dce5e8] px-3 py-2 text-[#94a2a6]">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search passengers"
                className="w-48 bg-transparent text-[11px] outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-[1.3fr_1.7fr_100px_130px_100px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                <span>Passenger</span>
                <span>Email</span>
                <span>Bookings</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {visiblePassengers.map((passenger) => {
                const bookings = bookingCount(passenger.id);
                return (
                  <div
                    key={passenger.id}
                    className="grid grid-cols-[1.3fr_1.7fr_100px_130px_100px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dceee8] text-[10px] font-bold text-[#0e6b69]">
                        {passenger.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <strong>{passenger.name}</strong>
                    </div>
                    <span className="text-[#71838a]">{passenger.email}</span>
                    <span>{bookings}</span>
                    <span>
                      <span className="rounded-full bg-[#e7f5ed] px-2 py-1 text-[9px] font-bold text-[#4d9b73]">
                        Active
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => deletePassenger(passenger.id)}
                      className="text-left font-semibold text-[#c56d61]"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          {visiblePassengers.length === 0 && (
            <p className="p-8 text-center text-[11px] text-[#839198]">
              No passengers match your search.
            </p>
          )}
        </section>
      </div>
    </AirlineSystem>
  );
}
