"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import { ReservationTable } from "../../components/reservation-table";
import { displayPrice, loadState } from "../../services/airline-system";
import { cancelBookingWithApi, fetchBookingsFromApi } from "../../services/api";

export default function ReservationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ReturnType<typeof loadState>["bookings"]>(
    [],
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateRange, setShowDateRange] = useState(false);
  const [message, setMessage] = useState("");
  const [apiNotice, setApiNotice] = useState("");

  async function refresh() {
    try {
      const backendBookings = await fetchBookingsFromApi();
      if (backendBookings.length > 0) {
        setRows(
          backendBookings.map((booking) => ({
            id: String((booking as Record<string, unknown>).id ?? ""),
            passengerId: String(
              (booking as Record<string, unknown>).passengerId ?? "",
            ),
            passenger: String(
              (booking as Record<string, unknown>).passenger ?? "Guest",
            ),
            flightId: String(
              (booking as Record<string, unknown>).flightId ?? "",
            ),
            route: String((booking as Record<string, unknown>).route ?? ""),
            date: String(
              (booking as Record<string, unknown>).date ??
                new Date().toISOString().slice(0, 10),
            ),
            status:
              ((booking as Record<string, unknown>).status as
                | "Confirmed"
                | "Waitlisted"
                | "Cancelled") ?? "Confirmed",
            amount: Number((booking as Record<string, unknown>).amount ?? 0),
            waitlistPosition:
              Number(
                (booking as Record<string, unknown>).waitlistPosition ?? 0,
              ) || undefined,
          })),
        );
        setApiNotice("Live bookings loaded from backend.");
        return;
      }
    } catch {
      setApiNotice("Backend unavailable — showing local reservation data.");
    }
    setRows([]);
  }

  const visibleRows = rows
    .filter((row) =>
      `${row.id} ${row.passenger} ${row.route}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .filter((row) => status === "All statuses" || row.status === status)
    .filter((row) => !dateFrom || row.date >= dateFrom)
    .filter((row) => !dateTo || row.date <= dateTo)
    .map((row) => ({
      ...row,
      date: row.date,
      amount: displayPrice(row.amount),
    }));

  async function cancel(id: string) {
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

  function undo() {
    setMessage("Undo is available after backend action history is connected.");
  }

  return (
    <AirlineSystem initialModule="Reservations">
      <div className="module-page">
        <PageTitle
          eyebrow="Booking management"
          title="Reservations"
          action="New reservation"
          onAction={() => router.push("/pages/book-flight")}
        />
        <div className="w-full">
          {apiNotice && (
            <div className="mb-4 rounded-lg border border-[#dfeae8] bg-[#edf7f5] px-4 py-3 text-[11px] text-[#0e6b69]">
              {apiNotice}
            </div>
          )}
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
              onClick={undo}
              className="font-bold text-[#0e6b69]"
            >
              Undo last action
            </button>
          </div>
          <ReservationTable rows={visibleRows} onCancel={cancel} />
        </div>
      </div>
    </AirlineSystem>
  );
}
