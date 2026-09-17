"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import {
  createPassengerWithApi,
  deletePassengerWithApi,
  fetchBookingsFromApi,
  fetchPassengersFromApi,
  fetchUsersFromApi,
} from "../../services/api";
import type { ApiPassenger, ApiUser } from "../../ustils/type";

type PassengerRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  passportNumber: string;
  nationality: string;
  phone: string;
  dateOfBirth: string;
  emergencyContact: string;
};

const emptyForm = {
  userId: "",
  fullName: "",
  passportNumber: "",
  nationality: "",
  phone: "",
  dateOfBirth: "",
  emergencyContact: "",
};

export default function PassengersPage() {
  const [passengers, setPassengers] = useState<PassengerRow[]>([]);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>(
    {},
  );
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PassengerRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    try {
      const [backendPassengers, backendUsers, backendBookings] =
        await Promise.all([
          fetchPassengersFromApi(),
          fetchUsersFromApi(),
          fetchBookingsFromApi().catch(() => []),
        ]);
      setUsers(backendUsers);
      const counts: Record<string, number> = {};
      for (const booking of backendBookings) {
        const passengerId = String(booking.passengerId ?? "");
        if (!passengerId) continue;
        counts[passengerId] = (counts[passengerId] ?? 0) + 1;
      }
      setBookingCounts(counts);
      setPassengers(
        backendPassengers.map((passenger: ApiPassenger) => ({
          id: String(passenger.id ?? ""),
          userId: String(passenger.userId ?? ""),
          name: String(passenger.fullName ?? passenger.userName ?? "Passenger"),
          email: String(passenger.userEmail ?? ""),
          passportNumber: String(passenger.passportNumber ?? ""),
          nationality: String(passenger.nationality ?? ""),
          phone: String(passenger.phone ?? ""),
          dateOfBirth: String(passenger.dateOfBirth ?? ""),
          emergencyContact: String(passenger.emergencyContact ?? ""),
        })),
      );
    } catch {
      setPassengers([]); // Clear passengers to prevent reading local demo records
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

  const bookingCount = (id: string) => bookingCounts[id] ?? 0;
  const activePassengers = passengers.filter(
    (passenger) => bookingCount(passenger.id) > 0,
  ).length;
  const totalBookings = Object.values(bookingCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const visiblePassengers = passengers.filter((passenger) =>
    `${passenger.name} ${passenger.email} ${passenger.passportNumber}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const passengerUserIds = new Set(
    passengers.map((passenger) => passenger.userId),
  );
  const availableUsers = users.filter(
    (user) => !passengerUserIds.has(String(user.id ?? "")),
  );

  async function createPassenger(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createPassengerWithApi({
        userId: form.userId ? form.userId : null,
        fullName: form.fullName,
        passportNumber: form.passportNumber,
        nationality: form.nationality,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        emergencyContact: form.emergencyContact,
      });
      setForm(emptyForm);
      setShowForm(false);
      await refresh();
      setMessage("Passenger created successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create passenger.",
      );
      await refresh();
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    try {
      await deletePassengerWithApi(pendingDelete.id);
      await refresh();
      setMessage("Passenger removed successfully.");
      setPendingDelete(null);
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
        {pendingDelete && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-[#172b3a]/20 px-5">
            <div className="w-full max-w-md rounded-xl border border-[#dce5e8] bg-white p-6 text-[#172b3a] shadow-2xl">
              <p className="text-[15px] font-semibold">
                Remove {pendingDelete.name}?
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                This will permanently delete the passenger account.
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
                  Delete passenger
                </button>
              </div>
            </div>
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
            <p className="text-[11px] text-[#839198]">Total bookings</p>
            <strong className="mt-2 block text-2xl">{totalBookings}</strong>
            <span className="mt-1 block text-[10px] text-[#b1863f]">
              Across all passengers
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
                <h3 className="font-semibold">Add passenger profile</h3>
                <p className="mt-1 text-[11px] text-[#839198]">
                  Optionally link a user account to a passenger profile.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <select
                value={form.userId}
                onChange={(event) =>
                  setForm({ ...form, userId: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px]"
              >
                <option value="">No linked user account</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={String(user.id ?? "")}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                placeholder="Passport number"
                value={form.passportNumber}
                onChange={(event) =>
                  setForm({ ...form, passportNumber: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                placeholder="Nationality"
                value={form.nationality}
                onChange={(event) =>
                  setForm({ ...form, nationality: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                placeholder="Phone number"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                type="date"
                placeholder="Date of birth"
                value={form.dateOfBirth}
                onChange={(event) =>
                  setForm({ ...form, dateOfBirth: event.target.value })
                }
                className="rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px]"
              />
              <input
                required
                placeholder="Emergency contact number"
                value={form.emergencyContact}
                onChange={(event) =>
                  setForm({ ...form, emergencyContact: event.target.value })
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
              <div className="grid grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr_0.8fr_1fr_80px_80px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                <span>Passenger</span>
                <span>Passport</span>
                <span>Nationality</span>
                <span>Phone</span>
                <span>DOB</span>
                <span>Emergency contact</span>
                <span>Bookings</span>
                <span>Action</span>
              </div>
              {visiblePassengers.map((passenger) => {
                const bookings = bookingCount(passenger.id);
                return (
                  <div
                    key={passenger.id}
                    className="grid grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr_0.8fr_1fr_80px_80px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
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
                    <span className="text-[#71838a]">
                      {passenger.passportNumber}
                    </span>
                    <span className="text-[#71838a]">
                      {passenger.nationality}
                    </span>
                    <span className="text-[#71838a]">{passenger.phone}</span>
                    <span className="text-[#71838a]">
                      {passenger.dateOfBirth}
                    </span>
                    <span className="text-[#71838a]">
                      {passenger.emergencyContact}
                    </span>
                    <span>{bookings}</span>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(passenger)}
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
