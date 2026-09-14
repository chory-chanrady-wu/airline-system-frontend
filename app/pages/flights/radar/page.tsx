"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AirlineSystem } from "../../../components/airline-system";
import { Icon } from "../../../components/icons";
import { PageTitle } from "../../../components/page-title";
import type { RadarAircraft } from "../../../api/flights/radar/route";

const FlightRadarMap = dynamic(
  () =>
    import("../../../components/flight-radar-map").then(
      (module) => module.FlightRadarMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full place-items-center text-[11px] text-[#a2d0cf]">
        Loading map…
      </div>
    ),
  },
);

type RadarResponse = {
  aircraft?: RadarAircraft[];
  fetchedAt?: string;
  error?: string;
};

function altitude(value: number | null) {
  return value === null ? "—" : `${Math.round(value).toLocaleString()} m`;
}
function speed(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 3.6)} km/h`;
}
function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[\s-]/g, "");
}

export default function FlightRadarPage() {
  const [aircraft, setAircraft] = useState<RadarAircraft[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;
    const refresh = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/flights/radar", {
          cache: "default",
          signal: controller.signal,
        });
        const payload = (await response.json()) as RadarResponse;
        if (!response.ok)
          throw new Error(payload.error ?? "Radar request failed.");
        if (active) {
          setAircraft(payload.aircraft ?? []);
          setFetchedAt(payload.fetchedAt ?? new Date().toISOString());
          setError("");
        }
      } catch (requestError) {
        if (active)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load live radar.",
          );
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 60000);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, []);

  const selected =
    aircraft.find((item) => item.icao24 === selectedId) ?? aircraft[0];
  const visibleAircraft = aircraft.filter((item) =>
    normalizeSearch(
      `${item.callsign} ${item.originCountry} ${item.icao24}`,
    ).includes(normalizeSearch(query)),
  );

  return (
    <AirlineSystem initialModule="Flight Management">
      <div className="module-page">
        <PageTitle
          eyebrow="Flight Management / Flight Radar"
          title="Flight Radar"
        />
        <div className="relative">
          <section className="radar-map-panel rounded-xl border border-[#dce5e8] bg-white p-5 shadow-sm xl:min-h-[650px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#5b9994]">
                  Live air traffic
                </p>
                <h3 className="mt-1 text-lg font-semibold">
                  Live aircraft positions
                </h3>
                <p className="mt-1 text-[11px] text-[#839198]">
                  Cambodia coverage · OpenSky Network · refreshed every 60
                  seconds.
                </p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-[#e7f5ed] px-2 py-1 text-[9px] font-bold text-[#4d9b73]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4d9b73]" />{" "}
                {visibleAircraft.length} shown / {aircraft.length} tracked
              </span>
            </div>
            <div className="radar-map-toolbar absolute left-8 top-24 z-[1000] flex items-center gap-2 rounded-lg border border-[#dce5e8] bg-white px-3 py-2 shadow-lg">
              <Icon name="search" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search by flight number, callsign, ICAO24, or country"
                placeholder="Search flight number or callsign"
                className="w-52 bg-transparent text-[11px] outline-none"
              />
            </div>
            <div className="relative mt-6 h-120 overflow-hidden rounded-xl border border-[#2c6570] bg-[#102f3c]">
              <FlightRadarMap
                aircraft={visibleAircraft}
                selectedId={selected?.icao24 ?? null}
                onSelect={setSelectedId}
              />
              {error && (
                <p className="absolute inset-x-5 bottom-5 z-1000 rounded-lg bg-[#fbeae7] px-3 py-2 text-center text-[10px] text-[#c56d61]">
                  {error}
                </p>
              )}
            </div>
            {fetchedAt && (
              <p className="mt-3 text-[10px] text-[#839198]">
                Last update: {new Date(fetchedAt).toLocaleTimeString()}
              </p>
            )}
          </section>
          <section className="radar-details-panel rounded-xl border border-[#dce5e8] bg-white p-5 shadow-sm xl:absolute xl:right-5 xl:top-5 xl:z-[1000] xl:w-80 xl:bg-white/95 xl:backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#5b9994]">
              Selected aircraft
            </p>
            {selected ? (
              <>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e1f2ed] text-[#0e6b69]">
                    <Icon name="plane" size={19} />
                  </span>
                  <div>
                    <strong className="block text-lg">
                      {selected.callsign}
                    </strong>
                    <span className="text-[10px] text-[#839198]">
                      {selected.originCountry} · {selected.icao24}
                    </span>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 text-[11px]">
                  <div className="flex justify-between border-b border-[#eef2f3] pb-3">
                    <span className="text-[#839198]">Coordinates</span>
                    <strong>
                      {selected.latitude.toFixed(2)},{" "}
                      {selected.longitude.toFixed(2)}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#eef2f3] pb-3">
                    <span className="text-[#839198]">Altitude</span>
                    <strong>{altitude(selected.altitude)}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#eef2f3] pb-3">
                    <span className="text-[#839198]">Speed</span>
                    <strong>{speed(selected.velocity)}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#eef2f3] pb-3">
                    <span className="text-[#839198]">Heading</span>
                    <strong>
                      {selected.heading === null
                        ? "—"
                        : `${Math.round(selected.heading)}°`}
                    </strong>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-5 text-[11px] text-[#839198]">
                Live aircraft details will appear here.
              </p>
            )}
          </section>
        </div>
        <section className="mt-5 rounded-xl border border-[#dce5e8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#5b9994]">
                Live tracking feed
              </p>
              <h3 className="mt-1 text-lg font-semibold">Aircraft list</h3>
            </div>
            <span className="text-[10px] text-[#839198]">
              OpenSky live data
            </span>
          </div>
          <div className="mt-4 grid gap-2">
            {visibleAircraft.slice(0, 30).map((item) => (
              <button
                type="button"
                key={item.icao24}
                onClick={() => setSelectedId(item.icao24)}
                className={`flex flex-wrap items-center gap-4 rounded-lg border p-3 text-left text-[11px] transition hover:border-[#42b5a4] ${selected?.icao24 === item.icao24 ? "border-[#42b5a4] bg-[#eef8f5]" : "border-[#eef2f3]"}`}
              >
                <strong className="w-24 text-[#0e6b69]">{item.callsign}</strong>
                <span className="flex-1">{item.originCountry}</span>
                <span>
                  {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                </span>
                <span>{altitude(item.altitude)}</span>
                <span>{speed(item.velocity)}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AirlineSystem>
  );
}
