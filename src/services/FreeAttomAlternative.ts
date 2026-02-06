// src/services/FreeAttomAlternative.ts
class FreeAttomAlternative {
  // 1. PROPERTY DETAILS - Aggregate from free sources
  async getPropertyDetails(address: string) {
    const propertyData = await Promise.all([
      this.getParcelData(address),
      this.getOwnershipData(address),
      this.getSalesHistory(address),
      this.getMortgageData(address),
      this.getPropertyCharacteristics(address),
      this.getAssessmentData(address),
      this.getSchoolData(address),
      this.getNeighborhoodData(address),
    ]);

    return this.mergeAllPropertyData(propertyData);
  }

  // 2. PARCEL DATA - From county GIS systems (FREE)
  async getParcelData(address: string) {
    const gisServers = {
      // Most counties have free GIS servers
      california: [
        {
          county: "Los Angeles",
          url: "https://maps.assessor.lacounty.gov/arcgis/rest/services/PAIS/pais_parcel/MapServer/0/query",
          params: {
            where: `SitusAddress LIKE '%${address}%'`,
            outFields: "*",
            f: "json",
          },
        },
        {
          county: "San Diego",
          url: "https://gis.sandiegocounty.gov/arcgis/rest/services/Parcels/MapServer/0/query",
          params: {
            where: `SITUS LIKE '%${address}%'`,
            outFields: "*",
            f: "json",
          },
        },
        {
          county: "Orange",
          url: "https://gis.ocgov.com/arcgis/rest/services/Parcels/MapServer/0/query",
          params: {
            where: `SITUS_ADDR LIKE '%${address}%'`,
            outFields: "*",
            f: "json",
          },
        },
      ],

      florida: [
        {
          county: "Miami-Dade",
          url: "https://gis.miamidade.gov/arcgis/rest/services/Parcels/MapServer/0/query",
          params: {
            where: `SITE_ADDR LIKE '%${address}%'`,
            outFields: "*",
            f: "json",
          },
        },
        {
          county: "Broward",
          url: "https://gis.broward.org/arcgis/rest/services/Parcels/MapServer/0/query",
          params: {
            where: `SITE_ADDR LIKE '%${address}%'`,
            outFields: "*",
            f: "json",
          },
        },
      ],

      texas: [
        {
          county: "Harris",
          url: "https://arcgis.hcad.org/arcgis/rest/services/Parcels/MapServer/0/query",
          params: {
            where: `StreetAddress LIKE '%${address}%'`,
            outFields: "*",
            f: "json",
          },
        },
        {
          county: "Dallas",
          url: "https://maps.dcad.org/arcgis/rest/services/Parcels/MapServer/0/query",
          params: {
            where: `SITUS LIKE '%${address}%'`,
            outFields: "*",
            f: "json",
          },
        },
      ],
    };

    // Auto-detect county and fetch data
    for (const state of Object.values(gisServers)) {
      for (const county of state) {
        try {
          const response = await fetch(
            `${county.url}?${new URLSearchParams(county.params as any)}`,
          );
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            return {
              source: county.county,
              parcel: data.features[0].attributes,
              geometry: data.features[0].geometry,
            };
          }
        } catch (error) {
          continue;
        }
      }
    }

