"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "../components/icons";
import airplaneIcon from "../assets/icon.png";
import {
  fetchRoleByIdFromApi,
  fetchRolesFromApi,
  loginWithApi,
} from "../services/api";
import type { ApiRole } from "../ustils/type";

function extractPermissions(role: ApiRole | null | undefined) {
  return Array.isArray(role?.permissions)
    ? role.permissions.filter(
        (permission): permission is string => typeof permission === "string",
      )
    : [];
}

export default function AuthPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const apiUser = await loginWithApi(form.email, form.password);
      if (
        String(apiUser.status ?? "Active")
          .trim()
          .toLowerCase() === "inactive"
      ) {
        throw new Error(
          "This account is inactive. Please contact an administrator.",
        );
      }
      const roleNameFromApi = String(
        apiUser.roleName ?? apiUser.role ?? "Passenger",
      );
      const normalizedRoleName = roleNameFromApi.toLowerCase();
      const role =
        normalizedRoleName === "admin" || normalizedRoleName === "super_admin"
          ? "Admin"
          : roleNameFromApi;
      let permissions = apiUser.permissions ?? [];
      if (!permissions.length) {
        try {
          let matchedRole: ApiRole | null = null;
          if (apiUser.roleId !== undefined) {
            const roleResult = await fetchRoleByIdFromApi(apiUser.roleId);
            matchedRole =
              roleResult && typeof roleResult === "object"
                ? ((("data" in roleResult
                    ? roleResult.data
                    : roleResult) as ApiRole) ?? null)
                : null;
          }
          // Fall back to matching the role by name so custom roles without a
          // resolvable roleId still receive their configured permissions.
          if (!extractPermissions(matchedRole).length) {
            const roles = await fetchRolesFromApi();
            matchedRole =
              roles.find(
                (candidate) =>
                  String(candidate.name ?? "").toLowerCase() ===
                  normalizedRoleName,
              ) ?? null;
          }
          permissions = extractPermissions(matchedRole);
        } catch {
          // The built-in role fallback keeps older API responses usable.
        }
      }
      const user = {
        id: String(apiUser.id ?? ""),
        name: apiUser.name ?? "",
        email: apiUser.email ?? form.email,
        role,
        token: apiUser.token,
        authenticated: apiUser.authenticated ?? Boolean(apiUser.token),
        status: apiUser.status ?? "Active",
        permissions,
      };

      if (typeof window !== "undefined") {
        window.localStorage.setItem("aerovista-session-v1", String(user.id));
        window.localStorage.setItem(
          "aerovista-session-user-v1",
          JSON.stringify({
            ...user,
            password: undefined,
          }),
        );
        window.dispatchEvent(new Event("aerovista-session-updated"));
      }

      router.push(
        user.role === "Admin" ? "/pages/dashboard" : "/pages/book-flight",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to authenticate.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell relative min-h-screen overflow-hidden bg-[#071f2b] text-white">
      <div className="login-orb login-orb-one" aria-hidden="true" />
      <div className="login-orb login-orb-two" aria-hidden="true" />
      <div className="login-grid" aria-hidden="true" />
      <div className="login-flight login-flight-one" aria-hidden="true">
        <span className="login-flight-line" />
        <Image
          src={airplaneIcon}
          alt=""
          width={84}
          height={84}
          className="login-aircraft login-aircraft-large"
        />
      </div>
      <div className="login-flight login-flight-two" aria-hidden="true">
        <span className="login-flight-line" />
        <Image
          src={airplaneIcon}
          alt=""
          width={62}
          height={62}
          className="login-aircraft login-aircraft-small"
        />
      </div>
      <div className="login-flight login-flight-three" aria-hidden="true">
        <span className="login-flight-line" />
        <Image
          src={airplaneIcon}
          alt=""
          width={70}
          height={70}
          className="login-aircraft login-aircraft-medium"
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_460px] lg:px-12">
        <section className="hidden max-w-xl lg:block text-white">
          <div className="mb-12 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-[#72e0c2] text-[#072735] shadow-[0_0_30px_rgba(114,224,194,0.3)]">
              <Icon name="plane" size={24} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#72e0c2]">
                Safety
              </p>
              <p className="text-sm font-medium text-white/70">
                Airline system
              </p>
            </div>
          </div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[3px] text-[#72e0c2]">
            Your journey starts here
          </p>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.04em] text-white xl:text-6xl">
            Move through the world with confidence.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-[#b3cdd1]">
            One clear view for every flight, reservation, and destination. Sign
            in to continue your journey.
          </p>
          <div className="mt-12 flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#72e0c2] shadow-[0_0_12px_#72e0c2]" />
              Live operations
            </span>
            <span className="h-4 w-px bg-white/20" />
            <span className="flex items-center gap-2">
              <Icon name="shield" size={15} />
              Secure access
            </span>
          </div>
        </section>

        <section className="w-full rounded-[28px] border border-white/15 bg-white p-7 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-10">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="mb-5 flex items-center gap-2 lg:hidden">
                <div className="grid size-9 place-items-center rounded-xl bg-[#0e6b69] text-white">
                  <Icon name="plane" size={19} />
                </div>
                <span className="text-xs font-bold uppercase tracking-[2px] text-[#0e6b69]">
                  Safety Airline
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-[2px] text-[#0e6b69]">
                Member access
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Sign in to manage your next destination.
              </p>
            </div>
            <div className="hidden rounded-2xl bg-[#e8f6f1] p-3 text-[#0e6b69] sm:block">
              <Icon name="globe" size={22} />
            </div>
          </div>

          <form className="grid gap-5" onSubmit={submit}>
            <label className="grid gap-2 text-xs font-bold text-slate-700">
              Email address
              <input
                required
                autoComplete="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                className="h-12 w-full rounded-xl border border-[#dce5e8] bg-[#f8fbfa] px-4 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#0e6b69] focus:bg-white focus:ring-4 focus:ring-[#0e6b69]/10"
              />
            </label>
            <label className="grid gap-2 text-xs font-bold text-slate-700">
              Password
              <input
                required
                autoComplete="current-password"
                type="password"
                minLength={6}
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                className="h-12 w-full rounded-xl border border-[#dce5e8] bg-[#f8fbfa] px-4 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#0e6b69] focus:bg-white focus:ring-4 focus:ring-[#0e6b69]/10"
              />
            </label>
            <button
              className="group mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0e6b69] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(14,107,105,0.22)] transition hover:-translate-y-0.5 hover:bg-[#095957] hover:shadow-[0_14px_28px_rgba(14,107,105,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-75"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Continue to dashboard"}
              {!loading && (
                <Icon
                  name="arrow-right"
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
          {message && (
            <p
              className="mt-5 rounded-xl border border-[#f4c9c2] bg-[#fff3f1] px-4 py-3 text-xs font-medium text-[#b85d51]"
              role="alert"
            >
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
