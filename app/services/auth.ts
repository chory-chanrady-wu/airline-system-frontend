import type { ApiSession, ApiUser } from "../ustils/type";
import { apiProxy } from "./base";

export async function loginWithApi(email: string, password: string) {
  return apiProxy<ApiUser | { user?: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).then((payload) => {
    if (payload && typeof payload === "object" && "user" in payload) {
      return payload.user as ApiUser;
    }
    return payload as ApiUser;
  });
}

export async function registerWithApi(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiProxy<ApiSession>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logoutWithApi() {
  return apiProxy<{ authenticated?: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export async function fetchSessionFromApi() {
  return apiProxy<ApiSession>("/auth/session", { method: "GET" });
}

export async function fetchCurrentUserFromApi() {
  const result = await apiProxy<{ user?: ApiUser } | ApiUser>("/users/me", {
    method: "GET",
  });
  return "user" in result ? result.user : result;
}

export async function updateCurrentUserWithApi(
  payload: Record<string, unknown>,
) {
  return apiProxy<{ user?: ApiUser } | ApiUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function changePasswordWithApi(
  currentPassword: string,
  newPassword: string,
) {
  return apiProxy<unknown>("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
