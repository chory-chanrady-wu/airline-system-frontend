import { apiProxy, unpackArrayResult } from "./base";

export async function fetchDashboardStatsFromApi() {
  return apiProxy<unknown>("/analytics/dashboard", { method: "GET" });
}

export async function fetchBookingAnalyticsFromApi() {
  return apiProxy<unknown>("/analytics/bookings", { method: "GET" });
}

export async function fetchLoadFactorAnalyticsFromApi() {
  return apiProxy<unknown>("/analytics/load-factors", { method: "GET" });
}

export async function fetchRevenueAnalyticsFromApi() {
  return apiProxy<unknown>("/analytics/revenue", { method: "GET" });
}

export async function fetchFlightStatusAnalyticsFromApi() {
  return apiProxy<unknown>("/analytics/flight-status", { method: "GET" });
}

export async function fetchBenchmarksFromApi() {
  const result = await apiProxy<unknown>("/analytics/benchmarks", {
    method: "GET",
  });
  return unpackArrayResult<unknown>(result);
}

export async function runBenchmarksWithApi() {
  return apiProxy<unknown>("/analytics/benchmarks/run", { method: "POST" });
}

export async function fetchHealthFromApi() {
  return apiProxy<unknown>("/health", { method: "GET" });
}

export async function fetchDatabaseHealthFromApi() {
  return apiProxy<unknown>("/health/database", { method: "GET" });
}

export async function fetchProvidersHealthFromApi() {
  return apiProxy<unknown>("/health/providers", { method: "GET" });
}
