import { AirlineSystem } from "../../components/airline-system";
import { PageTitle } from "../../components/page-title";

export default function ProfilePage() {
  return (
    <AirlineSystem initialModule="User">
      <div className="mx-auto max-w-[1600px]">
        <PageTitle eyebrow="My account" title="Jordan Davis" />
        <div className="grid w-full gap-5 lg:grid-cols-[280px_1fr]">
          <section className="rounded-xl border border-[#dce5e8] bg-white p-6">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#102f3c] text-2xl font-bold text-white">
              JD
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-semibold">Jordan Davis</h3>
              <p className="mt-1 text-[11px] text-[#839198]">Administrator</p>
              <span className="mt-3 inline-block rounded-full bg-[#e7f5ed] px-2 py-1 text-[9px] font-bold text-[#4d9b73]">
                Active
              </span>
            </div>
          </section>
          <section className="rounded-xl border border-[#dce5e8] bg-white p-6">
            <h3 className="font-semibold">Profile details</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                  Full name
                </p>
                <p className="mt-2 text-[12px]">Jordan Davis</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                  Email address
                </p>
                <p className="mt-2 text-[12px]">jordan@aerovista.com</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                  Role
                </p>
                <p className="mt-2 text-[12px]">Administrator</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                  Last login
                </p>
                <p className="mt-2 text-[12px]">Today, 08:42</p>
              </div>
            </div>
            <div className="mt-6 border-t border-[#eef2f3] pt-5">
              <h4 className="text-[12px] font-semibold">Account access</h4>
              <p className="mt-2 text-[11px] text-[#839198]">
                Full access to dashboard, bookings, passengers, flights, and
                system settings.
              </p>
            </div>
          </section>
        </div>
      </div>
    </AirlineSystem>
  );
}
