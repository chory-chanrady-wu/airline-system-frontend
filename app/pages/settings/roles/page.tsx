"use client";

import { useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";

type RoleRow = [string, string, string];
const roles: RoleRow[] = [];

export default function RolesPage() {
  const [showForm, setShowForm] = useState(false);
  const [roleRows, setRoleRows] = useState(roles);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", access: "", users: "0 users" });

  function createRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.access.trim()) return;
    setRoleRows([...roleRows, [form.name, form.access, form.users]]);
    setForm({ name: "", access: "", users: "0 users" });
    setShowForm(false);
  }

  function editRole(role: RoleRow) {
    setForm({ name: role[0], access: role[1], users: role[2] });
    setShowForm(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      setRoleRows(roleRows.filter((item) => item[0] !== pendingDelete));
      setPendingDelete(null);
    }
  }

  return (
    <AirlineSystem initialModule="Roles">
      <div className="module-page">
        <PageTitle
          eyebrow="Settings / Roles"
          title="Roles & permissions"
          action="Create role"
          onAction={() => setShowForm(!showForm)}
        />
        {pendingDelete && (
          <div className="fixed left-1/2 top-1/2 z-40 flex min-h-[160px] w-[320px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-5 rounded-xl border border-[#dce5e8] bg-white px-6 py-6 text-[13px] text-[#172b3a] shadow-2xl">
            <span className="font-semibold">Delete this role?</span>
            <div className="flex items-center gap-4">
              <button
                onClick={confirmDelete}
                className="rounded bg-[#ed744d] px-3 py-1.5 font-bold"
              >
                Confirm
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                className="font-semibold text-[#0e6b69]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {showForm && (
          <form
            onSubmit={createRole}
            className="mb-5 rounded-xl border border-[#dce5e8] bg-white p-6"
          >
            <div className="mb-5">
              <h3 className="font-semibold">Create new role</h3>
              <p className="mt-1 text-[11px] text-[#839198]">
                Define a role and describe the access it provides.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] font-semibold">
                Role name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal outline-none"
                  placeholder="e.g. Check-in agent"
                />
              </label>
              <label className="text-[11px] font-semibold">
                Access level
                <input
                  required
                  value={form.access}
                  onChange={(event) =>
                    setForm({ ...form, access: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal outline-none"
                  placeholder="e.g. Passenger check-in"
                />
              </label>
            </div>
            <fieldset className="mt-5">
              <legend className="text-[11px] font-semibold">Permissions</legend>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-[#526a73]">
                <label>
                  <input type="checkbox" className="mr-2" defaultChecked /> View
                  passengers
                </label>
                <label>
                  <input type="checkbox" className="mr-2" /> Manage reservations
                </label>
                <label>
                  <input type="checkbox" className="mr-2" /> Manage flights
                </label>
              </div>
            </fieldset>
            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#0e6b69] px-4 py-2.5 text-[11px] font-bold text-white"
              >
                Create role
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-[#dce5e8] px-4 py-2.5 text-[11px] font-bold text-[#526a73]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        <div className="w-full overflow-hidden rounded-xl border border-[#dce5e8] bg-white">
          <div className="grid grid-cols-[1fr_1.5fr_100px_140px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
            <span>Role</span>
            <span>Access level</span>
            <span>Users</span>
            <span>Actions</span>
          </div>
          {roleRows.map(([role, access, users]) => (
            <div
              className="grid grid-cols-[1fr_1.5fr_100px_140px] border-t border-[#eef2f3] px-5 py-4 text-[11px]"
              key={role}
            >
              <strong>{role}</strong>
              <span className="text-[#71838a]">{access}</span>
              <span className="text-[#71838a]">{users}</span>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <button
                  onClick={() => editRole([role, access, users])}
                  className="rounded border border-[#6bb8ae] px-2 py-1 font-semibold text-[#0e6b69] hover:bg-[#e1f2ed]"
                >
                  Edit
                </button>
                <button
                  onClick={() => setPendingDelete(role)}
                  className="rounded border border-[#e2a39b] px-2 py-1 font-semibold text-[#c56d61] hover:bg-[#fbeae7]"
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </AirlineSystem>
  );
}
