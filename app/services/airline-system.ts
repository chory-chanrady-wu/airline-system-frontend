export type Role = "Passenger" | "Admin";
export type BookingStatus = "Confirmed" | "Waitlisted" | "Cancelled";

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
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

type Snapshot = {
  users: User[];
  airports: Airport[];
  routes: Route[];
  flights: Flight[];
  bookings: Booking[];
  history: Booking[];
};

const SESSION_KEY = "aerovista-session-v1";
const SESSION_USER_KEY = "aerovista-session-user-v1";
export class HashTable<T> {
  private readonly buckets = new Map<string, T>();
  set(key: string, value: T) {
    this.buckets.set(key.toLowerCase(), value);
  }
  get(key: string) {
    return this.buckets.get(key.toLowerCase());
  }
  has(key: string) {
    return this.buckets.has(key.toLowerCase());
  }
  delete(key: string) {
    return this.buckets.delete(key.toLowerCase());
  }
  values() {
    return [...this.buckets.values()];
  }
}

export class Queue<T> {
  private items: T[] = [];
  enqueue(item: T) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  get length() {
    return this.items.length;
  }
  values() {
    return [...this.items];
  }
}

export class Stack<T> {
  private items: T[] = [];
  push(item: T) {
    this.items.push(item);
  }
  pop() {
    return this.items.pop();
  }
  get length() {
    return this.items.length;
  }
  values() {
    return [...this.items].reverse();
  }
}

class AvlNode<T> {
  constructor(
    public value: T,
    public key: number,
    public height = 1,
    public left: AvlNode<T> | null = null,
    public right: AvlNode<T> | null = null,
  ) {}
}
export class AvlTree<T> {
  private root: AvlNode<T> | null = null;
  private height(node: AvlNode<T> | null) {
    return node?.height ?? 0;
  }
  private rotateRight(y: AvlNode<T>) {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    return x;
  }
  private rotateLeft(x: AvlNode<T>) {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    return y;
  }
  private insertNode(
    node: AvlNode<T> | null,
    value: T,
    key: number,
  ): AvlNode<T> {
    if (!node) return new AvlNode(value, key);
    if (key < node.key) node.left = this.insertNode(node.left, value, key);
    else node.right = this.insertNode(node.right, value, key);
    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
    const balance = this.height(node.left) - this.height(node.right);
    if (balance > 1 && key < node.left!.key) return this.rotateRight(node);
    if (balance < -1 && key >= node.right!.key) return this.rotateLeft(node);
    if (balance > 1 && key >= node.left!.key) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }
    if (balance < -1 && key < node.right!.key) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }
    return node;
  }
  insert(value: T, key: number) {
    this.root = this.insertNode(this.root, value, key);
  }
  range(min: number, max: number) {
    const result: T[] = [];
    const visit = (node: AvlNode<T> | null) => {
      if (!node) return;
      if (node.key >= min) visit(node.left);
      if (node.key >= min && node.key <= max) result.push(node.value);
      if (node.key <= max) visit(node.right);
    };
    visit(this.root);
    return result;
  }
}

