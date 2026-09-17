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
} from "../../services/airline-system";
import {
  fetchAirportsFromApi,
  fetchBookingAnalyticsFromApi,
  fetchBookingsFromApi,
  fetchFlightsFromApi,
  fetchPassengersFromApi,
  fetchRevenueAnalyticsFromApi,
  fetchRoutesFromApi,
  normalizeApiFlight,
} from "../../services/api";

const emptyStats = {
  totalAirports: 0,
  totalRoutes: 0,
  totalFlights: 0,
  bookings: 0,
  confirmedBookings: 0,
  totalCapacity: 0,
  availableSeats: 0,
  occupiedSeats: 0,
  overallLoadFactor: 0,
  confirmedRevenue: 0,
  loadByRoute: [] as {
    route: string;
    loadFactor: number;
  }[],
  bookingActivity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
    (label) => ({ label, count: 0 }),
  ),
  scheduledFlights: [] as {
    id: string;
    airline: string;
    route: string;
    departure: string;
    seatsAvailable: number;
    capacity: number;
  }[],
  recentBookings: [] as {
    id: string;
    passenger: string;
    route: string;
    date: string;
    status: string;
    amount: number;
    flightNumber?: string;
    seatNumber?: string;
  }[],
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(emptyStats);
  const benchmarks = benchmarkStructures();
  const maxBookingActivity = Math.max(
    1,
    ...stats.bookingActivity.map((item) => item.count),
  );

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      try {
        const [
          airports,
          routes,
          apiFlights,
          bookingAnalytics,
          revenueAnalytics,
          bookings,
          passengers,
        ] = await Promise.all([
          fetchAirportsFromApi().catch(() => []),
          fetchRoutesFromApi().catch(() => []),
          fetchFlightsFromApi().catch(() => []),
          fetchBookingAnalyticsFromApi().catch(() => null),
          fetchRevenueAnalyticsFromApi().catch(() => null),
          fetchBookingsFromApi().catch(() => []),
          fetchPassengersFromApi().catch(() => []),
        ]);

        const flights = apiFlights.map(normalizeApiFlight);
        const totalCapacity = flights.reduce((sum, f) => sum + f.capacity, 0);
        const availableSeats = flights.reduce(
          (sum, f) => sum + f.seatsAvailable,
          0,
        );
        const occupiedSeats = totalCapacity - availableSeats;

        const routeMap = new Map<
          string,
          { capacity: number; available: number }
        >();
        for (const flight of flights) {
          const key = `${flight.from} → ${flight.to}`;
          const entry = routeMap.get(key) ?? { capacity: 0, available: 0 };
          entry.capacity += flight.capacity;
          entry.available += flight.seatsAvailable;
          routeMap.set(key, entry);
        }
        const loadByRoute = Array.from(routeMap.entries()).map(
          ([route, entry]) => ({
            route,
            loadFactor: entry.capacity
              ? Math.round(
                  ((entry.capacity - entry.available) / entry.capacity) * 100,
                )
              : 0,
          }),
        );

        const bookingActivityCounts = [0, 0, 0, 0, 0, 0, 0];
        for (const booking of bookings) {
          const bookedAt = String(
            (booking as Record<string, unknown>).bookedAt ??
              booking.createdAt ??
              "",
          );
          const day = bookedAt ? new Date(bookedAt).getDay() : NaN;
          if (!Number.isNaN(day)) {
            bookingActivityCounts[(day + 6) % 7] += 1;
          }
        }
        const bookingActivity = [
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ].map((label, index) => ({
          label,
          count: bookingActivityCounts[index],
        }));

        const passengerNameById = new Map(
          passengers.map((passenger) => [
            String(passenger.id ?? ""),
            String(
              passenger.fullName ??
                passenger.userName ??
                `Passenger #${passenger.id}`,
            ),
          ]),
        );
        const flightById = new Map(
          flights.map((flight) => [flight.id, flight]),
        );
        const recentBookings = bookings
          .slice(-5)
          .reverse()
          .map((booking) => {
            const flight = flightById.get(String(booking.flightId ?? ""));
            return {
              id: String(booking.id ?? booking.bookingId ?? ""),
              passenger: String(
                booking.passengerName ??
                  passengerNameById.get(String(booking.passengerId ?? "")) ??
                  "Guest",
              ),
              route: flight
                ? `${flight.from} → ${flight.to}`
                : String(booking.flightNumber ?? ""),
              date: String(
                (booking as Record<string, unknown>).bookedAt ??
                  booking.createdAt ??
                  "",
              ).slice(0, 10),
              status: String(booking.status ?? "Confirmed"),
              amount: Number(booking.amount ?? 0),
              flightNumber: booking.flightNumber,
              seatNumber: booking.seatNumber,
            };
          });

        const scheduledFlights = flights.slice(0, 5).map((flight) => ({
          id: flight.flightNumber || flight.id,
          airline: flight.airline,
          route: `${flight.from} → ${flight.to}`,
          departure: flight.departureTime.replace("T", " "),
          seatsAvailable: flight.seatsAvailable,
          capacity: flight.capacity,
        }));

        const analytics = bookingAnalytics as Record<string, unknown> | null;
        const revenue = revenueAnalytics as Record<string, unknown> | null;
        const bookingsCount = Number(
          analytics?.bookings ?? bookings.length ?? 0,
        );
        const confirmedBookings = Number(
          analytics?.confirmed ?? revenue?.confirmedBookings ?? 0,
        );
        const confirmedRevenue = Number(revenue?.totalRevenue ?? 0);

        setStats({
          totalAirports: airports.length,
          totalRoutes: routes.length,
          totalFlights: flights.length,
          bookings: bookingsCount,
          confirmedBookings,
          totalCapacity,
          availableSeats,
          occupiedSeats,
          overallLoadFactor: totalCapacity
            ? Math.round((occupiedSeats / totalCapacity) * 100)
            : 0,
          confirmedRevenue,
          loadByRoute,
          bookingActivity,
          scheduledFlights,
          recentBookings,
        });
      } catch {}
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
