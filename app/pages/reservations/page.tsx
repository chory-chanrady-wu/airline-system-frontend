"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import { ReservationTable } from "../../components/reservation-table";
import { usePermissions } from "../../hooks/use-permissions";
import { displayPrice, loadState } from "../../services/airline-system";
import {
  cancelBookingWithApi,
  deleteBookingWithApi,
  fetchBookingsFromApi,
  fetchFlightsFromApi,
  fetchPassengersFromApi,
  normalizeApiFlight,
  updateBookingWithApi,
  undoBookingCancellationWithApi,
} from "../../services/api";

export default function ReservationsPage() {
  const router = useRouter();
  const { canWrite } = usePermissions();
  const [rows, setRows] = useState<ReturnType<typeof loadState>["bookings"]>(
    [],
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [sortBy, setSortBy] = useState<
    "date" | "passenger" | "id" | "status" | "amount"
  >("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [message, setMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  async function refresh() {
    try {
      const [backendBookings, backendPassengers, backendFlights] =
        await Promise.all([
          fetchBookingsFromApi(),
          fetchPassengersFromApi().catch(() => []),
          fetchFlightsFromApi().catch(() => []),
        ]);
      const passengerNameById = new Map(
        backendPassengers.map((passenger) => [
          String(passenger.id ?? ""),
          String(
            passenger.fullName ??
              passenger.userName ??
              `Passenger #${passenger.id}`,
          ),
        ]),
      );
      const routeByFlightId = new Map(
        backendFlights.map((flight) => {
          const normalized = normalizeApiFlight(flight);
          return [
            String(flight.id ?? flight.flightId ?? ""),
            `${normalized.from} → ${normalized.to}`,
          ];
        }),
      );
      const flightById = new Map(
        backendFlights.map((flight) => {
          const normalized = normalizeApiFlight(flight);
          return [String(flight.id ?? flight.flightId ?? ""), normalized];
        }),
      );
      if (backendBookings.length > 0) {
        setRows(
          backendBookings.map((booking) => {
            const passengerId = String(booking.passengerId ?? "");
            const flightId = String(booking.flightId ?? "");
            const linkedFlight = flightById.get(flightId);
            const departureTime = String(
              booking.departureTime ?? linkedFlight?.departureTime ?? "",
            );
            const arrivalTime = String(
              booking.arrivalTime ?? linkedFlight?.arrivalTime ?? "",
            );
            const departure = new Date(departureTime).getTime();
            const arrival = new Date(arrivalTime).getTime();
            const calculatedDuration =
              Number.isFinite(departure) &&
              Number.isFinite(arrival) &&
              arrival > departure
                ? (arrival - departure) / (1000 * 60)
                : 0;
            return {
              id: String(booking.id ?? booking.bookingId ?? ""),
              passengerId,
              passenger: String(
                booking.passengerName ??
                  passengerNameById.get(passengerId) ??
                  "Guest",
              ),
              flightId,
              flightNumber: String(booking.flightNumber ?? ""),
              seatNumber: String(booking.seatNumber ?? ""),
              route: String(
                routeByFlightId.get(flightId) ??
                  booking.flightNumber ??
                  (booking as Record<string, unknown>).route ??
                  "",
              ),
              date:
                departureTime ||
                String(
                  (booking as Record<string, unknown>).bookedAt ??
                    (booking as Record<string, unknown>).date ??
                    new Date().toISOString().slice(0, 10),
                ),
              departureTime,
              arrivalTime,
              durationMinutes:
                Number(
                  (booking as Record<string, unknown>).durationMinutes ?? 0,
                ) ||
                calculatedDuration ||
                undefined,
              status:
                (booking.status as "Confirmed" | "Waitlisted" | "Cancelled") ??
                "Confirmed",
              amount: Number(booking.amount ?? 0),
              waitlistPosition:
                Number(
                  (booking as Record<string, unknown>).waitlistPosition ?? 0,
                ) || undefined,
            };
          }),
        );
        return;
      }
    } catch {}
    setRows([]);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const visibleRows = rows
    .filter((row) =>
      `${row.id} ${row.passenger} ${row.route}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .filter((row) => status === "All statuses" || row.status === status)
    .filter((row) => !dateFrom || row.date.slice(0, 10) >= dateFrom)
    .filter((row) => !dateTo || row.date.slice(0, 10) <= dateTo)
    .sort((left, right) => {
      let comparison = 0;
      if (sortBy === "amount") {
        comparison = left.amount - right.amount;
      } else {
        comparison = String(left[sortBy]).localeCompare(
          String(right[sortBy]),
          undefined,
          { numeric: true, sensitivity: "base" },
        );
      }
      return sortDirection === "asc" ? comparison : -comparison;
    })
    .map((row) => ({
      ...row,
      date: row.date,
      amount: displayPrice(row.amount),
    }));

  async function cancel(id: string) {
    if (!canWrite("BOOKINGS")) {
      setMessage("You do not have permission to update bookings.");
      return;
    }
    try {
      await cancelBookingWithApi(id);
      await refresh();
      setMessage(
        "Booking cancelled. The next waitlisted passenger was offered the seat when available.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to cancel booking.",
      );
      await refresh();
    }
  }

  async function undo(id: string) {
    if (!canWrite("BOOKINGS")) {
      setMessage("You do not have permission to update bookings.");
      return;
    }
    try {
      await undoBookingCancellationWithApi(id);
      await refresh();
      setMessage("Booking cancellation undone.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to undo cancellation.",
      );
    }
  }

  function remove(id: string) {
    setPendingDelete(id);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    if (!canWrite("BOOKINGS")) {
      setMessage("You do not have permission to delete bookings.");
      return;
    }
    try {
      await deleteBookingWithApi(pendingDelete);
      setPendingDelete(null);
      await refresh();
      setMessage("Booking deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to delete booking.",
      );
    }
  }

  async function updateStatus(id: string, nextStatus: string) {
    if (!canWrite("BOOKINGS")) {
      setMessage("You do not have permission to update bookings.");
      return;
    }
    try {
      await updateBookingWithApi(id, { status: nextStatus });
      await refresh();
      setMessage("Booking updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update booking.",
      );
    }
  }

  return (
    <AirlineSystem initialModule="Reservations">
      <div className="module-page">
        <PageTitle
          eyebrow="Booking management"
          title="Reservations"
          action={canWrite("BOOKINGS") ? "New reservation" : undefined}
          onAction={
            canWrite("BOOKINGS")
              ? () => router.push("/pages/book-flight")
              : undefined
          }
        />
        <div className="w-full">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[#94a2a6] sm:max-w-70">
              <Icon name="search" size={16} />
              <input
                className="w-full border-0 bg-transparent text-[11px] outline-none"
                placeholder="Search booking or passenger"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-[#dce5e8] bg-white px-3 text-[11px] text-[#61737d]"
            >
              <option>All statuses</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as
                    | "date"
                    | "passenger"
                    | "id"
                    | "status"
                    | "amount",
                )
              }
              className="rounded-lg border border-[#dce5e8] bg-white px-3 text-[11px] text-[#61737d]"
              aria-label="Sort reservations by"
            >
              <option value="date">Sort: departure</option>
              <option value="id">Sort: booking ID</option>
              <option value="passenger">Sort: passenger</option>
              <option value="status">Sort: status</option>
              <option value="amount">Sort: amount</option>
            </select>
            <button
              type="button"
              onClick={() =>
                setSortDirection((direction) =>
                  direction === "asc" ? "desc" : "asc",
                )
              }
              className="rounded-lg border border-[#dce5e8] bg-white px-3 text-[11px] font-semibold text-[#526a73]"
              aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            >
              {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
            </button>
            <button
              type="button"
              onClick={() => setShowDateRange((open) => !open)}
              className="rounded-lg border border-[#dce5e8] bg-white px-3 text-[11px] font-semibold text-[#526a73]"
            >
              <Icon name="calendar" size={14} /> Date range
            </button>
          </div>
          {showDateRange && (
            <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-[#dce5e8] bg-white p-3">
              <label className="text-[10px] font-bold text-[#839198]">
                From
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="mt-1 block rounded border border-[#dce5e8] px-2 py-1 text-[11px] font-normal"
                />
              </label>
              <label className="text-[10px] font-bold text-[#839198]">
                To
                <input
                  type="date"
                  min={dateFrom}
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="mt-1 block rounded border border-[#dce5e8] px-2 py-1 text-[11px] font-normal"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-[11px] font-bold text-[#0e6b69]"
              >
                Clear dates
              </button>
            </div>
          )}
          <div className="mb-3 flex items-center justify-between text-[11px] text-[#526a73]">
            <span>{message}</span>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  "Select a cancelled booking to undo its cancellation.",
                )
              }
              className="font-bold text-[#0e6b69]"
            >
              Undo last action
            </button>
          </div>
          {pendingDelete && (
            <div className="fixed inset-0 z-40 grid place-items-center bg-[#172b3a]/20 px-5">
              <div className="w-full max-w-90 rounded-xl border border-[#dce5e8] bg-white p-6 text-[#172b3a] shadow-2xl">
                <p className="text-[15px] font-semibold">
                  Delete reservation {pendingDelete}?
                </p>
                <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                  This action permanently deletes the reservation and cannot be
                  undone.
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
                    Delete reservation
                  </button>
                </div>
              </div>
            </div>
          )}
          <ReservationTable
            rows={visibleRows}
            onCancel={canWrite("BOOKINGS") ? cancel : undefined}
            onDelete={canWrite("BOOKINGS") ? remove : undefined}
            onUndo={canWrite("BOOKINGS") ? undo : undefined}
            onUpdate={canWrite("BOOKINGS") ? updateStatus : undefined}
          />
        </div>
      </div>
    </AirlineSystem>
  );
}
