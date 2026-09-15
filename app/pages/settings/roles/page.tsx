"use client";

import { useEffect, useMemo, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import {
  createRoleWithApi,
  deleteRoleWithApi,
  fetchRolesFromApi,
  fetchUsersFromApi,
  updateRoleWithApi,
  type ApiRole,
} from "../../../services/api";

const PERMISSIONS_BY_MODULE = {
  Users: ["USERS_READ", "USERS_WRITE"],
  Airports: ["AIRPORTS_READ", "AIRPORTS_WRITE"],
  Flights: ["FLIGHTS_READ", "FLIGHTS_WRITE"],
  Bookings: ["BOOKINGS_READ", "BOOKINGS_WRITE"],
} as const;
type PermissionModule = keyof typeof PERMISSIONS_BY_MODULE;
const MODULES = Object.keys(PERMISSIONS_BY_MODULE) as PermissionModule[];

type RoleRow = {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: string[];
  createdAt: string;
  rawId: string | number;
};
type RoleForm = { name: string; description: string; permissions: string[] };
const emptyForm: RoleForm = { name: "", description: "", permissions: [] };

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "—";
}

function mapRole(role: ApiRole, users: number): RoleRow {
  const rawId = role.id ?? role.name ?? "";
  return {
    id: String(rawId),
    rawId,
    name: String(role.name ?? "Untitled role"),
    description: String(role.description ?? "No description provided"),
    permissions: role.permissions ?? [],
    createdAt: formatDate(role.createdAt),
    users,
  };
}