export class RouteGraph {
  private readonly edges = new Map<string, Map<string, number>>();
  addVertex(code: string) {
    if (!this.edges.has(code)) this.edges.set(code, new Map());
  }
  addEdge(from: string, to: string, weight: number) {
    this.addVertex(from);
    this.addVertex(to);
    this.edges.get(from)!.set(to, weight);
  }
  removeVertex(code: string) {
    this.edges.delete(code);
    for (const edges of this.edges.values()) edges.delete(code);
  }
  removeEdge(from: string, to: string) {
    this.edges.get(from)?.delete(to);
  }
  shortestPath(
    start: string,
    end: string,
    weight: (from: string, to: string, edge: number) => number = (
      _,
      __,
      edge,
    ) => edge,
  ) {
    const distance = new Map<string, number>();
    const previous = new Map<string, string>();
    const pending = new Set(this.edges.keys());
    for (const vertex of pending) distance.set(vertex, Infinity);
    distance.set(start, 0);
    while (pending.size) {
      const current = [...pending].sort(
        (a, b) => distance.get(a)! - distance.get(b)!,
      )[0];
      pending.delete(current);
      if (current === end || distance.get(current) === Infinity) break;
      for (const [next, edge] of this.edges.get(current) ?? []) {
        const candidate = distance.get(current)! + weight(current, next, edge);
        if (candidate < (distance.get(next) ?? Infinity)) {
          distance.set(next, candidate);
          previous.set(next, current);
        }
      }
    }
    if (!distance.has(end) || distance.get(end) === Infinity) return null;
    const path: string[] = [];
    for (
      let current: string | undefined = end;
      current;
      current = previous.get(current)
    )
      path.unshift(current);
    return {
      path,
      cost: distance.get(end)!,
      stops: Math.max(0, path.length - 2),
    };
  }
  fewestStops(start: string, end: string) {
    const queue = [start];
    const previous = new Map<string, string>();
    const visited = new Set([start]);
    while (queue.length) {
      const current = queue.shift()!;
      if (current === end) break;
      for (const next of this.edges.get(current)?.keys() ?? [])
        if (!visited.has(next)) {
          visited.add(next);
          previous.set(next, current);
          queue.push(next);
        }
    }
    if (!visited.has(end)) return null;
    const path: string[] = [];
    for (
      let current: string | undefined = end;
      current;
      current = previous.get(current)
    )
      path.unshift(current);
    return { path, cost: path.length - 1, stops: Math.max(0, path.length - 2) };
  }
}

export function loadState(): Snapshot {
  return {
    users: [],
    airports: [],
    routes: [],
    flights: [],
    bookings: [],
    history: [],
  };
}

export function calculateDistance(
  from: string,
  to: string,
  airports = loadState().airports,
) {
  const origin = airports.find((airport) => airport.code === from);
  const destination = airports.find((airport) => airport.code === to);
  if (
    origin?.latitude === undefined ||
    origin.longitude === undefined ||
    destination?.latitude === undefined ||
    destination.longitude === undefined
  )
    return null;
  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const latitudeA = toRadians(origin.latitude);
  const latitudeB = toRadians(destination.latitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDelta / 2) ** 2;
  return Math.round(
    2 * earthRadiusKm * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)),
  );
}
export function saveState(state: Snapshot) {
  void state;
}
export function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<User> & {
      user?: Partial<User>;
      token?: string;
      authenticated?: boolean;
      status?: string;
    };
    const session =
      parsed.user && typeof parsed.user === "object" ? parsed.user : parsed;

    const safeSession = {
      ...(session ?? {}),
    };
    delete safeSession.password;

    if (!safeSession || !safeSession.email) return null;

    const role =
      safeSession.role === "Admin" || safeSession.role === "Passenger"
        ? safeSession.role
        : "Passenger";

    return {
      id: String(safeSession.id ?? ""),
      name: safeSession.name ?? "",
      email: safeSession.email,
      password: "",
      role,
      token:
        typeof safeSession.token === "string"
          ? safeSession.token
          : typeof parsed.token === "string"
            ? parsed.token
            : undefined,
      authenticated:
        safeSession.authenticated ??
        parsed.authenticated ??
        Boolean(safeSession.token || parsed.token),
      status: safeSession.status ?? parsed.status ?? "Active",
    } as User;
  } catch {
    return null;
  }
}

export function isAuthenticatedSession() {
  const session = getSession();
  return Boolean(
    session &&
    (session.authenticated !== false || session.token || session.email),
  );
}

export function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(SESSION_USER_KEY);
    window.localStorage.removeItem("aerovista-airline-state-v1");
  }
}

export function register(
  name: string,
  email: string,
  password: string,
  role: Role,
): User {
  const state = loadState();
  const users = new HashTable<User>();
  state.users.forEach((user) => users.set(user.email, user));
  if (users.has(email))
    throw new Error("An account with that email already exists.");
  if (password.length < 6)
    throw new Error("Password must contain at least 6 characters.");
  const user = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
  };
  state.users.push(user);
  saveState(state);
  return user;
}

