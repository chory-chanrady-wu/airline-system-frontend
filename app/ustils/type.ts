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

export type ApiFlight = {
  id?: string | number;
  flightId?: string | number;
  flightNumber?: string;
  airlineId?: string | number;
  aircraftId?: string | number;
  routeId?: string | number;
  fromAirportCode?: string;
  toAirportCode?: string;
  airline?: string;
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
  bookingReference?: string;
  passengerId?: string | number;
  passengerName?: string;
  flightId?: string | number;
  flightNumber?: string;
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
