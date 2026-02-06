// src/services/FreePropertyDataService.ts
class FreePropertyDataService {
  // 1. GOOGLE MAPS API - Free tier: 28,500 requests/month
  async getGoogleMapsData(address: string) {
    try {
      // Geocoding to get coordinates and place ID
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results?.[0]) {
        throw new Error("Address not found");
      }

      const result = geocodeData.results[0];
      const placeId = result.place_id;
      const location = result.geometry.location;

      // Get place details for more information
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,address_components,types,url,vicinity&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );
      const detailsData = await detailsResponse.json();

      // Get nearby places for neighborhood analysis
      const nearbyResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=1000&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );
      const nearbyData = await nearbyResponse.json();

      // Get Street View availability
      const streetViewResponse = await fetch(
        `https://maps.googleapis.com/maps/api/streetview/metadata?location=${location.lat},${location.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
      );
      const streetViewData = await streetViewResponse.json();

      return {
        address: result.formatted_address,
        coordinates: location,
        placeId: placeId,
        addressComponents: result.address_components,
        propertyType: result.types,
        details: detailsData.result,
        nearbyPlaces: nearbyData.results?.slice(0, 10),
        streetViewAvailable: streetViewData.status === "OK",
        streetViewUrl:
          streetViewData.status === "OK"
            ? `https://maps.googleapis.com/maps/api/streetview?size=640x480&location=${location.lat},${location.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            : null,
      };
    } catch (error) {
      console.error("Google Maps API error:", error);
      return null;
    }
  }

  // 2. US CENSUS API - Completely FREE, no limits
  async getCensusData(address: string) {
    try {
      // First, geocode the address using Census geocoder
      const geocodeResponse = await fetch(
        `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=2020&format=json`,
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.result?.addressMatches?.[0]) {
        throw new Error("Address not found in Census data");
      }

      const match = geocodeData.result.addressMatches[0];
      const coordinates = match.coordinates;
      const geographies = match.geographies;

      // Get Census tract information
      const tract = geographies?.["Census Tracts"]?.[0];
      const blockGroup = geographies?.["2020 Census Blocks"]?.[0];

      // Get demographic data using Census API (if tract is available)
      let demographicData = null;
      if (tract) {
        const state = tract.STATE;
        const county = tract.COUNTY;
        const tractCode = tract.TRACT;

        // American Community Survey 5-Year Data
        const acsResponse = await fetch(
          `https://api.census.gov/data/2021/acs/acs5?get=B01003_001E,B19013_001E,B25077_001E,B25003_001E,B25003_002E&for=tract:${tractCode}&in=state:${state}%20county:${county}`,
        );

        if (acsResponse.ok) {
          const acsData = await acsResponse.json();
          if (acsData[1]) {
            demographicData = {
              population: acsData[1][0],
              medianHouseholdIncome: acsData[1][1],
              medianHomeValue: acsData[1][2],
              totalHousingUnits: acsData[1][3],
              ownerOccupiedUnits: acsData[1][4],
            };
          }
        }
      }

      return {
        matchedAddress: match.matchedAddress,
        coordinates: {
          lat: coordinates.y,
          lng: coordinates.x,
        },
        censusData: {
          tract: tract,
          blockGroup: blockGroup,
          demographics: demographicData,
        },
        tigerLineId: match.tigerLine?.tigerLineId,
        addressComponents: match.addressComponents,
      };
    } catch (error) {
      console.error("Census API error:", error);
      return null;
    }
  }

  // 3. OPENSTREETMAP / NOMINATIM - Completely FREE
  async getOpenStreetMapData(address: string) {
    try {
      // Search for the address
      const searchResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&extratags=1&namedetails=1&limit=1`,
        {
          headers: {
            "User-Agent":
              "RepMotivatedSeller/1.0 (contact@repmotivatedseller.org)",
          },
        },
      );
      const searchData = await searchResponse.json();

      if (!searchData[0]) {
        throw new Error("Address not found in OpenStreetMap");
      }

      const place = searchData[0];
      const osmId = place.osm_id;
      const osmType = place.osm_type;

      // Get detailed information about the place
      const detailsResponse = await fetch(
        `https://nominatim.openstreetmap.org/details?osmtype=${osmType[0].toUpperCase()}&osmid=${osmId}&format=json`,
        {
          headers: {
            "User-Agent": "RepMotivatedSeller/1.0",
          },
        },
      );
      const detailsData = await detailsResponse.json();

      // Get reverse geocoding for additional details
      const reverseResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${place.lat}&lon=${place.lon}&format=json&zoom=18`,
        {
          headers: {
            "User-Agent": "RepMotivatedSeller/1.0",
          },
        },
      );
      const reverseData = await reverseResponse.json();

      return {
        displayName: place.display_name,
        coordinates: {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon),
        },
        boundingBox: place.boundingbox,
        placeType: place.type,
        importance: place.importance,
        addressDetails: place.address,
        extraTags: place.extratags,
        nameDetails: place.namedetails,
        osmDetails: detailsData,
        reverseGeocode: reverseData,
      };
    } catch (error) {
      console.error("OpenStreetMap API error:", error);
      return null;
    }
  }

  // 4. COUNTY ASSESSOR DATA - Free but varies by county
  async getCountyAssessorData(address: string, county: string, state: string) {
    const countyAPIs: Record<string, any> = {
      // Los Angeles County, CA
      "los-angeles-ca": {
        url: "https://data.lacounty.gov/resource/9trm-uz8i.json",
        searchField: "situsaddress",
        format: (addr: string) => addr.toUpperCase(),
      },
      // Cook County, IL (Chicago)
      "cook-il": {
        url: "https://datacatalog.cookcountyil.gov/resource/5pge-nu6u.json",
        searchField: "property_address",
        format: (addr: string) => addr.toUpperCase(),
      },
      // Miami-Dade County, FL
      "miami-dade-fl": {
        url: "https://gisweb.miamidade.gov/arcgis/rest/services/MDC_PropertySearch/MapServer/0/query",
        searchField: "SITE_ADDR",
        format: (addr: string) => addr.toUpperCase(),
        isArcGIS: true,
      },
      // King County, WA (Seattle)
      "king-wa": {
        url: "https://gismaps.kingcounty.gov/arcgis/rest/services/property/KingCountyParcelData/MapServer/0/query",
        searchField: "ADDR_FULL",
        format: (addr: string) => addr.toUpperCase(),
        isArcGIS: true,
      },
      // Add more counties as needed
    };

    const countyKey = `${county.toLowerCase()}-${state.toLowerCase()}`;
    const countyAPI = countyAPIs[countyKey];

    if (!countyAPI) {
      console.log(`No API available for ${county}, ${state}`);
      return null;
    }

    try {
      const formattedAddress = countyAPI.format(address);

      if (countyAPI.isArcGIS) {
        // ArcGIS REST API format
        const params = new URLSearchParams({
          where: `${countyAPI.searchField} LIKE '%${formattedAddress}%'`,
          outFields: "*",
          f: "json",
        });

        const response = await fetch(`${countyAPI.url}?${params}`);
        const data = await response.json();

        return data.features?.[0]?.attributes || null;
      } else {
        // Socrata API format
        const response = await fetch(
          `${countyAPI.url}?$where=${countyAPI.searchField} like '%25${encodeURIComponent(formattedAddress)}%25'`,
        );
        const data = await response.json();

        return data[0] || null;
      }
    } catch (error) {
      console.error("County Assessor API error:", error);
      return null;
    }
  }

  // 5. PROPERTY VALUE ESTIMATION (using comparable sales from free sources)
  async estimatePropertyValue(address: string, propertyData: any) {
    try {
      // Use Census median home value as a baseline
      const censusMedianValue =
        propertyData?.census?.demographics?.medianHomeValue;

      // Adjust based on property characteristics if available
      let estimatedValue = censusMedianValue || 0;

      // Simple adjustment factors (you can make these more sophisticated)
      const adjustments = {
        propertyType: 1.0, // Single family, condo, etc.
        neighborhood: 1.0, // Based on nearby amenities
        marketTrend: 1.0, // Based on recent sales if available
      };

      // Apply adjustments
      estimatedValue =
        estimatedValue *
        adjustments.propertyType *
        adjustments.neighborhood *
        adjustments.marketTrend;

      return {
        estimatedValue: Math.round(estimatedValue),
        confidence: "low", // Since we're using free data
        methodology: "Census median adjusted",
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Value estimation error:", error);
      return null;
    }
  }

  // 6. FORECLOSURE DATA - Scrape public court records
  async getForeclosureData(address: string, county: string, state: string) {
    // Many counties publish foreclosure notices online
    const foreclosureSites: Record<string, string> = {
      "los-angeles-ca": "https://www.lacourt.org/casesummary/ui/",
      "cook-il": "https://www.cookcountyclerkofcourt.org/NewWebsite/",
      "miami-dade-fl":
        "https://www.miami-dadeclerk.com/official-records/search-instruments.page",
      // Add more counties
    };

    // Note: Actual scraping would require a backend service
    // This is a placeholder for the structure
    return {
      hasForeclosureRecord: false,
      lisPendens: null,
      noticeOfDefault: null,
      auctionDate: null,
      searchDate: new Date().toISOString(),
      source:
        foreclosureSites[`${county.toLowerCase()}-${state.toLowerCase()}`] ||
        "Not available",
    };
  }

  // MASTER FUNCTION: Combine all free data sources
  async getComprehensivePropertyData(address: string) {
    console.log("🔍 Searching for property:", address);

    // Parse address to get county and state
    const addressParts = address.split(",");
    const state =
      addressParts[addressParts.length - 1]?.trim().split(" ")[0] || "";
    const city = addressParts[addressParts.length - 2]?.trim() || "";

    // Determine county from city (you'd need a city->county mapping)
    const countyMap: Record<string, string> = {
      "los angeles": "los-angeles",
      chicago: "cook",
      miami: "miami-dade",
      seattle: "king",
      // Add more mappings
    };
    const county = countyMap[city.toLowerCase()] || "";

    // Fetch all data in parallel
    const [googleData, censusData, osmData, countyData] = await Promise.all([
      this.getGoogleMapsData(address).catch((err) => {
        console.error("Google Maps error:", err);
        return null;
      }),
      this.getCensusData(address).catch((err) => {
        console.error("Census error:", err);
        return null;
      }),
      this.getOpenStreetMapData(address).catch((err) => {
        console.error("OSM error:", err);
        return null;
      }),
      county
        ? this.getCountyAssessorData(address, county, state).catch((err) => {
            console.error("County error:", err);
            return null;
          })
        : Promise.resolve(null),
    ]);

    // Combine all data
    const combinedData = {
      address: googleData?.address || osmData?.displayName || address,
      coordinates:
        googleData?.coordinates ||
        osmData?.coordinates ||
        censusData?.coordinates,

      // Property details
      property: {
        type:
          googleData?.propertyType?.[0] || osmData?.placeType || "residential",
        assessorData: countyData,
        censusBlock: censusData?.censusData?.blockGroup,
        censusTract: censusData?.censusData?.tract,
      },

      // Neighborhood data
      neighborhood: {
        nearbyPlaces: googleData?.nearbyPlaces || [],
        demographics: censusData?.censusData?.demographics || {},
        medianIncome:
          censusData?.censusData?.demographics?.medianHouseholdIncome,
        medianHomeValue: censusData?.censusData?.demographics?.medianHomeValue,
      },

      // Visual data
      visual: {
        streetViewAvailable: googleData?.streetViewAvailable || false,
        streetViewUrl: googleData?.streetViewUrl,
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      },

      // Foreclosure info
      foreclosure: await this.getForeclosureData(address, county, state),

      // Value estimation
      valuation: await this.estimatePropertyValue(address, {
        census: censusData?.censusData,
        assessor: countyData,
      }),

      // Data sources used
      dataSources: {
        google: googleData !== null,
        census: censusData !== null,
        openStreetMap: osmData !== null,
        countyAssessor: countyData !== null,
      },

      // Raw data for debugging
      _raw: {
        google: googleData,
        census: censusData,
        osm: osmData,
        county: countyData,
      },
    };

    return combinedData;
  }

  async searchProperties(params: { zipCode?: string; limit?: number }) {
    // Lightweight placeholder search using public sources
    if (!params.zipCode) return [];
    const sample = await this.getOpenStreetMapData(params.zipCode).catch(
      () => null,
    );
    return sample
      ? [
          {
            address: sample.displayName,
            estimatedValue:
              sample.extraTags?.price || sample.reverseGeocode?.price || 0,
            riskScore: 50,
          },
        ]
      : [];
  }

  async getPropertyTrends() {
    return [
      { month: "Jan", avgPrice: 0, transactions: 0 },
      { month: "Feb", avgPrice: 0, transactions: 0 },
    ];
  }

  static async analyzeMarket(zipCode: string) {
    const service = new FreePropertyDataService();

    try {
      // Get market data from multiple free sources
      const [censusData, osmData] = await Promise.all([
        service.getCensusData(`zipcode:${zipCode}`),
        service.getOpenStreetMapData(`zipcode:${zipCode}`),
      ]);

      return {
        zipCode,
        medianHomeValue: (censusData as any)?.medianHomeValue || 0,
        medianIncome: (censusData as any)?.medianIncome || 0,
        population: (censusData as any)?.population || 0,
        amenities: (osmData as any)?.amenities || [],
        marketTrend: "stable",
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Market analysis error:", error);
      return {
        zipCode,
        medianHomeValue: 0,
        medianIncome: 0,
        population: 0,
        amenities: [],
        marketTrend: "unknown",
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async analyzeMarket(zipCode: string) {
    return FreePropertyDataService.analyzeMarket(zipCode);
  }
}

export default new FreePropertyDataService();