export function removePassenger(id: string) {
  const state = loadState();
  const passenger = state.users.find(
    (user) => user.id === id && user.role === "Passenger",
  );
  if (!passenger) throw new Error("Passenger not found.");
  if (state.bookings.some((booking) => booking.passengerId === id))
    throw new Error("Passengers with booking history cannot be removed.");
  state.users = state.users.filter((user) => user.id !== id);
  saveState(state);
}
export function login(email: string, password: string): User {
  const user = new HashTable<User>();
  loadState().users.forEach((item) => user.set(item.email, item));
  const match = user.get(email);
  if (!match || match.password !== password)
    throw new Error("Invalid email or password.");
  if (typeof window !== "undefined")
    window.localStorage.setItem(SESSION_KEY, match.id);
  return match;
}

export function buildFlightIndexes(
  flights = loadState().flights,
): FlightIndexes {
  const byId = new HashTable<Flight>();
  const byDeparture = new AvlTree<Flight>();
  flights.forEach((flight) => {
    byId.set(flight.id, flight);
    byDeparture.insert(flight, new Date(flight.departureTime).getTime());
  });
  return { byId, byDeparture };
}

export function rebuildStructures(state = loadState()) {
  const users = new HashTable<User>();
  state.users.forEach((user) => users.set(user.id, user));
  const graph = new RouteGraph();
  state.airports.forEach((airport) => graph.addVertex(airport.code));
  state.routes.forEach((route) =>
    graph.addEdge(route.from, route.to, route.distance),
  );
  const waitlists = new Map<string, Queue<Booking>>();
  state.bookings
    .filter((booking) => booking.status === "Waitlisted")
    .forEach((booking) => {
      const queue = waitlists.get(booking.flightId) ?? new Queue<Booking>();
      queue.enqueue(booking);
      waitlists.set(booking.flightId, queue);
    });
  const history = new Stack<Booking>();
  state.history.forEach((booking) => history.push(booking));
  return {
    users,
    flights: buildFlightIndexes(state.flights),
    graph,
    waitlists,
    history,
  };
}

function graphFor(state: Snapshot) {
  const graph = new RouteGraph();
  state.airports.forEach((airport) => graph.addVertex(airport.code));
  state.routes.forEach((route) =>
    graph.addEdge(route.from, route.to, route.distance),
  );
  return graph;
}
export function searchFlights(
  from: string,
  to: string,
  date: string,
  minTime = 0,
  maxTime = 24 * 60,
) {
  const tree = new AvlTree<Flight>();
  const state = loadState();
  state.flights
    .filter((flight) => flight.from === from && flight.to === to)
    .forEach((flight) =>
      tree.insert(flight, new Date(flight.departureTime).getTime()),
    );
  const start = new Date(`${date}T00:00:00`).getTime();
  const end = new Date(`${date}T23:59:59`).getTime();
  return tree.range(start, end).filter((flight) => {
    const [hours, minutes] = flight.departure.split(":").map(Number);
    const value = hours * 60 + minutes;
    return value >= minTime && value <= maxTime;
  });
}
export function findFlight(id: string) {
  return buildFlightIndexes().byId.get(id);
}

export function browseFlightsByDepartureWindow(
  from: string,
  to: string,
  date: string,
  startTime = "00:00",
  endTime = "23:59",
) {
  const indexes = buildFlightIndexes();
  const start = new Date(`${date}T${startTime}:00`).getTime();
  const end = new Date(`${date}T${endTime}:00`).getTime();
  return indexes.byDeparture
    .range(start, end)
    .filter((flight) => flight.from === from && flight.to === to);
}
export function routeOptions(from: string, to: string) {
  const state = loadState();
  const graph = graphFor(state);
  return {
    cheapest: graph.shortestPath(
      from,
      to,
      (current, next, distance) =>
        state.flights.find(
          (flight) => flight.from === current && flight.to === next,
        )?.price ?? distance,
    ),
    fastest: graph.shortestPath(from, to, (_, next) => {
      const flight = state.flights.find(
        (item) => item.from === _ && item.to === next,
      );
      return flight
        ? new Date(flight.arrivalTime).getTime() -
            new Date(flight.departureTime).getTime()
        : 1e9;
    }),
    fewestStops: graph.fewestStops(from, to),
  };
}

