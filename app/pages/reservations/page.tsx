"use client";

import { useRouter } from "next/navigation";
import { AirlineSystem } from "../../components/airline-system";
import { reservations } from "../../components/airline-data";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import { ReservationTable } from "../../components/reservation-table";

export default function ReservationsPage() {
  const router = useRouter();

  return (
    <AirlineSystem initialModule="Reservations">
      <div className="mx-auto max-w-[1600px]">
        <PageTitle
          eyebrow="Booking management"
          title="Reservations"
          action="New reservation"
          onAction={() => router.push("/pages/book-flight")}
        />
        <div className="w-full">
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[#94a2a6] sm:max-w-[280px]">
              <Icon name="search" size={16} />
              <input
                className="w-full border-0 bg-transparent text-[11px] outline-none"
                placeholder="Search booking or passenger"
              />
            </div>
            <select className="rounded-lg border border-[#dce5e8] bg-white px-3 text-[11px] text-[#61737d]">
              <option>All statuses</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <button className="rounded-lg border border-[#dce5e8] bg-white px-3 text-[11px] font-semibold text-[#526a73]">
              <Icon name="calendar" size={14} /> Date range
            </button>
          </div>
          <ReservationTable rows={reservations} />
        </div>
      </div>
    </AirlineSystem>
  );
}
