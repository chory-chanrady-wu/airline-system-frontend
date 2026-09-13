import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";

export default function PassengersPage() {
  return (
    <AirlineSystem initialModule="Passengers">
      <div className="mx-auto max-w-[1600px]">
        <PageTitle
          eyebrow="Customer records"
          title="Passengers"
          action="Add passenger"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[11px] text-[#839198]">Registered passengers</p>
            <strong className="mt-2 block text-2xl">3,642</strong>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[11px] text-[#839198]">Frequent travelers</p>
            <strong className="mt-2 block text-2xl">842</strong>
          </div>
          <div className="rounded-xl border border-[#dce5e8] bg-white p-5">
            <p className="text-[11px] text-[#839198]">New this month</p>
            <strong className="mt-2 block text-2xl">126</strong>
          </div>
        </div>
        <div className="mt-7 rounded-xl border border-[#dce5e8] bg-white p-6">
          <div className="flex items-center gap-4 border-b border-[#eef2f3] pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#dceee8] text-[#0e6b69]">
              <Icon name="user" size={19} />
            </span>
            <div>
              <h3 className="font-semibold">Passenger directory</h3>
              <p className="mt-1 text-[11px] text-[#839198]">
                Search and manage customer travel profiles.
              </p>
            </div>
          </div>
          <div className="mt-5 flex h-32 items-center justify-center rounded-lg border border-dashed border-[#cbdcdf] text-[11px] text-[#839198]">
            Passenger directory connected to your database
          </div>
        </div>
      </div>
    </AirlineSystem>
  );
}
