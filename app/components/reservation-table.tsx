"use client";

import { reservations } from "./airline-data";
import { useState } from "react";

type Reservation = (typeof reservations)[number];

export function ReservationTable({ rows }: { rows: Reservation[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-[#dce5e8] bg-white">
      {selectedId && (
        <p className="border-b border-[#eef2f3] bg-[#eef8f5] px-5 py-3 text-[11px] text-[#0e6b69]">
          Opening reservation {selectedId}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead className="bg-[#f7fafb] text-[10px] uppercase tracking-[1px] text-[#839198]">
            <tr>
              <th className="px-5 py-3 font-bold">Booking ID</th>
              <th className="px-5 py-3 font-bold">Passenger</th>
              <th className="px-5 py-3 font-bold">Route</th>
              <th className="px-5 py-3 font-bold">Travel date</th>
              <th className="px-5 py-3 font-bold">Status</th>
              <th className="px-5 py-3 text-right font-bold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eef2f3]">
            {rows.map((row) => (
              <tr
                className="text-[11px] hover:bg-[#fbfdfd]"
                key={row.id}
                onClick={() => setSelectedId(row.id)}
              >
                <td className="px-5 py-4 font-bold text-[#0e6b69]">{row.id}</td>
                <td className="px-5 py-4 font-semibold">{row.passenger}</td>
                <td className="px-5 py-4 text-[#71838a]">{row.route}</td>
                <td className="px-5 py-4 text-[#71838a]">{row.date}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold ${row.status === "Confirmed" ? "bg-[#e7f5ed] text-[#4d9b73]" : row.status === "Pending" ? "bg-[#fff5df] text-[#b1863f]" : "bg-[#fbeae7] text-[#c56d61]"}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-bold">{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
