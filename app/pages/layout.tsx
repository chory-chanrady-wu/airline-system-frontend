"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getSession, isAuthenticatedSession } from "../services/airline-system";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getSession();
    const isAuthenticated = isAuthenticatedSession();

    if (!session || !isAuthenticated) {
      router.replace("/");
      return;
    }

    if (pathname === "/pages") {
      router.replace(
        session.role === "Admin" ? "/pages/dashboard" : "/pages/book-flight",
      );
    }
  }, [pathname, router]);

  return <>{children}</>;
}
