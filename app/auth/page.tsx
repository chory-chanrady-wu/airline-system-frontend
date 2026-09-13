"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, type Role } from "../services/airline-system";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("Passenger");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (mode === "register")
        register(form.name, form.email, form.password, role);
      login(form.email, form.password);
      router.push(role === "Admin" ? "/pages/dashboard" : "/pages/book-flight");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to authenticate.",
      );
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f7f8] p-5">
      <section className="w-full max-w-md rounded-2xl border border-[#dce5e8] bg-white p-7 shadow-xl">
        <p className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#769099]">
          Safty Airline System
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-[11px] text-[#839198]">
          Use a Passenger or Admin account to access the system.
        </p>
        <div className="mt-6 flex gap-2 rounded-lg bg-[#f1f6f5] p-1">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`flex-1 rounded-md px-3 py-2 text-[11px] font-bold ${mode === item ? "bg-white text-[#0e6b69] shadow" : "text-[#839198]"}`}
            >
              {item === "login" ? "Log in" : "Register"}
            </button>
          ))}
        </div>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          {mode === "register" && (
            <label className="text-[11px] font-semibold">
              Full name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 font-normal outline-none"
              />
            </label>
          )}
          <label className="text-[11px] font-semibold">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 font-normal outline-none"
            />
          </label>
          <label className="text-[11px] font-semibold">
            Password
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              className="mt-2 w-full rounded-lg border border-[#dce5e8] px-3 py-2 font-normal outline-none"
            />
          </label>
          {mode === "register" && (
            <label className="text-[11px] font-semibold">
              Account type
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className="mt-2 w-full rounded-lg border border-[#dce5e8] bg-white px-3 py-2 font-normal outline-none"
              >
                <option>Passenger</option>
                <option>Admin</option>
              </select>
            </label>
          )}
          <button
            className="rounded-lg bg-[#0e6b69] px-4 py-3 text-[11px] font-bold text-white"
            type="submit"
          >
            {mode === "login" ? "Log in" : "Register account"}
          </button>
        </form>
        {message && (
          <p
            className="mt-4 rounded-lg bg-[#fbeae7] px-3 py-2 text-[11px] text-[#c56d61]"
            role="alert"
          >
            {message}
          </p>
        )}
        <p className="mt-5 text-[10px] text-[#839198]">
          Demo accounts: jordan@aerovista.com / admin123 and
          sophia@aerovista.com / pass123.
        </p>
      </section>
    </main>
  );
}
