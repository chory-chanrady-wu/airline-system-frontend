"use client";

import { useRouter } from "next/navigation";
import { AirlineSystem } from "../../components/airline-system";
import { reservations, flights } from "../../components/airline-data";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import { ReservationTable } from "../../components/reservation-table";
import type { Module } from "../../components/airline-data";

export default function DashboardPage() {
  const router = useRouter();
  const navigate = (module: Module) =>
    router.push(
      `/pages/${module === "Dashboard" ? "dashboard" : module.toLowerCase().replace(" ", "-")}`,
    );
  return (
    <AirlineSystem initialModule="Dashboard">
      <div className="mx-auto max-w-[1600px]">
        <PageTitle
          eyebrow="Operations dashboard"
          title="Good morning, Jordan"
          action="Create booking"
          onAction={() => navigate("Book flight")}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total bookings", "1,284", "+12.8%", "ticket"],
            ["Active flights", "48", "+4 today", "plane"],
            ["Passengers", "3,642", "+8.4%", "user"],
            ["Revenue this month", "$284,650", "+16.2%", "sparkle"],
          ].map(([label, value, change, icon]) => (
            <div
              className="rounded-xl border border-[#dce5e8] bg-white p-5"
              key={label}
            >
              <div className="flex items-start justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e1f2ed] text-[#0e6b69]">
                  <Icon name={icon as "ticket"} size={18} />
                </span>
                <span className="rounded-full bg-[#e8f5ee] px-2 py-1 text-[9px] font-bold text-[#4d9b73]">
                  {change}
                </span>
              </div>
              <p className="mt-5 text-[11px] text-[#809198]">{label}</p>
              <strong className="mt-1 block text-[24px]">{value}</strong>
            </div>
          ))}
        </div>
        <div className="mt-7 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#839198]">
              Booking activity
            </p>
            <h3 className="mt-1 text-[18px] font-semibold">
              Weekly performance
            </h3>
            <div className="mt-7 flex h-[180px] items-end justify-between gap-3 border-b border-l border-[#e5ecee] px-4 pt-4">
              {[54, 72, 48, 84, 63, 93, 76].map((height, index) => (
                <div
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  key={index}
                >
                  <div
                    className={`w-full max-w-[36px] rounded-t-md ${index === 5 ? "bg-[#0e6b69]" : "bg-[#b8dcd4]"}`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="text-[9px] text-[#91a0a3]">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#839198]">
              Today&apos;s schedule
            </p>
            <h3 className="mt-1 text-[18px] font-semibold">Flight status</h3>
            <div className="mt-5 grid gap-3">
              {flights.map((flight) => (
                <div
                  className="flex items-center gap-3 border-b border-[#eef2f3] pb-3"
                  key={flight.code}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef5f3] text-[9px] font-bold text-[#0e6b69]">
                    AV
                  </span>
                  <div className="flex-1">
                    <strong className="block text-[11px]">{flight.code}</strong>
                    <span className="text-[10px] text-[#89999e]">
                      {flight.from} → {flight.to}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-[#55a17a]">
                    On time
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-7">
          <h3 className="mb-4 text-[18px] font-semibold">
            Latest reservations
          </h3>
          <ReservationTable rows={reservations.slice(0, 3)} />
        </div>
      </div>
    </AirlineSystem>
  );
}
