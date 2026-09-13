"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import airplaneIcon from "../assets/icon.png";
import { Icon } from "./icons";
import type { Module } from "./airline-data";

type ThemePreference = "light" | "dark" | "system";
const menu: {
  label: Module;
  icon: "globe" | "ticket" | "calendar" | "user" | "plane" | "settings";
  href: string;
}[] = [
  { label: "Dashboard", icon: "globe", href: "/pages/dashboard" },
  { label: "Book flight", icon: "ticket", href: "/pages/book-flight" },
  { label: "Reservations", icon: "calendar", href: "/pages/reservations" },
  { label: "Passengers", icon: "user", href: "/pages/passengers" },
  { label: "Flights", icon: "plane", href: "/pages/flights" },
  { label: "Settings", icon: "settings", href: "/pages/settings" },
];

export function AirlineSystem({
  initialModule = "Dashboard",
  children,
}: {
  initialModule?: Module;
  children: ReactNode;
}) {
  const [activeModule, setActiveModule] = useState<Module>(initialModule);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState<ThemePreference>("system");
  const router = useRouter();

  useEffect(() => {
    const saved = window.localStorage.getItem(
      "aerovista-theme",
    ) as ThemePreference | null;
    if (saved === "light" || saved === "dark" || saved === "system")
      setTheme(saved);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };
    applyTheme();
    if (theme !== "system") return;
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  function changeTheme(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    window.localStorage.setItem("aerovista-theme", nextTheme);
  }
  function selectModule(module: Module) {
    setActiveModule(module);
    setSidebarOpen(false);
    setNotice("");
    router.push(
      menu.find((item) => item.label === module)?.href ?? "/pages/dashboard",
    );
  }
  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7f8] text-[#172b3a]">
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-20 flex w-[250px] flex-col overflow-hidden border-r border-[#dce5e8] bg-[#102f3c] text-white transition-transform lg:translate-x-0`}
      >
        <div className="flex h-[78px] items-center gap-2.5 border-b border-white/10 px-6">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#42b5a4] p-1">
            <Image
              src={airplaneIcon}
              alt="AeroVista airplane"
              width={32}
              height={32}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <div>
            <strong className="block text-[15px] tracking-wide">
              Safty Airline
            </strong>
            <span className="text-[9px] uppercase tracking-[1.5px] text-[#8daeb3]">
              Airline system
            </span>
          </div>
        </div>
        <div className="px-4 pt-7">
          <p className="px-3 text-[9px] font-bold uppercase tracking-[1.8px] text-[#72929a]">
            Workspace
          </p>
          <nav className="mt-3 grid gap-1">
            {menu.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-[12px] font-semibold transition ${activeModule === item.label ? "bg-[#1e5960] text-white shadow-[inset_3px_0_#55c7b5]" : "text-[#a2bcc0] hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                </Link>
                {item.label === "Settings" && (
                  <div className="ml-5 grid border-l border-white/10 pl-3">
                    <Link
                      href="/pages/settings/user"
                      className={`px-3 py-2 text-[11px] ${activeModule === "User" ? "text-white" : "text-[#8daeb3] hover:text-white"}`}
                    >
                      User
                    </Link>
                    <Link
                      href="/pages/settings/roles"
                      className={`px-3 py-2 text-[11px] ${activeModule === "Roles" ? "text-white" : "text-[#8daeb3] hover:text-white"}`}
                    >
                      Roles
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-white/10 p-4">
          <Link
            href="/pages/profile"
            className="flex items-center gap-2.5 rounded-lg bg-white/5 p-3 transition hover:bg-white/10"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dceee8] text-[11px] font-bold text-[#0e6b69]">
              JD
            </span>
            <div className="min-w-0">
              <strong className="block truncate text-[11px]">
                Jordan Davis
              </strong>
              <span className="text-[9px] text-[#8daeb3]">Administrator</span>
            </div>
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-[250px]">
        <header className="fixed inset-x-0 top-0 z-10 flex h-[78px] items-center justify-between border-b border-[#dce5e8] bg-white px-5 sm:px-8 lg:left-[250px]">
          <div className="flex items-center gap-3">
            <button
              className="text-[#0e6b69] lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              <span className="block h-0.5 w-5 bg-current"></span>
              <span className="mt-1 block h-0.5 w-5 bg-current"></span>
            </button>
            <div>
              <p className="text-[10px] text-[#839198]">
                Monday, 12 October 2026
              </p>
              <h1 className="mt-1 text-[20px] font-semibold tracking-[-.5px]">
                {activeModule}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <label
              className="flex items-center gap-1.5 rounded-lg border border-[#dce5e8] px-2 py-1.5 text-[#70818d]"
              title="Theme preference"
            >
              <Icon
                name={
                  theme === "light"
                    ? "sun"
                    : theme === "dark"
                      ? "moon"
                      : "monitor"
                }
                size={15}
              />
              <select
                aria-label="Theme preference"
                value={theme}
                onChange={(event) =>
                  changeTheme(event.target.value as ThemePreference)
                }
                className="bg-transparent text-[10px] font-semibold outline-none"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <button
              className="relative rounded-full p-2 text-[#70818d] hover:bg-[#f1f6f5]"
              aria-label="Notifications"
              onClick={() => showNotice("You have 3 new notifications.")}
            >
              <Icon name="ticket" size={19} />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#ed744d]"></span>
            </button>
            <span className="hidden text-[11px] font-semibold text-[#526a73] sm:block">
              Operations control
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] p-5 pt-[98px] sm:p-8 sm:pt-[110px]">
          {notice && (
            <div className="fixed right-5 top-20 z-30 flex items-center gap-2 rounded-lg bg-[#173f4a] px-4 py-3 text-[11px] text-white shadow-xl">
              <Icon name="check" size={16} /> {notice}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
