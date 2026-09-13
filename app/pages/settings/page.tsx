import Link from "next/link";
import { AirlineSystem } from "../../components/airline-system";
import { PageTitle } from "../../components/page-title";

export default function SettingsPage() {
  return (
    <AirlineSystem initialModule="Settings">
      <div className="mx-auto max-w-[1600px]">
        <PageTitle eyebrow="System configuration" title="Settings" />
        <div className="grid max-w-[900px] gap-4 sm:grid-cols-2">
          <Link
            href="/pages/settings/user"
            className="rounded-xl border border-[#dce5e8] bg-white p-6 transition hover:border-[#42b5a4] hover:shadow-sm"
          >
            <h3 className="font-semibold">User settings</h3>
            <p className="mt-2 text-[11px] text-[#839198]">
              Manage your profile, account details, and preferences.
            </p>
            <span className="mt-5 block text-[11px] font-bold text-[#0e6b69]">
              Open User settings →
            </span>
          </Link>
          <Link
            href="/pages/settings/roles"
            className="rounded-xl border border-[#dce5e8] bg-white p-6 transition hover:border-[#42b5a4] hover:shadow-sm"
          >
            <h3 className="font-semibold">Roles & permissions</h3>
            <p className="mt-2 text-[11px] text-[#839198]">
              Control access levels and permissions for system users.
            </p>
            <span className="mt-5 block text-[11px] font-bold text-[#0e6b69]">
              Open Roles →
            </span>
          </Link>
        </div>
      </div>
    </AirlineSystem>
  );
}
