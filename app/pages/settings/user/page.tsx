"use client";

import { useEffect, useState } from "react";
import { AirlineSystem } from "../../../components/airline-system";
import { PageTitle } from "../../../components/page-title";
import { fetchUsersFromApi, type ApiUser } from "../../../services/api";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
};

export default function UserSettingsPage() {
  const [showForm, setShowForm] = useState(false);
  const [userRows, setUserRows] = useState<UserRow[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Support agent",
    status: "Active",
  });

  useEffect(() => {
    let active = true;
    void fetchUsersFromApi()
      .then((users) => {
        if (!active) return;
        setUserRows(
          users.map((user: ApiUser) => ({
            id: String(user.id ?? user.email ?? ""),
            name: String(user.name ?? ""),
            email: String(user.email ?? ""),
            role: String(user.roleName ?? user.role ?? ""),
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

  function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setUserRows([
      ...userRows,
      {
        id: `local-${Date.now()}`,
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        lastLogin: "—",
      },
    ]);
    setForm({ name: "", email: "", role: "Support agent", status: "Active" });
    setShowForm(false);
  }

  function editUser(user: UserRow) {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowForm(true);
  }

  function confirmDelete() {
    if (pendingDelete) {
      setUserRows(userRows.filter((user) => user.email !== pendingDelete));
      setPendingDelete(null);
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
          <div className="fixed left-1/2 top-1/2 z-40 flex min-h-[160px] w-[320px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-5 rounded-xl border border-[#dce5e8] bg-white px-6 py-6 text-[13px] text-[#172b3a] shadow-2xl">
            <span className="font-semibold">Delete this user?</span>
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
            onSubmit={createUser}
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
              <label className="text-[11px] font-semibold">
                Role
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[11px] font-normal outline-none"
                >
                  <option>Administrator</option>
                  <option>Operations manager</option>
                  <option>Support agent</option>
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
                Create user
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
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#dce5e8] bg-white px-3 py-2 text-[#94a2a6] sm:max-w-[300px]">
          <input
            className="w-full border-0 bg-transparent text-[11px] outline-none"
            placeholder="Search users"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {error && <p className="mb-4 text-[11px] text-[#c56d61]">{error}</p>}
        <div className="overflow-hidden rounded-xl border border-[#dce5e8] bg-white">
          <div className="grid min-w-[900px] grid-cols-[1.2fr_1.4fr_1.2fr_100px_120px_140px] bg-[#f7fafb] px-5 py-3 text-[10px] font-bold uppercase tracking-[1px] text-[#839198]">
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
                className="grid min-w-[900px] grid-cols-[1.2fr_1.4fr_1.2fr_100px_120px_140px] items-center border-t border-[#eef2f3] px-5 py-4 text-[11px]"
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
                    onClick={() => setPendingDelete(user.email)}
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
