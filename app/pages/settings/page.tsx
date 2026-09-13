import Link from "next/link";
import { AirlineSystem } from "../../components/airline-system";
import { Icon } from "../../components/icons";
import { PageTitle } from "../../components/page-title";

export default function SettingsPage() {
  return (
    <AirlineSystem initialModule="Settings">
      <div className="module-page">
        <PageTitle eyebrow="System configuration" title="Settings" />
        <div className="grid w-full gap-5 sm:grid-cols-2">
          <Link
            href="/pages/settings/user"
            className="group rounded-xl border border-[#dce5e8] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#42b5a4] hover:shadow-md"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e1f2ed] text-[#0e6b69]">
              <Icon name="user" size={19} />
            </span>
            <h3 className="mt-5 font-semibold">User settings</h3>
            <p className="mt-2 text-[11px] text-[#839198]">
              Manage your profile, account details, and preferences.
            </p>
            <span className="mt-5 block text-[11px] font-bold text-[#0e6b69] group-hover:underline">
              Open User settings →
            </span>
          </Link>
          <Link
            href="/pages/settings/roles"
            className="group rounded-xl border border-[#dce5e8] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#42b5a4] hover:shadow-md"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e1f2ed] text-[#0e6b69]">
              <Icon name="settings" size={19} />
            </span>
            <h3 className="mt-5 font-semibold">Roles & permissions</h3>
            <p className="mt-2 text-[11px] text-[#839198]">
              Control access levels and permissions for system users.
            </p>
            <span className="mt-5 block text-[11px] font-bold text-[#0e6b69] group-hover:underline">
              Open Roles →
            </span>
          </Link>
        </div>
      </div>
    </AirlineSystem>
  );
}