function itineraryFromPath(
  path: string[],
  algorithm: Itinerary["algorithm"],
): Itinerary | null {
  if (path.length < 2) return null;
  const flights = loadState().flights;
  const legs = path.slice(0, -1).map((from, index) => {
    const next = path[index + 1];
    return flights.find((flight) => flight.from === from && flight.to === next);
  });
  if (legs.some((flight) => !flight)) return null;
  const validLegs = legs as Flight[];
  const departure = new Date(validLegs[0].departureTime).getTime();
  const arrival = new Date(
    validLegs[validLegs.length - 1].arrivalTime,
  ).getTime();
  return {
    path,
    route: path.join(" → "),
    layovers: path.slice(1, -1),
    price: validLegs.reduce((total, flight) => total + flight.price, 0),
    durationMinutes: Math.max(0, Math.round((arrival - departure) / 60000)),
    stops: Math.max(0, path.length - 2),
    algorithm,
  };
}

export function findItineraries(from: string, to: string) {
  const options = routeOptions(from, to);
  return {
    cheapest: options.cheapest
      ? itineraryFromPath(options.cheapest.path, "Dijkstra (price)")
      : null,
    fastest: options.fastest
      ? itineraryFromPath(options.fastest.path, "Dijkstra (duration)")
      : null,
    fewestStops: options.fewestStops
      ? itineraryFromPath(options.fewestStops.path, "BFS")
      : null,
  };
}

export function bookFlight(flightId: string, passenger: User): Booking {
  const state = loadState();
  const flight = state.flights.find((item) => item.id === flightId);
  if (!flight) throw new Error("Flight not found.");
  const waitlist = new Queue<Booking>();
  state.bookings
    .filter(
      (booking) =>
        booking.flightId === flightId && booking.status === "Waitlisted",
    )
    .forEach((booking) => waitlist.enqueue(booking));
  const isAvailable = flight.seatsAvailable > 0;
  const booking: Booking = {
    id: `AV-${Date.now().toString().slice(-6)}`,
    passengerId: passenger.id,
    passenger: passenger.name,
    flightId,
    route: `${flight.from} → ${flight.to}`,
    date: flight.departureTime.slice(0, 10),
    status: isAvailable ? "Confirmed" : "Waitlisted",
    amount: flight.price,
    waitlistPosition: isAvailable ? undefined : waitlist.length + 1,
  };
  if (isAvailable) flight.seatsAvailable -= 1;
  state.bookings.push(booking);
  state.history.push(booking);
  saveState(state);
  return booking;
}
export function cancelBooking(bookingId: string, passengerId?: string) {
  const state = loadState();
  const booking = state.bookings.find(
    (item) =>
      item.id === bookingId &&
      (!passengerId || item.passengerId === passengerId),
  );
  if (!booking || booking.status === "Cancelled")
    throw new Error("Booking not found or already cancelled.");
  const previousStatus = booking.status;
  booking.status = "Cancelled";
  const flight = state.flights.find((item) => item.id === booking.flightId);
  if (flight && previousStatus === "Confirmed") {
    const waitlist = new Queue<Booking>();
    state.bookings
      .filter(
        (item) =>
          item.flightId === booking.flightId && item.status === "Waitlisted",
      )
      .forEach((item) => waitlist.enqueue(item));
    const next = waitlist.dequeue();
    if (next) {
      next.status = "Confirmed";
      next.waitlistPosition = undefined;
    } else {
      flight.seatsAvailable = Math.min(
        flight.capacity,
        flight.seatsAvailable + 1,
      );
    }
    waitlist.values().forEach((item, index) => {
      item.waitlistPosition = index + 1;
    });
  } else if (previousStatus === "Waitlisted") {
    const remaining = new Queue<Booking>();
    state.bookings
      .filter(
        (item) =>
          item.flightId === booking.flightId && item.status === "Waitlisted",
      )
      .forEach((item) => remaining.enqueue(item));
    remaining.values().forEach((item, index) => {
      item.waitlistPosition = index + 1;
    });
  }
  state.history.push(booking);
  saveState(state);
  return booking;
}
export function undoLastAction(passengerId: string) {
  const state = loadState();
  const history = new Stack<Booking>();
  state.history
    .filter((item) => item.passengerId === passengerId)
    .forEach((item) => history.push(item));
  const last = history.pop();
  if (!last) return null;
  const booking = state.bookings.find((item) => item.id === last.id);
  if (!booking) return null;
  booking.status = booking.status === "Cancelled" ? "Confirmed" : "Cancelled";
  saveState(state);
  return booking;
}

