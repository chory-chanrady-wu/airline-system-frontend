import type { ApiRole } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

export async function fetchRolesFromApi() {
  const result = await apiProxy<unknown>("/roles", { method: "GET" });
  return unpackArrayResult<ApiRole>(result);
}

export async function createRoleWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRoleWithApi(
  roleId: string | number,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(`/roles/${encodeURIComponent(roleId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteRoleWithApi(roleId: string | number) {
  return apiProxy<unknown>(`/roles/${encodeURIComponent(roleId)}`, {
    method: "DELETE",
  });
}

export async function fetchRoleByIdFromApi(roleId: string | number) {
  return apiProxy<unknown>(`/roles/${encodeURIComponent(roleId)}`, {
    method: "GET",
  });
}
