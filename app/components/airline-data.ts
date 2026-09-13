export type Module =
  | "Dashboard"
  | "Book flight"
  | "Reservations"
  | "Passengers"
  | "Flights"
  | "Settings"
  | "User"
  | "Roles";

export const flights = [
  {
    airline: "AeroVista",
    code: "AV 208",
    logo: "AV",
    departure: "08:45",
    arrival: "20:10",
    from: "JFK",
    to: "LHR",
    duration: "7h 25m",
    stops: "Nonstop",
    price: "$486",
    featured: true,
  },
  {
    airline: "Northstar Air",
    code: "NS 412",
    logo: "NS",
    departure: "11:20",
    arrival: "22:55",
    from: "JFK",
    to: "LHR",
    duration: "7h 35m",
    stops: "Nonstop",
    price: "$512",
  },
  {
    airline: "Skyline",
    code: "SK 90",
    logo: "SK",
    departure: "16:05",
    arrival: "08:30",
    from: "JFK",
    to: "LHR",
    duration: "10h 25m",
    stops: "1 stop",
    price: "$429",
  },
];

export const reservations = [
  {
    id: "AV-20481",
    passenger: "Sophia Martinez",
    route: "JFK → LHR",
    date: "18 Oct 2026",
    status: "Confirmed",
    amount: "$486",
  },
  {
    id: "AV-20480",
    passenger: "Daniel Kim",
    route: "LAX → NRT",
    date: "20 Oct 2026",
    status: "Pending",
    amount: "$1,120",
  },
  {
    id: "AV-20479",
    passenger: "Amelia Brown",
    route: "CDG → JFK",
    date: "21 Oct 2026",
    status: "Confirmed",
    amount: "$738",
  },
  {
    id: "AV-20478",
    passenger: "Liam Wilson",
    route: "SIN → LHR",
    date: "24 Oct 2026",
    status: "Cancelled",
    amount: "$654",
  },
];
