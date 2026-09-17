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
};

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
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#172b3a]/30 px-5 print:static print:bg-transparent print:px-0">
          <div className="w-full max-w-md rounded-xl border border-[#dce5e8] bg-white p-6 text-[#172b3a] shadow-2xl print:max-w-full print:border-0 print:shadow-none">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold">Boarding ticket</p>
              <span className="rounded-full bg-[#eef8f5] px-2 py-1 text-[9px] font-bold text-[#0e6b69]">
                {ticketRow.status}
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-[11px]">
              <span>
                <strong>Booking ID:</strong> {ticketRow.id}
              </span>
              <span>
                <strong>Passenger:</strong> {ticketRow.passenger}
              </span>
              <span>
                <strong>Flight:</strong> {ticketRow.flightNumber || "—"}
              </span>
              <span>
                <strong>Route:</strong> {ticketRow.route}
              </span>
              <span>
                <strong>Seat:</strong> {ticketRow.seatNumber || "—"}
              </span>
              <span>
                <strong>Travel date:</strong> {ticketRow.date}
              </span>
              <span>
                <strong>Amount:</strong> {ticketRow.amount}
              </span>
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
              <th className="px-5 py-3 font-bold">Travel date</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 text-right font-bold">Amount</th>
              {(onCancel || onDelete || onUndo || onUpdate) && (
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef2f3]">
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
                <td className="px-5 py-4 text-[#71838a]">{row.date}</td>
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
