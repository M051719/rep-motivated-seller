// src/tests/setup/apiMocks.ts
import { vi } from "vitest";

export function setupAPIsMocks() {
  // Mock global fetch for external APIs
  global.fetch = vi.fn((url: string | URL, options?: RequestInit) => {
    const urlString = url.toString();
    const method = options?.method || "GET";

    // Census API Mock
    if (urlString.includes("api.census.gov")) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          ["NAME", "B25001_001E", "B25003_002E", "B25003_003E"],
          ["Mock County", "1000", "600", "400"],
        ],
      } as Response);
    }

    // Crime Data API Mock
    if (urlString.includes("crime")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          crimeRate: 25,
          incidents: [],
          safetyScore: 75,
        }),
      } as Response);
    }

    // Walkability Score Mock
    if (urlString.includes("walkscore")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          walkscore: 80,
          transit_score: 70,
          bike_score: 65,
        }),
      } as Response);
    }

    // Google Maps Mock
    if (urlString.includes("maps.googleapis.com")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          results: [
            {
              place_id: "mock_place_id",
              geometry: { location: { lat: 34.0522, lng: -118.2437 } },
              formatted_address: "123 Mock St, Los Angeles, CA 90001",
            },
          ],
          status: "OK",
        }),
      } as Response);
    }

    // OpenStreetMap Mock
    if (urlString.includes("openstreetmap.org")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          elements: [
            { type: "node", tags: { amenity: "school", name: "Mock School" } },
            { type: "node", tags: { amenity: "park", name: "Mock Park" } },
          ],
        }),
      } as Response);
    }

    // HubSpot API Mock
    if (urlString.includes("api.hubapi.com")) {
      if (urlString.includes("/account-info")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            portalId: "12345",
            accountName: "Mock Account",
          }),
        } as Response);
      }

      if (urlString.includes("/contacts")) {
        if (method === "POST") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: "mock_contact_id",
              properties: {},
            }),
          } as Response);
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({
            results: [
              { id: "1", properties: { email: "mock1@example.com" } },
              { id: "2", properties: { email: "mock2@example.com" } },
            ],
          }),
        } as Response);
      }
    }

    // County GIS API Mocks
    if (urlString.includes("arcgis") || urlString.includes("gis")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          features: [
            {
              attributes: {
                APN: "1234-567-890",
                OWNER_NAME: "Mock Owner",
                SITUS_ADDR: "123 Mock St",
                ASSESSED_VALUE: 500000,
                LAND_USE: "Residential",
              },
            },
          ],
        }),
      } as Response);
    }

    // Default fallback
    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ error: "Not mocked" }),
    } as Response);
  }) as any;
}

export function resetAPIMocks() {
  vi.restoreAllMocks();
}