export default function RolesPage() {
  const [showForm, setShowForm] = useState(false);
  const [roleRows, setRoleRows] = useState<RoleRow[]>([]);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RoleRow | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedModule, setSelectedModule] =
    useState<PermissionModule>("Users");

  async function loadRoles(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      const [roles, users] = await Promise.all([
        fetchRolesFromApi(),
        fetchUsersFromApi(),
      ]);
      setRoleRows(
        roles.map((role) =>
          mapRole(
            role,
            users.filter(
              (user) =>
                (user.roleName ?? user.role ?? "").toLowerCase() ===
                (role.name ?? "").toLowerCase(),
            ).length,
          ),
        ),
      );
      setError("");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load roles.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadRoles(false));
  }, []);

  function openCreateForm() {
    setEditingRole(null);
    setForm(emptyForm);
    setSelectedModule("Users");
    setShowForm(true);
    setError("");
  }

  function openEditForm(role: RoleRow) {
    setEditingRole(role);
    setForm({
      name: role.name,
      description:
        role.description === "No description provided" ? "" : role.description,
      permissions: role.permissions,
    });
    setSelectedModule("Users");
    setShowForm(true);
    setError("");
  }

  function togglePermission(permission: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  async function saveRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.description.trim()) return;
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      permissions: form.permissions,
    };
    try {
      if (editingRole) await updateRoleWithApi(editingRole.rawId, payload);
      else await createRoleWithApi(payload);
      setShowForm(false);
      setEditingRole(null);
      setForm(emptyForm);
      await loadRoles();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save this role.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setSaving(true);
    try {
      await deleteRoleWithApi(pendingDelete.rawId);
      setPendingDelete(null);
      await loadRoles();
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete this role.",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredRoles = useMemo(
    () =>
      roleRows.filter((role) =>
        `${role.name} ${role.description} ${role.permissions.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, roleRows],
  );
  const totalPermissions = roleRows.reduce(
    (total, role) => total + role.permissions.length,
    0,
  );

  return (
    <AirlineSystem initialModule="Roles">
      <div className="module-page">
        <PageTitle
          eyebrow="Settings / Access control"
          title="Roles & permissions"
          action="Create role"
          onAction={openCreateForm}
        />
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-[#f2cbc5] bg-[#fff6f4] px-4 py-3 text-[11px] text-[#b65d50]">
            <span>{error}</span>
            <button className="font-bold" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Total roles", roleRows.length, "Defined access profiles"],
            [
              "Assigned users",
              roleRows.reduce((total, role) => total + role.users, 0),
              "Across all roles",
            ],
            ["Permission grants", totalPermissions, "Configured capabilities"],
          ].map(([label, value, caption]) => (
            <div
              className="rounded-xl border border-[#dce5e8] bg-white p-4"
              key={label}
            >
              <p className="text-[10px] font-bold uppercase tracking-[1.3px] text-[#839198]">
                {label}
              </p>
              <strong className="mt-2 block text-[25px] tracking-[-1px] text-[#172b3a]">
                {value}
              </strong>
              <span className="text-[10px] text-[#839198]">{caption}</span>
            </div>
          ))}
        </div>

        {showForm && (
          <form
            onSubmit={saveRole}
            className="mb-5 rounded-xl border border-[#b8ded5] bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {editingRole ? "Edit role" : "Create new role"}
                </h3>
                <p className="mt-1 text-[11px] text-[#839198]">
                  Set a clear description and choose the capabilities this role
                  can use.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-[11px] font-bold text-[#839198]"
              >
                Close
              </button>
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
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2.5 text-[11px] font-normal outline-none focus:border-[#42b5a4]"
                  placeholder="e.g. Check-in agent"
                />
              </label>
              <label className="text-[11px] font-semibold">
                Description
                <input
                  required
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2.5 text-[11px] font-normal outline-none focus:border-[#42b5a4]"
                  placeholder="Describe the access this role provides"
                />
              </label>
            </div>
            <fieldset className="mt-5">
              <legend className="text-[11px] font-semibold">
                Permissions ({form.permissions.length} selected)
              </legend>
              <div className="mt-3 grid gap-4 lg:grid-cols-[180px_1fr]">
                <div className="grid content-start gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                    1. Select module
                  </p>
                  {MODULES.map((module) => {
                    const modulePermissions = PERMISSIONS_BY_MODULE[module];
                    const selectedCount = modulePermissions.filter(
                      (permission) => form.permissions.includes(permission),
                    ).length;

                    return (
                      <button
                        type="button"
                        key={module}
                        onClick={() => setSelectedModule(module)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-[10px] font-semibold ${selectedModule === module ? "border-[#8ecdc0] bg-[#e8f5f1] text-[#0e6b69]" : "border-[#dce5e8] text-[#526a73] hover:bg-[#f7fafb]"}`}
                      >
                        <span>{module}</span>
                        <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px]">
                          {selectedCount}/{modulePermissions.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
                    2. Select {selectedModule.toLowerCase()} permissions
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {PERMISSIONS_BY_MODULE[selectedModule].map((permission) => (
                      <label
                        key={permission}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-[10px] font-semibold ${form.permissions.includes(permission) ? "border-[#8ecdc0] bg-[#e8f5f1] text-[#0e6b69]" : "border-[#dce5e8] text-[#526a73]"}`}
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                        />
                        {permission}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>
            <div className="mt-5 flex gap-2">
              <button
                disabled={saving}
                type="submit"
                className="rounded-lg bg-[#0e6b69] px-4 py-2.5 text-[11px] font-bold text-white disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingRole
                    ? "Save changes"
                    : "Create role"}
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

        {pendingDelete && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-[#172b3a]/20 px-5">
            <div className="w-full max-w-90 rounded-xl border border-[#dce5e8] bg-white p-6 shadow-2xl">
              <p className="text-[15px] font-semibold">
                Delete {pendingDelete.name}?
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                This will permanently remove the role and its permission
                configuration.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  disabled={saving}
                  onClick={() => setPendingDelete(null)}
                  className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold text-[#526a73]"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  onClick={confirmDelete}
                  className="rounded-lg bg-[#c56d61] px-4 py-2 text-[11px] font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Deleting..." : "Delete role"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[#94a2a6] sm:max-w-85">
          <input
            className="w-full border-0 bg-transparent text-[11px] outline-none"
            placeholder="Search roles or permissions"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="w-full overflow-x-auto rounded-xl border border-[#dce5e8] bg-white">
          <div className="grid min-w-245 grid-cols-[1.1fr_1.6fr_2.3fr_80px_120px_140px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
            <span>Role</span>
            <span>Description</span>
            <span>Permissions</span>
            <span>Users</span>
            <span>Created</span>
            <span>Actions</span>
          </div>
          {loading ? (
            <div className="px-5 py-10 text-center text-[11px] text-[#839198]">
              Loading roles...
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="px-5 py-10 text-center text-[11px] text-[#839198]">
              No roles match your search.
            </div>
          ) : (
            filteredRoles.map((role) => (
              <div
                className="grid min-w-245 grid-cols-[1.1fr_1.6fr_2.3fr_80px_120px_140px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
                key={role.id}
              >
                <div>
                  <strong className="block">{role.name}</strong>
                  <span className="mt-1 block text-[9px] text-[#839198]">
                    ID: {role.id}
                  </span>
                </div>
                <span className="pr-4 text-[#71838a]">{role.description}</span>
                <span className="flex flex-wrap gap-1.5 pr-3">
                  {role.permissions.length ? (
                    role.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full bg-[#e8f5f1] px-2 py-1 text-[9px] font-semibold text-[#0e6b69]"
                      >
                        {permission}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#839198]">No permissions</span>
                  )}
                </span>
                <span className="font-semibold text-[#526a73]">
                  {role.users}
                </span>
                <span className="text-[#71838a]">{role.createdAt}</span>
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <button
                    onClick={() => openEditForm(role)}
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
            ))
          )}
        </div>
      </div>
    </AirlineSystem>
  );
}
