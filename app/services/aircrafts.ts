import type { ApiAircraft } from "../ustils/type";
import { apiProxy, unpackArrayResult } from "./base";

export async function fetchAircraftsFromApi() {
  const result = await apiProxy<unknown>("/aircraft", { method: "GET" });
  return unpackArrayResult<ApiAircraft>(result);
}

export async function createAircraftWithApi(payload: {
  registrationNumber: string;
  model: string;
  seatCapacity: number;
  active: boolean;
}) {
  return apiProxy<unknown>("/aircraft", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
