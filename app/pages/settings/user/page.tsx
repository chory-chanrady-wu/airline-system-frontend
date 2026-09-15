"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import {
  createUserWithApi,
  deleteUserWithApi,
  fetchRolesFromApi,
  fetchUsersFromApi,
  updateUserWithApi,
  type ApiRole,
  type ApiUser,
} from "../../../services/api";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  status: string;
  lastLogin: string;
};

export default function UserSettingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [userRows, setUserRows] = useState<UserRow[]>([]);
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: "",
    status: "Active",
  });
  const activeUsers = userRows.filter(
    (user) => user.status.toLowerCase() === "active",
  ).length;
  const inactiveUsers = userRows.length - activeUsers;
  const administratorUsers = userRows.filter((user) =>
    user.role.toLowerCase().includes("admin"),
  ).length;

  useEffect(() => {
    let active = true;
    void Promise.all([fetchUsersFromApi(), fetchRolesFromApi()])
      .then(([users, availableRoles]) => {
        if (!active) return;
        setRoles(availableRoles);
        setUserRows(
          users.map((user: ApiUser) => ({
            id: String(user.id ?? user.email ?? ""),
            name: String(user.name ?? ""),
            email: String(user.email ?? ""),
            role: String(user.roleName ?? user.role ?? ""),
            roleId: String(user.roleId ?? ""),
            status: String(user.status ?? ""),
            lastLogin: user.updatedAt
              ? new Date(user.updatedAt).toLocaleDateString()
              : "—",
          })),
        );
        setError("");
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load users.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      (!editingUser && !form.password.trim())
    )
      return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        roleId: form.roleId,
        status: form.status,
        ...(form.password ? { password: form.password } : {}),
      };
      if (editingUser) await updateUserWithApi(editingUser.id, payload);
      else await createUserWithApi(payload);
      const users = await fetchUsersFromApi();
      setUserRows(
        users.map((user) => ({
          id: String(user.id ?? user.email ?? ""),
          name: String(user.name ?? ""),
          email: String(user.email ?? ""),
          role: String(user.roleName ?? user.role ?? ""),
          roleId: String(user.roleId ?? ""),
          status: String(user.status ?? ""),
          lastLogin: user.updatedAt
            ? new Date(user.updatedAt).toLocaleDateString()
            : "—",
        })),
      );
      setForm({
        name: "",
        email: "",
        password: "",
        roleId: roles[0] ? String(roles[0].id) : "",
        status: "Active",
      });
      setEditingUser(null);
      setShowForm(false);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save user.",
      );
    } finally {
      setSaving(false);
    }
  }

  function editUser(user: UserRow) {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      roleId: user.roleId,
      status: user.status,
    });
    setEditingUser(user);
    setShowForm(true);
  }

  async function confirmDelete() {
    if (pendingDelete) {
      setSaving(true);
      try {
        await deleteUserWithApi(pendingDelete.id);
        setUserRows(userRows.filter((user) => user.id !== pendingDelete.id));
        setPendingDelete(null);
      } catch (requestError: unknown) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to delete user.",
        );
      } finally {
        setSaving(false);
      }
    }
  }

  return (
    <AirlineSystem initialModule="User">
      <div className="module-page">
        <PageTitle
          eyebrow="Settings / User management"
          title="Users"
          action="New user"
          onAction={() => setShowForm(!showForm)}
        />
        {pendingDelete && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-[#172b3a]/20 px-5">
            <div className="w-full max-w-90 rounded-xl border border-[#dce5e8] bg-white p-6 text-[#172b3a] shadow-2xl">
              <p className="text-[15px] font-semibold">
                Delete {pendingDelete.name}?
              </p>
              <p className="mt-2 text-[11px] leading-5 text-[#71838a]">
                This will permanently remove the user account.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setPendingDelete(null)}
                  className="rounded-lg border border-[#dce5e8] px-4 py-2 text-[11px] font-bold text-[#526a73]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={confirmDelete}
                  className="rounded-lg bg-[#c56d61] px-4 py-2 text-[11px] font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Deleting..." : "Delete user"}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total users", userRows.length, "Registered accounts"],
            ["Active users", activeUsers, "Currently enabled"],
            ["Inactive users", inactiveUsers, "Access disabled"],
            ["Administrators", administratorUsers, "Users with admin access"],
          ].map(([label, value, caption]) => (
            <div
              key={label}
              className="rounded-xl border border-[#dce5e8] bg-white p-4"
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
            onSubmit={saveUser}
            className="mb-5 rounded-xl border border-[#dce5e8] bg-white p-6"
          >
            <div className="mb-5">
              <h3 className="font-semibold">Create new user</h3>
              <p className="mt-1 text-[11px] text-[#839198]">
                Add a user and assign access to the airline system.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] font-semibold">
                Full name
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal outline-none"
                  placeholder="Enter full name"
                />
              </label>
              <label className="text-[11px] font-semibold">
                Email address
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal outline-none"
                  placeholder="name@example.com"
                />
              </label>
              {!editingUser && (
                <label className="text-[11px] font-semibold">
                  Password
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm({ ...form, password: event.target.value })
                    }
                    className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 text-[11px] font-normal outline-none"
                    placeholder="Temporary password"
                  />
                </label>
              )}
              <label className="text-[11px] font-semibold">
                Role
                <select
                  value={form.roleId}
                  onChange={(event) =>
                    setForm({ ...form, roleId: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal outline-none"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] font-semibold">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal outline-none"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#0e6b69] px-4 py-2.5 text-[11px] font-bold text-white"
              >
                {saving
                  ? "Saving..."
                  : editingUser
                    ? "Save changes"
                    : "Create user"}
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
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[#94a2a6] sm:max-w-75">
          <input
            className="w-full border-0 bg-transparent text-[11px] outline-none"
            placeholder="Search users"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {error && <p className="mb-4 text-[11px] text-[#c56d61]">{error}</p>}
        <div className="overflow-hidden rounded-xl border border-[#dce5e8] bg-white">
          <div className="grid min-w-225 grid-cols-[1.2fr_1.4fr_1.2fr_100px_120px_140px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last login</span>
            <span>Actions</span>
          </div>
          {userRows
            .filter((user) =>
              `${user.name} ${user.email} ${user.role}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((user) => (
              <div
                className="grid min-w-225 grid-cols-[1.2fr_1.4fr_1.2fr_100px_120px_140px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
                key={user.id}
              >
                <strong>{user.name}</strong>
                <span className="text-[#71838a]">{user.email}</span>
                <span className="text-[#71838a]">{user.role}</span>
                <span>
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-bold ${user.status === "Active" ? "bg-[#e7f5ed] text-[#4d9b73]" : "bg-[#fbeae7] text-[#c56d61]"}`}
                  >
                    {user.status || "—"}
                  </span>
                </span>
                <span className="text-[#71838a]">{user.lastLogin}</span>
                <span className="flex gap-2">
                  <button
                    onClick={() => editUser(user)}
                    className="font-semibold text-[#0e6b69] hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(user)}
                    className="font-semibold text-[#c56d61] hover:underline"
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
