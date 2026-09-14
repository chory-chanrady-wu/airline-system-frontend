"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";
import { ReservationTable } from "../../components/reservation-table";
import type { Module } from "../../components/airline-data";
import {
  benchmarkStructures,
  displayPrice,
  systemStats,
} from "../../services/airline-system";
import { fetchDashboardStatsFromApi } from "../../services/api";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(() => systemStats());
  const [apiNotice, setApiNotice] = useState("");
  const benchmarks = benchmarkStructures();
  const maxBookingActivity = Math.max(
    1,
    ...stats.bookingActivity.map((item) => item.count),
  );
  useEffect(() => {
    const handle = window.setTimeout(async () => {
      try {
        const backendStats = await fetchDashboardStatsFromApi();
        if (backendStats && typeof backendStats === "object") {
          const value = backendStats as { data?: unknown };
          const payload = value.data ?? backendStats;
          if (payload && typeof payload === "object") {
            const typedPayload = payload as Record<string, unknown>;
            if (typedPayload.totalFlights !== undefined) {
              setStats(
                (current) =>
                  ({ ...current, ...typedPayload }) as typeof current,
              );
            }
          }
        }
      } catch {
        setApiNotice("Backend unavailable — showing local dashboard data.");
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);
  const navigate = (module: Module) =>
    router.push(
      `/pages/${module === "Dashboard" ? "dashboard" : module.toLowerCase().replace(" ", "-")}`,
    );
  return (
    <AirlineSystem initialModule="Dashboard">
      <div className="module-page">
        <PageTitle
          eyebrow="Operations dashboard"
          title="Operations dashboard"
          action="Create booking"
          onAction={() => navigate("Book flight")}
        />
        {apiNotice && (
          <div className="mb-4 rounded-lg border border-[#dfeae8] bg-[#edf7f5] px-4 py-3 text-[11px] text-[#0e6b69]">
            {apiNotice}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total bookings", String(stats.bookings), "persisted", "ticket"],
            [
              "Active flights",
              String(stats.totalFlights),
              "inventory",
              "plane",
            ],
            ["Airports", String(stats.totalAirports), "vertices", "globe"],
            [
              "Routes tracked",
              String(stats.totalRoutes),
              "graph edges",
              "sparkle",
            ],
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
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Seat capacity",
              stats.totalCapacity.toLocaleString(),
              "total seats",
            ],
            [
              "Seats occupied",
              stats.occupiedSeats.toLocaleString(),
              `${stats.overallLoadFactor}% load factor`,
            ],
            [
              "Available seats",
              stats.availableSeats.toLocaleString(),
              "current inventory",
            ],
            [
              "Confirmed revenue",
              displayPrice(stats.confirmedRevenue),
              `${stats.confirmedBookings} confirmed bookings`,
            ],
          ].map(([label, value, detail]) => (
            <div
              className="rounded-xl border border-[#dce5e8] bg-white p-5"
              key={label}
            >
              <p className="text-[11px] text-[#839198]">{label}</p>
              <strong className="mt-2 block text-2xl">{value}</strong>
              <span className="mt-1 block text-[10px] text-[#0e6b69]">
                {detail}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-7 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#839198]">
              Route load factor
            </p>
            <div className="mt-4 grid gap-3">
              {stats.loadByRoute.map((route) => (
                <div
                  key={route.route}
                  className="flex items-center gap-3 text-[11px]"
                >
                  <span className="w-24">{route.route}</span>
                  <div className="h-2 flex-1 rounded-full bg-[#e8f1ef]">
                    <div
                      className="h-2 rounded-full bg-[#0e6b69]"
                      style={{ width: `${route.loadFactor}%` }}
                    />
                  </div>
                  <strong>{route.loadFactor}%</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#839198]">
              Complexity benchmark
            </p>
            <div className="mt-4 grid gap-2 text-[11px]">
              {benchmarks.map((item) => (
                <div className="flex justify-between" key={item.size}>
                  <span>{item.size.toLocaleString()} operations</span>
                  <span className="text-[#0e6b69]">
                    Hash {item.hashTime}ms / {item.hashBigO}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
              {stats.bookingActivity.map((activity) => (
                <div
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  key={activity.label}
                >
                  <div
                    className="w-full max-w-[36px] rounded-t-md bg-[#0e6b69]"
                    style={{
                      height: `${Math.max(8, (activity.count / maxBookingActivity) * 100)}%`,
                    }}
                  ></div>
                  <span className="text-[9px] text-[#91a0a3]">
                    {activity.label}
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
              {stats.scheduledFlights.map((flight) => (
                <div
                  className="flex items-center gap-3 border-b border-[#eef2f3] pb-3"
                  key={flight.id}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eef5f3] text-[9px] font-bold text-[#0e6b69]">
                    AV
                  </span>
                  <div className="flex-1">
                    <strong className="block text-[11px]">{flight.id}</strong>
                    <span className="text-[10px] text-[#89999e]">
                      {flight.route} · {flight.departure}
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
          <ReservationTable
            rows={stats.recentBookings.map((booking) => ({
              ...booking,
              amount: displayPrice(booking.amount),
            }))}
          />
        </div>
      </div>
    </AirlineSystem>
  );
}
