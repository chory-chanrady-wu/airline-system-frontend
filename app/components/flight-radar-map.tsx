"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import type { RadarAircraft } from "../api/flights/radar/route";
import "leaflet/dist/leaflet.css";

type FlightRadarMapProps = {
  aircraft: RadarAircraft[];
  selectedId: string | null;
  onSelect: (icao24: string) => void;
};

function createPlaneMarkerHtml(heading: number | null, isSelected: boolean) {
  const rotation = heading ?? 0;
  return `
    <div class="flight-plane-marker ${isSelected ? "is-selected" : ""}">
      <div class="flight-plane-marker-inner" style="transform: rotate(${rotation}deg)">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="plane-body-${rotation}-${isSelected ? "selected" : "idle"}" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="${isSelected ? "#f5f6f7" : "#e6f7f3"}" />
              <stop offset="100%" stop-color="${isSelected ? "#dfeae9" : "#9be3d4"}" />
            </linearGradient>
          </defs>
          <g transform="translate(32 32)">
            <path d="M-20 2 L-2 -8 L15 -8 L28 -2 L30 2 L18 8 L8 24 L2 24 L4 8 L-20 8 Z" fill="url(#plane-body-${rotation}-${isSelected ? "selected" : "idle"})" stroke="${isSelected ? "#165a61" : "#0d4d59"}" stroke-width="2" stroke-linejoin="round"/>
            <path d="M-18 0 L-30 10 L-22 12 L-8 6 Z" fill="${isSelected ? "#ed744d" : "#53b8a6"}" opacity="0.9"/>
            <path d="M-2 9 L-8 20 L-2 22 L7 12 Z" fill="${isSelected ? "#f4b99a" : "#c6ebde"}" opacity="0.8"/>
            <circle cx="-2" cy="2" r="2" fill="${isSelected ? "#ed744d" : "#0d4d59"}"/>
          </g>
        </svg>
      </div>
    </div>
  `;
}

function MapViewport({ selected }: { selected?: RadarAircraft }) {
  const map = useMap();
  useEffect(() => {
    if (selected)
      map.flyTo(
        [selected.latitude, selected.longitude],
        Math.max(map.getZoom(), 4),
        { duration: 0.8 },
      );
  }, [map, selected]);
  return null;
}

function OpenStreetMapLayer() {
  const map = useMap();
  useEffect(() => {
    const pane = map.getPane("tilePane");
    if (!pane) return;
    const layer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    );
    layer.addTo(map);
    return () => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    };
  }, [map]);
  return null;
}

export function FlightRadarMap({
  aircraft,
  selectedId,
  onSelect,
}: FlightRadarMapProps) {
  const selected = aircraft.find((item) => item.icao24 === selectedId);

  return (
    <>
      <style>{`
        .flight-plane-marker {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          transform-origin: center;
          filter: drop-shadow(0 6px 10px rgba(15, 88, 92, 0.25));
          animation: aircraft-pulse 2.2s ease-in-out infinite;
        }

        .flight-plane-marker.is-selected {
          animation: aircraft-bounce 1.5s ease-in-out infinite;
        }

        .flight-plane-marker-inner {
          display: block;
          width: 28px;
          height: 28px;
          transform-origin: center;
          transition: transform 0.25s ease;
        }

        .flight-plane-marker svg {
          width: 28px;
          height: 28px;
          display: block;
        }

        @keyframes aircraft-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 0 rgba(92, 210, 190, 0.15));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(92, 210, 190, 0.4));
          }
        }

        @keyframes aircraft-bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.12);
          }
        }
      `}</style>

      <MapContainer
        center={[11.5466, 104.8441]}
        zoom={7}
        minZoom={6}
        className="h-full w-full"
        scrollWheelZoom
      >
        <OpenStreetMapLayer />
        <MapViewport selected={selected} />
        {aircraft.map((item) => {
          const isSelected = selectedId === item.icao24;
          const icon = L.divIcon({
            className: "flight-aircraft-marker",
            html: createPlaneMarkerHtml(item.heading, isSelected),
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -12],
          });

          return (
            <Marker
              key={item.icao24}
              position={[item.latitude, item.longitude]}
              icon={icon}
              eventHandlers={{ click: () => onSelect(item.icao24) }}
            >
              <Popup>
                <strong>{item.callsign}</strong>
                <br />
                {item.originCountry}
                <br />
                {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
  );
}
