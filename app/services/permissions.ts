import type { Permission, User } from "../ustils/type";

export const ALL_PERMISSIONS: Permission[] = [
  "DASHBOARD_READ",
  "BOOKINGS_READ",
  "BOOKINGS_WRITE",
  "PASSENGERS_READ",
  "PASSENGERS_WRITE",
  "FLIGHTS_READ",
  "FLIGHTS_WRITE",
  "AIRCRAFTS_READ",
  "AIRCRAFTS_WRITE",
  "AIRPORTS_READ",
  "AIRPORTS_WRITE",
  "ROUTES_READ",
  "ROUTES_WRITE",
  "USERS_READ",
  "USERS_WRITE",
  "ROLES_READ",
  "ROLES_WRITE",
];

const PASSENGER_PERMISSIONS: Permission[] = [
  "DASHBOARD_READ",
  "BOOKINGS_READ",
  "BOOKINGS_WRITE",
  "FLIGHTS_READ",
];

export type PermissionModule =
  | "DASHBOARD"
  | "BOOKINGS"
  | "PASSENGERS"
  | "FLIGHTS"
  | "AIRCRAFTS"
  | "AIRPORTS"
  | "ROUTES"
  | "USERS"
  | "ROLES";

export function moduleForPath(pathname: string): PermissionModule | null {
  if (pathname.startsWith("/pages/dashboard")) return "DASHBOARD";
  if (pathname.startsWith("/pages/book-flight")) return "BOOKINGS";
  if (pathname.startsWith("/pages/reservations")) return "BOOKINGS";
  if (pathname.startsWith("/pages/passengers")) return "PASSENGERS";
  if (pathname.startsWith("/pages/flights/aircraft")) return "AIRCRAFTS";
  if (pathname.startsWith("/pages/flights/airport")) return "AIRPORTS";
  if (pathname.startsWith("/pages/flights/route")) return "ROUTES";
  if (pathname.startsWith("/pages/flights")) return "FLIGHTS";
  if (pathname.startsWith("/pages/settings/user")) return "USERS";
  if (pathname.startsWith("/pages/settings/roles")) return "ROLES";
  return null;
}

export function permissionsForUser(
  user: Pick<User, "role" | "permissions"> | null,
) {
  if (!user) return [];
  // Real permissions assigned to the user's role always take priority over the
  // hardcoded Admin/Passenger defaults, which only apply when none were resolved.
  if (user.permissions?.length) return user.permissions;
  if (user.role === "Admin") return ALL_PERMISSIONS;
  return PASSENGER_PERMISSIONS;
}

export function hasPermission(
  user: Pick<User, "role" | "permissions"> | null,
  permission: Permission,
) {
  return permissionsForUser(user).includes(permission);
}

export function canRead(
  user: Pick<User, "role" | "permissions"> | null,
  module: PermissionModule,
) {
  return hasPermission(user, `${module}_READ` as Permission);
}

export function canWrite(
  user: Pick<User, "role" | "permissions"> | null,
  module: PermissionModule,
) {
  return hasPermission(user, `${module}_WRITE` as Permission);
}
