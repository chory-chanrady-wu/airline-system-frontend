# Safety Airline — Airline / Flight Booking System (Frontend)

A [Next.js](https://nextjs.org) (App Router) frontend for an airline flight booking and operations management system. It provides passenger-facing booking flows and an admin/staff operations console (dashboard, flight management, reservations, passengers, and role-based user administration), backed by a REST API and enriched with live flight radar, geocoding, and role-based access control (RBAC).

## Features

### Passenger features

- **Authentication** — email/password login against the backend API, session persisted in `localStorage`.
- **Book a flight** — search flights by route and date, pick an existing passenger or create a new one, and confirm a booking.
- **Reservations** — view, search, filter (status, date range), and sort your bookings; cancel/undo cancellation; print an airline-style boarding pass sized for ticket printing (not A4).
- **Profile** — view and manage the signed-in account.

### Operations / admin features

- **Dashboard** — key metrics and latest reservations.
- **Flight Management**
  - **Flight List** — create/update/delete flights, with automatic arrival time and duration calculated from the selected route.
  - **Aircraft** — manage the aircraft fleet (registration, model, seat capacity, active status).
  - **Airport** — manage airports with an interactive map picker (Leaflet) for coordinates.
  - **Route** — manage routes between airports; distance and duration are auto-calculated from airport coordinates (haversine formula).
  - **Schedule** — browse flights by route/date across a time window.
  - **Flight Radar** — live aircraft positions over the region via the OpenSky Network API, rendered on an interactive map.
- **Passengers** — manage passenger records and link them to user accounts.
- **Settings**
  - **Users** — create/update/delete user accounts and assign roles.
  - **Roles & Permissions** — define custom roles with granular `READ`/`WRITE` permissions per module (Dashboard, Bookings, Passengers, Flights, Aircrafts, Airports, Routes, Users, Roles).

### Platform features

- **Dynamic role-based access control (RBAC)** — permissions are fetched from the backend per role (not hardcoded) and drive:
  - Sidebar navigation visibility per module.
  - Page-level read access guards (redirects users without access).
  - Write guards on every create/update/delete action, with matching UI (buttons/menus are hidden when the user lacks permission).
- **Realtime refresh** — polling/SSE-based (`useRealtimeRefresh`, `/api/events`) live updates for data such as routes and bookings.
- **Geocoding** — server-side proxy routes for forward/reverse geocoding used by the airport location picker.
- **Themes** — light/dark/system theme toggle persisted in `localStorage`.
- **Backend API proxy** — all backend calls are routed through a same-origin Next.js API proxy so the browser never talks to the backend origin directly (avoids CORS and keeps the bearer token attached server-side).

## Tech stack

| Layer           | Technology                                               |
| --------------- | -------------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI              | React 19, Tailwind CSS 4                                 |
| Maps            | Leaflet / React-Leaflet                                  |
| Language        | TypeScript                                               |
| Lint            | ESLint 9 (`eslint-config-next`)                          |
| Package manager | pnpm                                                     |

## Project structure

```
app/
  api/                     Next.js route handlers (server-side)
    backend/[...path]/     Generic proxy to the backend REST API
    events/                Server-Sent Events endpoint for realtime refresh
    flights/radar/         Proxy to the OpenSky Network flight radar API
    geocode/                Forward geocoding proxy
    reverse-geocode/        Reverse geocoding proxy
  auth/                    Login page
  components/              Shared UI: shell/sidebar, tables, forms, icons, maps
  hooks/                   use-permissions, use-realtime-refresh
  pages/                   Application pages (dashboard, book-flight, reservations,
                           passengers, flights/*, settings/*, profile)
  services/                Typed API clients + business logic
    api.ts                 Barrel re-export of all service modules
    base.ts                 apiProxy() fetch wrapper, response unwrapping helpers
    auth.ts, users.ts, roles.ts, airports.ts, aircrafts.ts, flights.ts,
    bookings.ts, passengers.ts, routes.ts, analytics.ts, realtime.ts
    airline-system.ts       Session helpers, distance/duration calculations
    permissions.ts          RBAC permission model + canRead/canWrite helpers
  ustils/type.ts            Shared TypeScript types (domain + API DTOs)
```

## Getting started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (this project uses `pnpm-lock.yaml`)
- The backend REST API running locally (see [Backend integration](#backend-integration))

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other scripts

```bash
pnpm build   # Production build (Turbopack)
pnpm start   # Start the production server (after build)
pnpm lint    # Run ESLint
```

## Backend integration

The frontend does not call the backend origin directly from the browser. Instead, all backend requests go through the Next.js API proxy at `app/api/backend/[...path]/route.ts`, which forwards `GET`/`POST`/`PATCH`/`DELETE` requests to the backend REST API and passes through the `Authorization` and `Content-Type` headers.

- **Backend base URL**: currently configured as `http://localhost:8080/api/v1` in [app/api/backend/[...path]/route.ts](app/api/backend/[...path]/route.ts). Update this constant if your backend runs elsewhere.
- **Request flow**: `services/base.ts` → `apiProxy(path, init)` → `fetch("/api/backend" + path)` → Next.js proxy → backend API.
- **Auth token**: after login, the token returned by `/auth/login` is stored in `localStorage` (`aerovista-session-user-v1`) and automatically attached as a `Bearer` token on every proxied request.
- **Response envelope**: the backend is expected to respond with an envelope like `{ status, message, data }`; `unwrapApiData` / `unpackArrayResult` in `services/base.ts` normalize both wrapped (`{ data: { items: [...] } }`) and flat array responses.

### Expected backend endpoints (non-exhaustive)

| Domain     | Endpoints                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| Auth       | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/session`, `GET/PATCH /users/me` |
| Users      | `GET/POST /users`, `PATCH/DELETE /users/:id`                                                               |
| Roles      | `GET/POST /roles`, `GET/PATCH/DELETE /roles/:id` (each role has a `permissions: string[]` array)           |
| Airports   | `GET/POST /airports`, `PATCH/DELETE /airports/:code`                                                       |
| Aircraft   | `GET/POST /aircrafts`, `PATCH/DELETE /aircrafts/:id`                                                       |
| Routes     | `GET/POST /routes`, `PATCH/DELETE /routes/:from/:to`                                                       |
| Flights    | `GET/POST /flights`, `PATCH/DELETE /flights/:id`, `GET /flights/search`, `GET /flights/schedule`           |
| Bookings   | `GET/POST /bookings`, `PATCH/DELETE /bookings/:id`, cancel/undo endpoints                                  |
| Passengers | `GET/POST /passengers`, `DELETE /passengers/:id`                                                           |

### Third-party integrations

- **OpenSky Network** — `app/api/flights/radar/route.ts` proxies live aircraft state vectors for the flight radar map (no API key required for the public tier).
- **Geocoding** — `app/api/geocode/route.ts` and `app/api/reverse-geocode/route.ts` proxy forward/reverse geocoding lookups used by the airport location picker.

## Role-based access control (RBAC)

Permissions are modeled as `MODULE_READ` / `MODULE_WRITE` strings (e.g. `FLIGHTS_READ`, `BOOKINGS_WRITE`) across these modules: `DASHBOARD`, `BOOKINGS`, `PASSENGERS`, `FLIGHTS`, `AIRCRAFTS`, `AIRPORTS`, `ROUTES`, `USERS`, `ROLES`.

- On login, the resolved role's permission list is fetched from the backend (by `roleId`, falling back to a name match against `GET /roles`) and stored with the session.
- `services/permissions.ts` exposes `canRead(user, module)` / `canWrite(user, module)`; `hooks/use-permissions.ts` exposes the same as a React hook (`usePermissions()`), re-evaluating on session changes.
- `components/airline-system.tsx` (the app shell/sidebar) filters navigation items and redirects users away from pages/modules they can't read.
- Every management page (Flights, Aircraft, Airports, Routes, Passengers, Reservations, Users, Roles) hides create/edit/delete controls and blocks the underlying API calls when the current user lacks `WRITE` permission for that module.
- Roles and their permissions are configured from **Settings → Roles & permissions**.

> Note: RBAC in this app governs the UI. For full security, the backend API must also enforce the same permissions on every protected endpoint — the frontend guard is not a substitute for server-side authorization.

## Configuration notes

- No `.env` file is required for local development by default; the backend URL is currently hardcoded in the proxy route (see above). If you need per-environment backend URLs, extract `API_BASE_URL` in `app/api/backend/[...path]/route.ts` into an environment variable (e.g. `process.env.BACKEND_API_URL`).
- Session data (user, token, role, permissions) is stored in the browser's `localStorage` under `aerovista-session-user-v1`.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Leaflet](https://react-leaflet.js.org/)
- [OpenSky Network API](https://openskynetwork.github.io/opensky-api/)

## Deployment

This is a standard Next.js app and can be deployed to any platform that supports Node.js (e.g. [Vercel](https://vercel.com/new)). See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details. Ensure the deployed backend API is reachable from wherever the proxy route runs, and update the hardcoded backend URL accordingly.
