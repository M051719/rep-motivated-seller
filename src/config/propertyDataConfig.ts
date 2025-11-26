// src/config/propertyDataConfig.ts
export const PROPERTY_DATA_SOURCES = {
  // PRIMARY (Most Affordable)
  primary: {
    name: 'Attom Data',
    cost: '$99/month',
    features: ['Property details', 'Sales history', 'Tax assessments', 'Foreclosure data'],
    api_key: process.env.VITE_ATTOM_API_KEY
  },
  
  // SECONDARY (For additional data)
  secondary: {
    name: 'RealtyMole',
    cost: '$50/month',
    features: ['Rent estimates', 'Comparables', 'Property details'],
    api_key: process.env.VITE_REALTYMOLE_API_KEY
  },
  
  // FREE SOURCES
  free: [
    {
      name: 'Google Maps',
      limit: '28,000 requests/month',
      features: ['Address validation', 'Neighborhood data', 'Street view']
    },
    {
      name: 'OpenStreetMap',
      limit: 'Unlimited',
      features: ['Property boundaries', 'Building footprints']
    },
    {
      name: 'County Records',
      limit: 'Varies',
      features: ['Tax records', 'Ownership', 'Liens']
    }
  ]
};