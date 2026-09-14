import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OPEN_SKY_URL =
  "https://opensky-network.org/api/states/all?lamin=10.3&lamax=14.7&lomin=102.3&lomax=107.7";
const REQUEST_TIMEOUT_MS = 8_000;
const CACHE_TTL_MS = 20_000;

let cachedResponse: { aircraft: RadarAircraft[]; fetchedAt: string } | null =
  null;
let cachedAt = 0;

export type RadarAircraft = {
  icao24: string;
  callsign: string;
  originCountry: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  onGround: boolean;
  lastContact: number;
};

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function GET() {
  const now = Date.now();
  if (cachedResponse && now - cachedAt < CACHE_TTL_MS) {
    return NextResponse.json(cachedResponse, {
      headers: { "Cache-Control": "public, max-age=20" },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(OPEN_SKY_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 20 },
      signal: controller.signal,
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `OpenSky returned HTTP ${response.status}.` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      states?: unknown[][] | null;
    };
    const aircraft = (payload.states ?? [])
      .filter((state) => isNumber(state[5]) && isNumber(state[6]))
      .map((state) => ({
        icao24: String(state[0] ?? "unknown"),
        callsign: String(state[1] ?? "UNKNOWN").trim() || "UNKNOWN",
        originCountry: String(state[2] ?? "Unknown"),
        longitude: state[5] as number,
        latitude: state[6] as number,
        altitude: isNumber(state[7]) ? state[7] : null,
        velocity: isNumber(state[9]) ? state[9] : null,
        heading: isNumber(state[10]) ? state[10] : null,
        onGround: Boolean(state[8]),
        lastContact: isNumber(state[4]) ? state[4] : Date.now() / 1000,
      })) satisfies RadarAircraft[];

    cachedResponse = { aircraft, fetchedAt: new Date().toISOString() };
    cachedAt = Date.now();
    return NextResponse.json(cachedResponse, {
      headers: { "Cache-Control": "public, max-age=20" },
    });
  } catch (error) {
    if (cachedResponse) {
      return NextResponse.json(
        { ...cachedResponse, stale: true },
        { headers: { "Cache-Control": "public, max-age=10" } },
      );
    }
    return NextResponse.json(
      { error: "Unable to reach the OpenSky Network." },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
