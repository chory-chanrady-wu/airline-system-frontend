import type { AvlTree, HashTable } from "../services/airline-system";

export type Role = string;
export type Permission =
  | "DASHBOARD_READ"
  | "BOOKINGS_READ"
  | "BOOKINGS_WRITE"
  | "PASSENGERS_READ"
  | "PASSENGERS_WRITE"
  | "FLIGHTS_READ"
  | "FLIGHTS_WRITE"
  | "AIRCRAFTS_READ"
  | "AIRCRAFTS_WRITE"
  | "AIRPORTS_READ"
  | "AIRPORTS_WRITE"
  | "ROUTES_READ"
  | "ROUTES_WRITE"
  | "USERS_READ"
  | "USERS_WRITE"
  | "ROLES_READ"
  | "ROLES_WRITE";
export type BookingStatus = "Confirmed" | "Waitlisted" | "Cancelled";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  permissions?: string[];
  token?: string;
  authenticated?: boolean;
  status?: string;
};

export type Airport = {
  code: string;
  city: string;
  latitude?: number;
  longitude?: number;
};

export type Route = {
  id?: string | number;
  from: string;
  to: string;
  distance: number;
  durationMinutes?: number;
};

export type Flight = {
  id: string;
  flightNumber?: string;
  databaseId?: string;
  aircraftId?: string;
  airline: string;
  logo: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  capacity: number;
  seatsAvailable: number;
  status?: string;
};

export type Booking = {
  id: string;
  passengerId: string;
  passenger: string;
  flightId: string;
  route: string;
  date: string;
  status: BookingStatus;
  amount: number;
  waitlistPosition?: number;
};

export type FlightIndexes = {
  byId: HashTable<Flight>;
  byDeparture: AvlTree<Flight>;
};

export type Itinerary = {
  path: string[];
  route: string;
  layovers: string[];
  price: number;
  durationMinutes: number;
  stops: number;
  algorithm: "Dijkstra (price)" | "Dijkstra (duration)" | "BFS";
};

export type Snapshot = {
  users: User[];
  airports: Airport[];
  routes: Route[];
  flights: Flight[];
  bookings: Booking[];
  history: Booking[];
};

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

export type ApiUser = {
  id?: string | number;
  name?: string;
  email?: string;
  roleId?: string | number;
  role?: string;
  roleName?: string;
  permissions?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  password?: string;
};

export type ApiRole = {
  id?: string | number;
  name?: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ApiAirlineRef = {
  id?: string | number;
  name?: string;
};

export type ApiAirportRef = {
  code?: string;
  city?: string;
  country?: string;
  timezone?: string;
};

export type ApiFlight = {
  id?: string | number;
  flightId?: string | number;
  flightNumber?: string;
  airlineId?: string | number;
  aircraftId?: string | number;
  routeId?: string | number;
  fromAirportCode?: string;
  toAirportCode?: string;
  airline?: string | ApiAirlineRef;
  airlineCode?: string;
  fromAirport?: ApiAirportRef;
  toAirport?: ApiAirportRef;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  departure?: string;
  arrival?: string;
  price?: number;
  seatCapacity?: number;
  seatsAvailable?: number;
  capacity?: number;
  status?: string;
};

export type ApiAircraft = {
  id?: string | number;
  registrationNumber?: string;
  model?: string;
  seatCapacity?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiAirport = {
  code?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiRoute = {
  id?: string | number;
  from?: string;
  to?: string;
  fromAirportCode?: string;
  toAirportCode?: string;
  distance?: number;
  distanceKm?: number;
  durationMinutes?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiBooking = {
  id?: string | number;
  bookingId?: string | number;
  bookingReference?: string;
  passengerId?: string | number;
  passengerName?: string;
  flightId?: string | number;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  seatNumber?: string;
  amount?: number;
  currency?: string;
  status?: string;
  bookedAt?: string;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiPassenger = {
  id?: string | number;
  userId?: string | number;
  fullName?: string;
  userName?: string;
  userEmail?: string;
  passportNumber?: string;
  nationality?: string;
  phone?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiSession = {
  authenticated?: boolean;
  user?: ApiUser;
  token?: string;
};
