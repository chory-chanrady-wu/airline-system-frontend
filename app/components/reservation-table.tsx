"use client";

import { useState } from "react";

type Reservation = {
  id: string;
  passenger: string;
  route: string;
  date: string;
  status: string;
  amount: string;
  flightId?: string;
  flightNumber?: string;
  seatNumber?: string;
  waitlistPosition?: number;
  departureTime?: string;
  arrivalTime?: string;
  durationMinutes?: number;
};

function formatTravelDateTime(value: string) {
  const [date, time = ""] = value.replace(" ", "T").split("T");
  const formattedTime = time.slice(0, 5);
  return formattedTime ? `${date} ${formattedTime}` : date;
}

function formatDuration(durationMinutes?: number) {
  if (!durationMinutes || durationMinutes <= 0) return "—";
  const totalMinutes = Math.round(durationMinutes);
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}h ${String(totalMinutes % 60).padStart(2, "0")}m`;
}

export function ReservationTable({
  rows,
  onCancel,
  onDelete,
  onUndo,
  onUpdate,
}: {
  rows: Reservation[];
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUndo?: (id: string) => void;
  onUpdate?: (id: string, status: string) => void;
}) {
  const [ticketRow, setTicketRow] = useState<Reservation | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-[#dce5e8] bg-white">
      {ticketRow && (
        <div className="print-ticket-only fixed inset-0 z-50 grid place-items-center bg-[#172b3a]/30 px-5 print:static print:bg-transparent print:px-0">
          <div className="print-ticket-card w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#2b8582] bg-white text-[#172b3a] shadow-2xl print:max-w-full print:shadow-none">
            <div className="flex items-center justify-between bg-[#0e6b69] px-6 py-4 text-white">
              <div>
                <p className="text-[15px] font-black tracking-[2px]">
                  SKYLINE AIR
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[2px] text-[#bce4dc]">
                  Boarding pass
                </p>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[9px] font-bold uppercase tracking-[1px]">
                {ticketRow.status}
              </span>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#839198]">
                    Route
                  </p>
                  <p className="mt-1 truncate text-[22px] font-black tracking-tight text-[#0e6b69]">
                    {ticketRow.route || "—"}
                  </p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-[#9accc3] text-[#0e6b69]">
                  ✈
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#839198]">
                    Flight
                  </p>
                  <p className="mt-1 truncate text-[15px] font-black">
                    {ticketRow.flightNumber || "—"}
                  </p>
                </div>
              </div>
              <div className="my-4 border-t border-dashed border-[#c9dadd]" />
              <div className="grid grid-cols-[minmax(130px,2fr)_minmax(72px,1fr)_minmax(42px,0.7fr)_minmax(92px,1.3fr)] gap-3 text-[10px]">
                <span>
                  <strong className="block text-[8px] uppercase tracking-[1px] text-[#839198]">
                    Passenger
                  </strong>
                  <b className="mt-1 block wrap-break-word text-[11px] leading-tight">
                    {ticketRow.passenger}
                  </b>
                </span>
                <span>
                  <strong className="block text-[8px] uppercase tracking-[1px] text-[#839198]">
                    Seat
                  </strong>
                  <b className="mt-1 block text-[11px]">
                    {ticketRow.seatNumber || "—"}
                  </b>
                </span>
                <span>
                  <strong className="block text-[8px] uppercase tracking-[1px] text-[#839198]">
                    Booking
                  </strong>
                  <b className="mt-1 block break-all text-[11px]">
                    {ticketRow.id}
                  </b>
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-5">
                <div
                  className="flex h-8 flex-1 items-stretch gap-1 overflow-hidden opacity-80"
                  aria-label="Ticket barcode"
                >
                  {[
                    2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 4,
                    2, 1,
                  ].map((width, index) => (
                    <i
                      key={index}
                      className="bg-[#172b3a]"
                      style={{ width: `${width}px` }}
                    />
                  ))}
                </div>
                <span className="text-right text-[10px] font-bold text-[#526a73]">
                  {ticketRow.amount}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-dashed border-[#c9dadd] pt-3 text-[10px]">
                <span>
                  <strong className="block text-[8px] uppercase tracking-[1px] text-[#839198]">Departure</strong>
                  <b className="mt-1 block text-[10px]">{formatTravelDateTime(ticketRow.departureTime || ticketRow.date)}</b>
                </span>
                <span>
                  <strong className="block text-[8px] uppercase tracking-[1px] text-[#839198]">Arrival</strong>
                  <b className="mt-1 block text-[10px]">{formatTravelDateTime(ticketRow.arrivalTime || "")}</b>
                </span>
                <span>
                  <strong className="block text-[8px] uppercase tracking-[1px] text-[#839198]">Duration</strong>
                  <b className="mt-1 block text-[10px]">{formatDuration(ticketRow.durationMinutes)}</b>
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setTicketRow(null)}
                className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold text-[#526a73]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-lg bg-[#0e6b69] px-4 py-2 text-[11px] font-bold text-white"
              >
                Print ticket
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-170 border-collapse text-left">
          <thead className="bg-[#f7fafb] text-[10px] uppercase tracking-[1px] text-[#839198]">
            <tr>
              <th className="px-5 py-3 font-bold">Booking ID</th>
              <th className="px-5 py-3 font-bold">Passenger</th>
              <th className="px-5 py-3 font-bold">Flight</th>
              <th className="px-5 py-3 font-bold">Route</th>
              <th className="px-5 py-3 font-bold">Seat</th>
              <th className="px-5 py-3 font-bold">Departure</th>
              <th className="px-5 py-3 font-bold">Arrival</th>
              <th className="px-5 py-3 font-bold">Duration</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 text-right font-bold">Amount</th>
              {(onCancel || onDelete || onUndo || onUpdate) && (
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="text-[11px] hover:bg-[#fbfdfd]" key={row.id}>
                <td className="px-5 py-4 font-bold text-[#0e6b69]">{row.id}</td>
                <td className="px-5 py-4 font-semibold">{row.passenger}</td>
                <td className="px-5 py-4 text-[#71838a]">
                  {row.flightNumber || "—"}
                </td>
                <td className="px-5 py-4 text-[#71838a]">{row.route}</td>
                <td className="px-5 py-4 text-[#71838a]">
                  {row.seatNumber || "—"}
                </td>
                <td className="px-5 py-4 text-[#71838a]">
                  {formatTravelDateTime(row.departureTime || row.date)}
                </td>
                <td className="px-5 py-4 text-[#71838a]">
                  {formatTravelDateTime(row.arrivalTime || "")}
                </td>
                <td className="px-5 py-4 text-[#71838a]">
                  {formatDuration(row.durationMinutes)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold ${row.status === "Confirmed" ? "bg-[#e7f5ed] text-[#4d9b73]" : row.status === "Waitlisted" || row.status === "Pending" ? "bg-[#fff5df] text-[#b1863f]" : "bg-[#fbeae7] text-[#c56d61]"}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-bold">{row.amount}</td>
                {(onCancel || onDelete || onUndo || onUpdate) && (
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="mr-3 font-semibold text-[#0e6b69] hover:underline"
                      onClick={(event) => {
                        event.stopPropagation();
                        setTicketRow(row);
                      }}
                    >
                      Ticket
                    </button>
                    {onUpdate && (
                      <select
                        value={row.status}
                        onChange={(event) => {
                          event.stopPropagation();
                          onUpdate(row.id, event.target.value);
                        }}
                        className="mr-3 rounded border border-[#dce5e8] bg-white px-1 py-1 text-[9px]"
                      >
                        <option>Confirmed</option>
                        <option>Waitlisted</option>
                        <option>Cancelled</option>
                      </select>
                    )}
                    {row.status !== "Cancelled" && onCancel && (
                      <button
                        type="button"
                        className="mr-3 font-semibold text-[#c56d61] hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          onCancel(row.id);
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    {row.status === "Cancelled" && onUndo && (
                      <button
                        type="button"
                        className="mr-3 font-semibold text-[#0e6b69] hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          onUndo(row.id);
                        }}
                      >
                        Undo
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        className="font-semibold text-[#c56d61] hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDelete(row.id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
