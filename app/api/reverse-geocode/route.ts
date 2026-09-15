import { NextRequest, NextResponse } from "next/server";

type ReverseResult = {
  display_name?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
  };
};

async function findTimezone(latitude: string, longitude: string) {
  try {
    const response = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    if (!response.ok) return "";
    const result = (await response.json()) as {
      timeZone?: string;
      timezone?: string;
    };
    return result.timeZone ?? result.timezone ?? "";
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest) {
  const latitude = request.nextUrl.searchParams.get("lat")?.trim();
  const longitude = request.nextUrl.searchParams.get("lon")?.trim();

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and longitude are required." },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      lat: latitude,
      lon: longitude,
      format: "jsonv2",
      zoom: "18",
      addressdetails: "1",
      "accept-language": "en",
    });
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
          "User-Agent": "Safty-Airline/1.0 airport-location-picker",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Location provider is unavailable." },
        { status: 502 },
      );
    }

    const result = (await response.json()) as ReverseResult;
    const timezone = await findTimezone(latitude, longitude);
    return NextResponse.json({ ...result, timezone });
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the location provider." },
      { status: 502 },
    );
  }
}