export function addAirport(airport: Airport) {
  const state = loadState();
  if (state.airports.some((item) => item.code === airport.code))
    throw new Error("Airport code already exists.");
  state.airports.push(airport);
  saveState(state);
}
export function updateAirport(code: string, update: Airport) {
  const state = loadState();
  const airport = state.airports.find((item) => item.code === code);
  if (!airport) throw new Error("Airport not found.");
  if (
    update.code !== code &&
    state.airports.some((item) => item.code === update.code)
  )
    throw new Error("Airport code already exists.");
  Object.assign(airport, update);
  state.routes = state.routes.map((route) => ({
    ...route,
    from: route.from === code ? update.code : route.from,
    to: route.to === code ? update.code : route.to,
  }));
  saveState(state);
}
export function removeAirport(code: string) {
  const state = loadState();
  state.airports = state.airports.filter((item) => item.code !== code);
  state.routes = state.routes.filter(
    (item) => item.from !== code && item.to !== code,
  );
  saveState(state);
}
export function addRoute(route: Route) {
  const state = loadState();
  if (
    !state.airports.some((airport) => airport.code === route.from) ||
    !state.airports.some((airport) => airport.code === route.to)
  )
    throw new Error("Both route endpoints must be existing airports.");
  if (
    state.routes.some(
      (item) => item.from === route.from && item.to === route.to,
    )
  )
    throw new Error("Route already exists.");
  const distance = calculateDistance(route.from, route.to, state.airports);
  if (distance === null || distance === 0)
    throw new Error("Both airports need latitude and longitude coordinates.");
  state.routes.push({ ...route, distance });
  saveState(state);
}
export function updateRoute(from: string, to: string, update: Route) {
  const state = loadState();
  const route = state.routes.find(
    (item) => item.from === from && item.to === to,
  );
  if (!route) throw new Error("Route not found.");
  if (
    (update.from !== from || update.to !== to) &&
    state.routes.some(
      (item) => item.from === update.from && item.to === update.to,
    )
  )
    throw new Error("Route already exists.");
  const distance = calculateDistance(update.from, update.to, state.airports);
  if (distance === null || distance === 0)
    throw new Error("Both airports need latitude and longitude coordinates.");
  Object.assign(route, { ...update, distance });
  saveState(state);
}
export function removeRoute(from: string, to: string) {
  const state = loadState();
  state.routes = state.routes.filter(
    (item) => !(item.from === from && item.to === to),
  );
  saveState(state);
}
export function saveFlight(flight: Flight) {
  const state = loadState();
  if (new Date(flight.departureTime) <= new Date())
    throw new Error("Flight departure must be in the future.");
  if (flight.price < 0 || flight.capacity <= 0)
    throw new Error("Price and capacity must be valid positive values.");
  if (!flight.id.trim()) throw new Error("Flight ID is required.");
  const duplicate = state.flights.find((item) => item.id === flight.id);
  if (duplicate) Object.assign(duplicate, flight);
  else state.flights.push(flight);
  saveState(state);
}
export function removeFlight(id: string) {
  const state = loadState();
  state.flights = state.flights.filter((flight) => flight.id !== id);
  saveState(state);
}
export function systemStats() {
  const state = loadState();
  const totalCapacity = state.flights.reduce(
    (sum, flight) => sum + flight.capacity,
    0,
  );
  const availableSeats = state.flights.reduce(
    (sum, flight) => sum + flight.seatsAvailable,
    0,
  );
  const confirmedBookings = state.bookings.filter(
    (booking) => booking.status === "Confirmed",
  );
  const cancelledBookings = state.bookings.filter(
    (booking) => booking.status === "Cancelled",
  );
  const loadByRoute = state.routes.map((route) => {
    const flights = state.flights.filter(
      (flight) => flight.from === route.from && flight.to === route.to,
    );
    const capacity = flights.reduce((sum, flight) => sum + flight.capacity, 0);
    const available = flights.reduce(
      (sum, flight) => sum + flight.seatsAvailable,
      0,
    );
    return {
      route: `${route.from} → ${route.to}`,
      flights: flights.length,
      capacity,
      availableSeats: available,
      occupiedSeats: capacity - available,
      loadFactor: capacity
        ? Math.round(((capacity - available) / capacity) * 100)
        : 0,
    };
  });
  return {
    totalAirports: state.airports.length,
    totalRoutes: state.routes.length,
    totalFlights: state.flights.length,
    bookings: state.bookings.length,
    confirmedBookings: confirmedBookings.length,
    cancelledBookings: cancelledBookings.length,
    waitlists: state.bookings.filter(
      (booking) => booking.status === "Waitlisted",
    ).length,
    totalCapacity,
    availableSeats,
    occupiedSeats: totalCapacity - availableSeats,
    overallLoadFactor: totalCapacity
      ? Math.round(((totalCapacity - availableSeats) / totalCapacity) * 100)
      : 0,
    averageFare: state.flights.length
      ? Math.round(
          state.flights.reduce((sum, flight) => sum + flight.price, 0) /
            state.flights.length,
        )
      : 0,
    confirmedRevenue: confirmedBookings.reduce(
      (sum, booking) => sum + booking.amount,
      0,
    ),
    recentBookings: state.bookings.slice(-5).reverse(),
    bookingActivity: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (label, day) => ({
        label,
        count: state.bookings.filter(
          (booking) => new Date(booking.date).getDay() === (day + 1) % 7,
        ).length,
      }),
    ),
    scheduledFlights: state.flights.map((flight) => ({
      id: flight.id,
      airline: flight.airline,
      route: `${flight.from} → ${flight.to}`,
      departure: flight.departure,
      arrival: flight.arrival,
      seatsAvailable: flight.seatsAvailable,
      capacity: flight.capacity,
    })),
    loadByRoute,
  };
}
export function benchmarkStructures() {
  const sizes = [100, 1000, 5000];
  return sizes.map((size) => {
    const hashStart = performance.now();
    const hash = new HashTable<number>();
    for (let i = 0; i < size; i++) hash.set(String(i), i);
    hash.get(String(size - 1));
    const hashTime = performance.now() - hashStart;
    const queueStart = performance.now();
    const queue = new Queue<number>();
    for (let i = 0; i < size; i++) queue.enqueue(i);
    queue.dequeue();
    const queueTime = performance.now() - queueStart;
    const avlStart = performance.now();
    const avl = new AvlTree<number>();
    for (let i = 0; i < size; i++) avl.insert(i, i);
    avl.range(0, size - 1);
    const avlTime = performance.now() - avlStart;
    const graphStart = performance.now();
    const graph = new RouteGraph();
    for (let i = 0; i < size; i++) graph.addEdge(String(i), String(i + 1), 1);
    graph.shortestPath("0", String(size));
    const graphTime = performance.now() - graphStart;
    const stackStart = performance.now();
    const stack = new Stack<number>();
    for (let i = 0; i < size; i++) stack.push(i);
    stack.pop();
    const stackTime = performance.now() - stackStart;
    return {
      size,
      hashTime: Number(hashTime.toFixed(3)),
      queueTime: Number(queueTime.toFixed(3)),
      avlTime: Number(avlTime.toFixed(3)),
      graphTime: Number(graphTime.toFixed(3)),
      stackTime: Number(stackTime.toFixed(3)),
      hashBigO: "O(1) avg",
      queueBigO: "O(1) enqueue/dequeue",
      avlBigO: "O(log n) insert / O(k + log n) range",
      graphBigO: "O((V + E) log V) Dijkstra",
      stackBigO: "O(1) push/pop",
    };
  });
}

export function displayPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
export function toFlightCard(flight: Flight) {
  const departure = new Date(flight.departureTime);
  const arrival = new Date(flight.arrivalTime);
  const durationMinutes = Math.max(
    0,
    Math.round((arrival.getTime() - departure.getTime()) / 60000),
  );
  return {
    ...flight,
    code: flight.id.replace("-", " "),
    price: displayPrice(flight.price),
    duration: `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
    stops: "Nonstop",
    departureDateTime: flight.departureTime.replace("T", " "),
    arrivalDateTime: flight.arrivalTime.replace("T", " "),
    seats: `${flight.seatsAvailable}/${flight.capacity} seats`,
  };
}