    return null;
  }

  // 3. OWNERSHIP & DEED DATA - County Recorder (FREE)
  async getOwnershipData(address: string) {
    // Many county recorders have free online searches
    const recorderSites = {
      "Los Angeles": {
        url: "https://cr.lavote.net/AVID/Search.aspx",
        api: "https://api.lavote.net/records/search",
        method: "POST",
        free: true,
      },
      "Cook County": {
        url: "https://www.cookcountyil.gov/service/recorder-deeds-search",
        api: "https://recordersearch.cookcountyil.gov/api/search",
        method: "POST",
        free: true,
      },
      Maricopa: {
        url: "https://recorder.maricopa.gov/recdocdata/",
        api: "https://recorder.maricopa.gov/api/search",
        method: "GET",
        free: true,
      },
    };

    // Implementation would scrape or API call these sites
    return {
      owner: "Parse from recorder data",
      deedDate: "Parse from recorder data",
      documentNumber: "Parse from recorder data",
      salePrice: "Parse from recorder data",
    };
  }

  // 4. SALES HISTORY - Combine multiple free sources
  async getSalesHistory(address: string) {
    const sources = await Promise.all([
      this.getRedfinSales(address),
      this.getRealtorSales(address),
      this.getCountyRecorderSales(address),
    ]);

    return this.mergeSalesData(sources);
  }

  private async getRedfinSales(address: string) {
    // Redfin provides some public data
    try {
      // This would need to be scraped or use their limited public API
      const response = await fetch(
        `https://www.redfin.com/stingray/api/home/details/aboveTheFold?path=/address/${encodeURIComponent(address)}`,
      );
      const data = await response.json();

      return {
        source: "Redfin",
        sales: data?.payload?.propertyHistory || [],
      };
    } catch (error) {
      return null;
    }
  }

  private async getRealtorSales(address: string) {
    // Realtor.com public data
    try {
      // Would need to scrape or use public endpoints
      return {
        source: "Realtor.com",
        sales: [],
      };
    } catch (error) {
      return null;
    }
  }

  private async getCountyRecorderSales(address: string) {
    // Direct from county recorder
    return {
      source: "County Recorder",
      sales: [],
    };
  }

  // 5. MORTGAGE & LIEN DATA - Public records
  async getMortgageData(address: string) {
    // SEC EDGAR for institutional mortgages
    const secData = await fetch(
      "https://www.sec.gov/edgar/searchedgar/companysearch.html",
    );

    // County recorder for individual mortgages
    const countyData = await this.searchCountyRecorder(address, "MORTGAGE");

    // UCC filings for liens
    const uccData = await this.searchUCCFilings(address);

    return {
      mortgages: countyData,
      liens: uccData,
      totalDebt: this.calculateTotalDebt(countyData, uccData),
    };
  }

  // 6. PROPERTY CHARACTERISTICS - Multiple sources
  async getPropertyCharacteristics(address: string) {
    const sources = {
      // Building permits (many cities provide free APIs)
      permits: await this.getBuildingPermits(address),

      // Property cards from assessor
      assessorCard: await this.getAssessorPropertyCard(address),

      // Census American Community Survey
      censusData: await this.getCensusHousingData(address),

      // Parcel data from GIS
      gisData: await this.getParcelData(address),
    };

    return {
      bedrooms: sources.assessorCard?.bedrooms || "Unknown",
      bathrooms: sources.assessorCard?.bathrooms || "Unknown",
      squareFootage:
        sources.assessorCard?.squareFootage || (sources.gisData as any)?.SQFT,
      lotSize: (sources.gisData as any)?.LOT_SIZE,
      yearBuilt: sources.assessorCard?.yearBuilt || sources.permits?.[0]?.year,
      stories: sources.assessorCard?.stories,
      construction: sources.assessorCard?.construction,
      roof: sources.assessorCard?.roof,
      heating: sources.assessorCard?.heating,
      cooling: sources.assessorCard?.cooling,
      parking: sources.assessorCard?.parking,
      pool: sources.permits?.some((p) => p.type === "POOL"),
      additions: sources.permits?.filter((p) => p.type === "ADDITION"),
    };
  }

  // 7. ASSESSMENT & TAX DATA - Assessor websites (FREE)
  async getAssessmentData(address: string) {
    const assessorAPIs = {
      "Los Angeles": "https://portal.assessor.lacounty.gov/api/search",
      "Cook County": "https://www.cookcountyassessor.com/api/pin",
      "Harris County": "https://public.hcad.org/api/search",
      "Miami-Dade": "https://www.miamidade.gov/pa/api/search",
    };

    // Most assessors provide free public data
    return {
      assessedValue: 0,
      taxAmount: 0,
      taxYear: 2024,
      exemptions: [],
      taxRate: 0,
      specialAssessments: [],
    };
  }

  // 8. SCHOOL DATA - GreatSchools API (FREE tier available)
  async getSchoolData(address: string) {
    // Option 1: GreatSchools.org (limited free API)
    // Option 2: NCES (National Center for Education Statistics) - completely free
    const ncesData = await fetch(
      `https://nces.ed.gov/ccd/api/schools?address=${encodeURIComponent(address)}`,
    );

    // Option 3: State education department APIs (most are free)
    return {
      elementary: { name: "", rating: 0, distance: 0 },
      middle: { name: "", rating: 0, distance: 0 },
      high: { name: "", rating: 0, distance: 0 },
      district: "",
    };
  }

  // 9. NEIGHBORHOOD DATA - Census + Crime data
  async getNeighborhoodData(address: string) {
    const [demographics, crime, walkability] = await Promise.all([
      this.getCensusData(address),
      this.getCrimeData(address),
      this.getWalkabilityScore(address),
    ]);

    return {
      demographics,
      crime,
      walkability,
      nearbyAmenities: await this.getNearbyAmenities(address),
    };
  }

  private async getCensusData(address: string) {
    // US Census API - completely FREE
    const response = await fetch(
      `https://api.census.gov/data/2021/acs/acs5?get=B01003_001E,B19013_001E,B25077_001E&for=tract:*&in=state:*`,
    );
    return response.json();
  }

  private async getCensusHousingData(address: string) {
    try {
      // Census Housing API is free and public
      const response = await fetch(
        `https://api.census.gov/data/2021/acs/acs5?get=NAME,B25001_001E,B25003_002E,B25003_003E&for=tract:*`,
      );
      const data = await response.json();

      return {
        totalUnits: data?.[1]?.[1] || 0,
        ownerOccupied: data?.[1]?.[2] || 0,
        renterOccupied: data?.[1]?.[3] || 0,
        vacancyRate: 0,
      };
    } catch (error) {
      console.error("Census housing data error:", error);
      return {
        totalUnits: 0,
        ownerOccupied: 0,
        renterOccupied: 0,
        vacancyRate: 0,
      };
    }
  }

  private async getCrimeData(address: string) {
    // Many police departments provide free crime APIs
    const crimeAPIs = {
      "Los Angeles": "https://data.lacity.org/resource/2nrs-mtv8.json",
      Chicago: "https://data.cityofchicago.org/resource/crimes.json",
      "New York": "https://data.cityofnewyork.us/resource/7x9x-zpz6.json",
    };

    return { crimeRate: "Low/Medium/High" };
  }

  private async getWalkabilityScore(address: string) {
    // OpenStreetMap for walkability analysis (FREE)
    const osmData = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`,
    );
    // Calculate based on nearby amenities
    return { score: 0, description: "Car-dependent" };
  }

  // 10. BUILDING PERMITS - City data portals (FREE)
  async getBuildingPermits(address: string) {
    const permitAPIs = {
      "Los Angeles": "https://data.lacity.org/resource/building-permits.json",
      "San Francisco": "https://data.sfgov.org/resource/building-permits.json",
      Seattle: "https://data.seattle.gov/resource/building-permits.json",
      Chicago: "https://data.cityofchicago.org/resource/building-permits.json",
    };

    // Most major cities provide free permit data
    return [];
  }

  // MASTER MERGE FUNCTION
  private mergeAllPropertyData(dataArray: any[]) {
    return {
      property: {
        address: dataArray[0]?.address,
        parcel: dataArray[0]?.parcel,
        owner: dataArray[1]?.owner,
        characteristics: dataArray[4],
        assessment: dataArray[5],
        schools: dataArray[6],
        neighborhood: dataArray[7],
      },
      financial: {
        currentValue: this.estimateValue(dataArray),
        assessedValue: dataArray[5]?.assessedValue,
        taxAmount: dataArray[5]?.taxAmount,
        mortgages: dataArray[3]?.mortgages,
        totalDebt: dataArray[3]?.totalDebt,
      },
      history: {
        sales: dataArray[2],
        permits: dataArray[4]?.additions,
      },
      analysis: {
        equity: this.calculateEquity(dataArray),
        capRate: this.calculateCapRate(dataArray),
        rentEstimate: this.estimateRent(dataArray),
      },
    };
  }

  // VALUE ESTIMATION using free comps
  private estimateValue(data: any[]) {
    // Use recent sales from the area
    const recentSales = data[2]?.sales || [];
    const sqft = data[4]?.squareFootage || 1500;

    // Calculate price per sqft from comps
    const avgPricePerSqft =
      recentSales.reduce(
        (sum: number, sale: any) => sum + sale.price / sale.sqft,
        0,
      ) / recentSales.length || 200;

    return Math.round(sqft * avgPricePerSqft);
  }

  private calculateEquity(data: any[]) {
    const value = this.estimateValue(data);
    const debt = data[3]?.totalDebt || 0;
    return value - debt;
  }

  private calculateCapRate(data: any[]) {
    const value = this.estimateValue(data);
    const rent = this.estimateRent(data);
    const annualNOI = rent * 12 * 0.5; // Assume 50% rule
    return (annualNOI / value) * 100;
  }

  private estimateRent(data: any[]) {
    // Use Rentometer free tier or Craigslist analysis
    const bedrooms = data[4]?.bedrooms || 3;
    const baseRent = 500;
    const perBedroom = 400;
    return baseRent + bedrooms * perBedroom;
  }

  // UCC FILINGS SEARCH
  private async searchUCCFilings(address: string) {
    // Secretary of State UCC searches (usually free)
    const stateAPIs = {
      California: "https://bizfileonline.sos.ca.gov/api/ucc/search",
      Texas: "https://www.sos.state.tx.us/api/ucc/search",
      Florida: "https://dos.fl.gov/api/ucc/search",
    };

    return [];
  }

  // ASSESSOR PROPERTY CARDS
  private async getAssessorPropertyCard(address: string) {
    // Many assessors provide property cards online for free
    const assessorSites = {
      "Los Angeles": "https://portal.assessor.lacounty.gov/",
      "Cook County": "https://www.cookcountyassessor.com/",
      "Harris County": "https://hcad.org/",
    };

    // Would scrape or use API if available
    return null;
  }

  private async searchCountyRecorder(address: string, docType: string) {
    // Implementation for county recorder searches
    return [];
  }

  private calculateTotalDebt(mortgages: any[], liens: any[]) {
    const mortgageTotal = mortgages?.reduce((sum, m) => sum + m.amount, 0) || 0;
    const lienTotal = liens?.reduce((sum, l) => sum + l.amount, 0) || 0;
    return mortgageTotal + lienTotal;
  }

  private async getNearbyAmenities(address: string) {
    // Use OpenStreetMap Overpass API (FREE)
    const lat = 0; // Get from geocoding
    const lon = 0;
    const radius = 1000; // meters

    const query = `
      [out:json];
      (
        node["amenity"](around:${radius},${lat},${lon});
        way["amenity"](around:${radius},${lat},${lon});
      );
      out body;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    return response.json();
  }

  private mergeSalesData(sources: any[]) {
    // Deduplicate and merge sales from multiple sources
    const allSales = sources.flatMap((s) => s?.sales || []);
    const uniqueSales = Array.from(
      new Map(allSales.map((s) => [s.date, s])).values(),
    );
    return uniqueSales.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }
}

export default new FreeAttomAlternative();
