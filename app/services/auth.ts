import type { ApiSession, ApiUser } from "../ustils/type";
import { apiProxy } from "./base";

export type AuthenticatedApiUser = ApiUser & {
  authenticated?: boolean;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

export async function loginWithApi(
  email: string,
  password: string,
): Promise<AuthenticatedApiUser> {
  const payload = await apiProxy<
    | ApiUser
    | {
        user?: ApiUser;
        authenticated?: boolean;
        token?: string;
        refreshToken?: string;
        expiresIn?: number;
        tokenType?: string;
      }
  >("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (payload && typeof payload === "object" && "user" in payload) {
    return {
      ...(payload.user as ApiUser),
      authenticated: payload.authenticated,
      token: payload.token,
      refreshToken: payload.refreshToken,
      expiresIn: payload.expiresIn,
      tokenType: payload.tokenType,
    };
  }

  return payload as AuthenticatedApiUser;
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
