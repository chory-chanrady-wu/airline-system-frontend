"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type AirportLocationPickerProps = {
  latitude?: number;
  longitude?: number;
  onChange: (latitude: number, longitude: number) => void;
  onAddressChange?: (city: string, country: string, timezone: string) => void;
};

const DEFAULT_CENTER: [number, number] = [11.5564, 104.9282];

function ClickHandler({
  onChange,
  onAddressChange,
}: {
  onChange: AirportLocationPickerProps["onChange"];
  onAddressChange?: AirportLocationPickerProps["onAddressChange"];
}) {
  useMapEvents({
    click(event) {
      const latitude = Number(event.latlng.lat.toFixed(6));
      const longitude = Number(event.latlng.lng.toFixed(6));
      onChange(latitude, longitude);
      if (onAddressChange) {
        void detectAddress(latitude, longitude, onAddressChange);
      }
    },
  });
  return null;
}

async function detectAddress(
  latitude: number,
  longitude: number,
  onAddressChange: (city: string, country: string, timezone: string) => void,
) {
  try {
    const response = await fetch(
      `/api/reverse-geocode?lat=${latitude}&lon=${longitude}`,
      { cache: "no-store" },
    );
    if (!response.ok) return;
    const result = (await response.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        country?: string;
      };
      timezone?: string;
    };
    const address = result.address;
    if (!address) return;
    onAddressChange(
      address.city ??
        address.town ??
        address.village ??
        address.municipality ??
        "",
      address.country ?? "",
      result.timezone ?? "",
    );
  } catch {
    // Coordinate selection still works if reverse geocoding is unavailable.
  }
}

function SelectedLocation({
  latitude,
  longitude,
}: {
  latitude?: number;
  longitude?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 5), {
      duration: 0.5,
    });
  }, [latitude, longitude, map]);
  return null;
}

function SearchViewport({
  location,
}: {
  location: { latitude: number; longitude: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    map.flyTo([location.latitude, location.longitude], 12, { duration: 0.8 });
  }, [location, map]);
  return null;
}

export function AirportLocationPicker({
  latitude,
  longitude,
  onChange,
  onAddressChange,
}: AirportLocationPickerProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState<{
    displayName: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const hasLocation = latitude !== undefined && longitude !== undefined;
  const center: [number, number] = hasLocation
    ? [latitude, longitude]
    : DEFAULT_CENTER;
  const markerIcon = L.divIcon({
    className: "airport-location-marker",
    html: "<span></span>",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

  async function searchPlace() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(trimmedQuery)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as {
        error?: string;
        results?: Array<{
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
        }>;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Location search failed.");
      }
      const results = Array.isArray(payload)
        ? payload
        : (payload.results ?? []);
      const result = results[0];
      if (!result?.lat || !result.lon) {
        setSearchError("No location found. Try a city or airport name.");
        return;
      }
      setSearchResult({
        displayName: result.display_name ?? trimmedQuery,
        latitude: Number(Number(result.lat).toFixed(6)),
        longitude: Number(Number(result.lon).toFixed(6)),
      });
      if (onAddressChange) {
        void detectAddress(
          Number(Number(result.lat).toFixed(6)),
          Number(Number(result.lon).toFixed(6)),
          onAddressChange,
        );
      }
    } catch (error) {
      setSearchError(
        error instanceof Error ? error.message : "Unable to search location.",
      );
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#dce5e8]">
      <style>{`.airport-location-marker span { display: block; width: 18px; height: 18px; border: 3px solid #ffffff; border-radius: 999px; background: #0e6b69; box-shadow: 0 2px 8px rgba(14,107,105,.45); }`}</style>
      <div className="flex items-center justify-between bg-[#f7fafb] px-3 py-2 text-[10px]">
        <span className="font-bold uppercase tracking-[1px] text-[#839198]">
          Choose location on map
        </span>
        <span className="text-[#526a73]">
          {hasLocation ? `${latitude}, ${longitude}` : "Click to place airport"}
        </span>
      </div>
      <div
        role="search"
        className="flex flex-wrap gap-2 border-b border-[#dce5e8] bg-white p-3"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void searchPlace();
            }
          }}
          placeholder="Search city or airport"
          className="min-w-0 flex-1 rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] outline-none focus:border-[#0e6b69]"
        />
        <button
          type="button"
          onClick={() => void searchPlace()}
          disabled={searching}
          className="rounded-lg bg-[#0e6b69] px-3 py-2 text-[11px] font-bold text-white disabled:opacity-60"
        >
          {searching ? "Searching..." : "Search"}
        </button>
        {searchError && (
          <p className="basis-full text-[10px] text-[#c56d61]">{searchError}</p>
        )}
        {searchResult && (
          <div className="basis-full flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#eef8f5] px-3 py-2 text-[10px] text-[#0e6b69]">
            <span className="min-w-0 truncate">{searchResult.displayName}</span>
            <button
              type="button"
              onClick={() =>
                onChange(searchResult.latitude, searchResult.longitude)
              }
              className="shrink-0 font-bold underline"
            >
              Use this location
            </button>
          </div>
        )}
      </div>
      <div className="h-[260px] w-full">
        <MapContainer
          center={center}
          zoom={hasLocation ? 8 : 6}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer />
          <ClickHandler onChange={onChange} onAddressChange={onAddressChange} />
          <SelectedLocation latitude={latitude} longitude={longitude} />
          <SearchViewport
            location={
              searchResult
                ? {
                    latitude: searchResult.latitude,
                    longitude: searchResult.longitude,
                  }
                : null
            }
          />
          {hasLocation && (
            <Marker position={[latitude, longitude]} icon={markerIcon}>
              <Popup>
                Airport location
                <br />
                {latitude}, {longitude}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

function TileLayer() {
  const map = useMap();
  useEffect(() => {
    const layer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    );
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);
  return null;
}
