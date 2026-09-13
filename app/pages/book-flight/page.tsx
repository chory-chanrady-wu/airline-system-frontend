import { AirlineSystem } from "../../components/airline-system";
import { FlightCard } from "../../components/flight-card";
import { FlightSearch } from "../../components/flight-search";
import { flights } from "../../components/airline-data";
import { PageTitle } from "../../components/page-title";

export default function BookFlightPage() {
  return (
    <AirlineSystem initialModule="Book flight">
      <div className="mx-auto max-w-[1600px]">
        <PageTitle eyebrow="Reservation workspace" title="Book a new flight" />
        <div className="w-full">
          <FlightSearch overlap={false} />
          <div className="mt-8">
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#839198]">
                Available inventory
              </p>
              <h3 className="mt-1 text-[18px] font-semibold">
                Select a flight
              </h3>
            </div>
            <div className="grid gap-3">
              {flights.map((flight) => (
                <FlightCard key={flight.code} {...flight} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AirlineSystem>
  );
}
