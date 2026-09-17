"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { fetchAirportsFromApi } from "../services/airports";

const fieldClass =
  "flex h-[43px] items-center gap-2 rounded-lg border border-[#dfe7e9] px-2.5 text-[#0e6b69]";
const inputClass =
  "min-w-0 w-full border-0 bg-transparent text-[11px] text-[#172b3a] outline-0";

export type FlightSearchValues = {
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
};

export function FlightSearch({
  overlap = true,
  onSearch,
}: {
  overlap?: boolean;
  onSearch?: (values: FlightSearchValues) => void;
}) {
  const [tripType, setTripType] = useState("Round trip");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [passengers, setPassengers] = useState("1 passenger");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [message, setMessage] = useState("");
  const [airports, setAirports] = useState<{ code: string; city: string }[]>(
    [],
  );

  useEffect(() => {
    void (async () => {
      try {
        const backendAirports = await fetchAirportsFromApi();
        setAirports(
          backendAirports.map((airport) => ({
            code: String(airport.code ?? ""),
            city: String(airport.city ?? ""),
          })),
        );
      } catch {
        setAirports([]);
      }
    })();
  }, []);

  function swapAirports() {
    setFrom(to);
    setTo(from);
  }
  function searchFlights(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (from === to) {
      setMessage("Choose a different origin and destination.");
      return;
    }
    if (
      new Date(departureDate) < new Date(new Date().toISOString().slice(0, 10))
    ) {
      setMessage("Departure date cannot be in the past.");
      return;
    }
    const passengerCount = Number.parseInt(passengers, 10);
    onSearch?.({
      from,
      to,
      departureDate,
      returnDate,
      passengers: passengerCount,
    });
    setMessage(
      `Searching ${tripType.toLowerCase()} flights from ${from} to ${to}.`,
    );
  }

  return (
    <section
      className={`relative z-[4] rounded-2xl border border-[#eef2f0] bg-white px-[18px] py-[23px] shadow-[0_16px_40px_rgba(29,59,65,.1)] sm:px-[30px] sm:py-[27px] ${overlap ? "-mt-[45px]" : "mt-0"}`}
      aria-labelledby="search-heading"
    >
      <div className="flex flex-col justify-between sm:flex-row sm:items-start">
        <div>
          <p className="mb-[11px] text-[10px] font-extrabold uppercase tracking-[1.8px] text-[#769099]">
            Find your next adventure
          </p>
          <h2
            id="search-heading"
            className="mb-[22px] text-[25px] font-semibold tracking-[-.7px]"
          >
            Where will you go next?
          </h2>
        </div>
        <div className="mb-5 flex items-center gap-[7px] text-[11px] text-[#69817e] sm:mb-0">
          <Icon name="shield" size={17} /> Best price guarantee
        </div>
      </div>
      <form onSubmit={searchFlights}>
        <div
          className="flex gap-[25px] border-b border-[#dfe7e9]"
          role="tablist"
          aria-label="Trip type"
        >
          {["Round trip", "One way", "Multi-city"].map((type) => (
            <button
              type="button"
              role="tab"
              aria-selected={tripType === type}
              className={`relative -mb-px border-0 bg-transparent pb-3 text-[11px] font-bold ${tripType === type ? "text-[#0e6b69] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0e6b69]" : "text-[#839198]"}`}
              key={type}
              onClick={() => setTripType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="grid gap-3 pt-5 sm:flex sm:items-end sm:gap-2.5">
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-[10px] font-bold text-[#839198]">
              From
            </span>
            <span className={fieldClass}>
              <Icon name="plane" size={18} />
              <select
                className={inputClass}
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              >
                <option value="">Select origin</option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.city}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <button
            type="button"
            className="absolute left-1/2 mt-[29px] h-7 w-7 -translate-x-1/2 rounded-full border border-[#bfddda] bg-white p-[5px] text-[#0e6b69] sm:static sm:mb-2 sm:mt-0 sm:translate-x-0"
            aria-label="Swap departure and arrival airports"
            onClick={swapAirports}
          >
            <Icon name="swap" size={18} />
          </button>
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-[10px] font-bold text-[#839198]">
              To
            </span>
            <span className={fieldClass}>
              <Icon name="plane" size={18} />
              <select
                className={inputClass}
                value={to}
                onChange={(event) => setTo(event.target.value)}
              >
                <option value="">Select destination</option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.code} - {airport.city}
                  </option>
                ))}
              </select>
            </span>
          </label>
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-[10px] font-bold text-[#839198]">
              Departure
            </span>
            <span className={fieldClass}>
              <Icon name="calendar" size={18} />
              <input
                className={inputClass}
                type="date"
                value={departureDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setDepartureDate(event.target.value)}
              />
            </span>
          </label>
          {tripType !== "One way" && (
            <label className="min-w-0 flex-1">
              <span className="mb-2 block text-[10px] font-bold text-[#839198]">
                Return
              </span>
              <span className={fieldClass}>
                <Icon name="calendar" size={18} />
                <input
                  className={inputClass}
                  type="date"
                  value={returnDate}
                  min={departureDate}
                  onChange={(event) => setReturnDate(event.target.value)}
                />
              </span>
            </label>
          )}
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-[10px] font-bold text-[#839198]">
              Travelers
            </span>
            <span className={fieldClass}>
              <Icon name="user" size={18} />
              <select
                className={inputClass}
                value={passengers}
                onChange={(event) => setPassengers(event.target.value)}
              >
                <option>1 passenger</option>
                <option>2 passengers</option>
                <option>3 passengers</option>
                <option>4 passengers</option>
              </select>
            </span>
          </label>
          <button
            className="flex h-[43px] items-center justify-center gap-2 rounded-lg border-0 bg-[#ed744d] px-[17px] text-[11px] font-bold whitespace-nowrap text-white hover:bg-[#d85e3d] sm:flex-1"
            type="submit"
          >
            <Icon name="search" size={19} /> Search flights
          </button>
        </div>
        {message && (
          <p
            className="mt-[13px] flex items-center gap-1.5 text-[11px] text-[#0e6b69]"
            role="status"
          >
            <Icon name="check" size={16} /> {message}
          </p>
        )}
      </form>
    </section>
  );
}
