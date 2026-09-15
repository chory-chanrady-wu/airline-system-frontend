import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    country?: string;
  };
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required." },
      { status: 400 },
    );
  }

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      addressdetails: "1",
      "accept-language": "en",
    });
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
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

    const results = (await response.json()) as NominatimResult[];
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the location provider." },
      { status: 502 },
    );
  }
}
