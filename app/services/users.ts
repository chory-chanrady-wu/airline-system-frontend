import type { ApiUser } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

export async function fetchUsersFromApi(search?: string) {
  const query = search ? `?${new URLSearchParams({ search })}` : "";
  const result = await apiProxy<unknown>(`/users${query}`, { method: "GET" });
  return unpackArrayResult<ApiUser>(result);
}

export async function createUserWithApi(payload: Record<string, unknown>) {
  return apiProxy<unknown>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchUserByIdFromApi(userId: string | number) {
  return apiProxy<unknown>(`/users/${encodeURIComponent(userId)}`, {
    method: "GET",
  });
}

export async function updateUserWithApi(
  userId: string | number,
  payload: Record<string, unknown>,
) {
  return apiProxy<unknown>(`/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUserWithApi(userId: string | number) {
  return apiProxy<unknown>(`/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
  });
}
