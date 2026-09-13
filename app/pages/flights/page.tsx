import { AirlineSystem } from "../../components/airline-system";
import { flights } from "../../components/airline-data";
import { PageTitle } from "../../components/page-title";

export default function FlightsPage() {
  const operations = [
    ...flights,
    {
      ...flights[0],
      code: "AV 331",
      from: "LAX",
      to: "NRT",
      departure: "10:20",
      arrival: "14:40",
    },
  ];
  return (
    <AirlineSystem initialModule="Flights">
      <div className="mx-auto max-w-[1600px]">
        <PageTitle
          eyebrow="Fleet operations"
          title="Flights"
          action="Schedule flight"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[11px] text-[#839198]">Scheduled today</p>
            <strong className="mt-2 block text-2xl">48</strong>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[11px] text-[#839198]">On time rate</p>
            <strong className="mt-2 block text-2xl text-[#4d9b73]">
              94.8%
            </strong>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[11px] text-[#839198]">Aircraft in service</p>
            <strong className="mt-2 block text-2xl">32 / 36</strong>
          </div>
        </div>
        <div className="mt-7 rounded-xl border border-[#dce5e8] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold">Today&apos;s flight operations</h3>
            <button className="text-[10px] font-bold text-[#0e6b69]">
              Export report ↓
            </button>
          </div>
          <div className="grid gap-3">
            {operations.map((flight) => (
              <div
                className="flex flex-wrap items-center gap-4 rounded-lg border border-[#eef2f3] p-4"
                key={flight.code}
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef5f3] text-[9px] font-bold text-[#0e6b69]">
                  {flight.logo}
                </span>
                <div className="w-20">
                  <strong className="block text-[11px]">{flight.code}</strong>
                  <span className="text-[10px] text-[#839198]">AeroVista</span>
                </div>
                <div className="flex items-center gap-3 text-[12px] font-semibold">
                  <span>{flight.from}</span>
                  <span className="text-[#9cb7b3]">→</span>
                  <span>{flight.to}</span>
                </div>
                <span className="ml-auto rounded-full bg-[#e7f5ed] px-2 py-1 text-[9px] font-bold text-[#4d9b73]">
                  On time
                </span>
                <span className="text-[11px] font-semibold">
                  {flight.departure}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AirlineSystem>
  );
}
