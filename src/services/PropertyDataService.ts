// src/services/PropertyDataService.ts
class PropertyDataService {
  // 1. FREE: Use Zillow's public data (web scraping)
  async getZillowData(address: string) {
    // Note: Zillow doesn't have a public API anymore
    // You'll need to use a scraping service or alternative

    // Alternative: RentBerry, Realty Mole API
    const response = await fetch(
      `https://realty-mole-property-api.p.rapidapi.com/properties`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "your-key", // $50/month
          "X-RapidAPI-Host": "realty-mole-property-api.p.rapidapi.com",
        },
        body: JSON.stringify({ address }),
      },
    );

    return response.json();
  }

  // 2. AFFORDABLE: Attom Data API ($99/month starter)
  async getAttomData(address: string) {
    const response = await fetch(
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail?address=${encodeURIComponent(address)}`,
      {
        headers: {
          apikey: process.env.VITE_ATTOM_API_KEY!,
          Accept: "application/json",
        },
      },
    );

    return response.json();
  }

  // 3. COUNTY RECORDS: Direct county data (FREE but limited)
  async getCountyRecords(address: string, county: string, state: string) {
    // Many counties provide free public APIs
    // Example: LA County, Cook County, etc.

    const countyAPIs: Record<string, string> = {
      "los-angeles-ca": "https://data.lacounty.gov/resource/9trm-uz8i.json",
      "cook-il": "https://datacatalog.cookcountyil.gov/resource/5pge-nu6u.json",
      "miami-dade-fl": "https://www.miamidade.gov/information/library/api/",
      // Add more counties as needed
    };

    const apiUrl = countyAPIs[`${county.toLowerCase()}-${state.toLowerCase()}`];
    if (!apiUrl) throw new Error("County API not available");

    const response = await fetch(
      `${apiUrl}?address=${encodeURIComponent(address)}`,
    );
    return response.json();
  }

  // 4. MLS DATA: Through Rentspree or similar
  async getMLSData(address: string) {
    const response = await fetch("https://api.rentspree.com/properties/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VITE_RENTSPREE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    });

    return response.json();
  }

  // 5. FORECLOSURE DATA: PropertyRadar or RealtyTrac
  async getForeclosureData(address: string) {
    const response = await fetch(
      `https://api.propertyradar.com/v1/properties?address=${encodeURIComponent(address)}&include_foreclosure=true`,
      {
        headers: {
          "X-API-Key": process.env.VITE_PROPERTYRADAR_API_KEY!,
        },
      },
    );

    return response.json();
  }

  // 6. FREE ALTERNATIVE: Combine multiple free sources
  async getPropertyDataFree(address: string) {
    const results = {
      googleMaps: await this.getGoogleMapsData(address),
      openStreetMap: await this.getOpenStreetMapData(address),
      census: await this.getCensusData(address),
      publicRecords: await this.searchPublicRecords(address),
    };

    return this.mergePropertyData(results);
  }

  // Google Maps API (free tier: 28,000 requests/month)
  private async getGoogleMapsData(address: string) {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.results?.[0]) {
      const placeId = data.results[0].place_id;

      // Get additional details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      const details = await detailsResponse.json();

      return {
        formatted_address: data.results[0].formatted_address,
        coordinates: data.results[0].geometry.location,
        place_details: details.result,
      };
    }

    return null;
  }

  // OpenStreetMap (completely FREE)
  private async getOpenStreetMapData(address: string) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RepMotivatedSeller/1.0", // Required by OSM
      },
    });

    return response.json();
  }

  // US Census API (FREE)
  private async getCensusData(address: string) {
    // Get demographic and economic data for the area
    const response = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=2020&format=json`,
    );
    return response.json();
  }

  async searchPublicRecords(address: string) {
    // Placeholder hook for county/state record search
    return { address, records: [] };
  }

  mergePropertyData(data: Record<string, any>) {
    return data;
  }
}

export default new PropertyDataService();
