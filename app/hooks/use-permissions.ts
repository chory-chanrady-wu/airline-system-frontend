"use client";

import { useEffect, useState } from "react";
import { getSession } from "../services/airline-system";
import {
  canRead,
  canWrite,
  hasPermission,
  type PermissionModule,
} from "../services/permissions";
import type { Permission } from "../ustils/type";

export function usePermissions() {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const refresh = () => setSession(getSession());
    window.addEventListener("storage", refresh);
    window.addEventListener("aerovista-session-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("aerovista-session-updated", refresh);
    };
  }, []);

  return {
    session,
    can: (permission: Permission) => hasPermission(session, permission),
    canRead: (module: PermissionModule) => canRead(session, module),
    canWrite: (module: PermissionModule) => canWrite(session, module),
  };
}
