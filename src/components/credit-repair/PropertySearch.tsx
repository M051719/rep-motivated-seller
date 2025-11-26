import React, { useState } from 'react';

interface PropertySearchProps {
  userTier?: 'FREE' | 'PREMIUM' | 'ELITE';
  showMap?: boolean;
}

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  estimatedValue: number;
  arv?: number;
  roi?: number;
}

const PropertySearch: React.FC<PropertySearchProps> = ({
  userTier = 'FREE',
  showMap = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    minPrice: '',
    maxPrice: ''
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  const searchLimits = {
    FREE: 10,
    PREMIUM: 100,
    ELITE: Infinity
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        ...filters
      });

      const response = await fetch(`/api/property/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setProperties(result.data.properties);
        setSearchCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error searching properties:', error);
      // Fallback data
      setProperties([
        {
          id: '1',
          address: '1234 Main Street',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001',
          type: 'Single Family',
          status: 'Pre-Foreclosure',
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1800,
          estimatedValue: 245000,
          arv: 285000,
          roi: 16.3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const remainingSearches = userTier === 'ELITE' 
    ? 'Unlimited' 
    : `${searchLimits[userTier] - searchCount}/${searchLimits[userTier]}`;

  return (
    <div className="property-search-component">
      <div className="search-header">
        <h2>Search Pre-Foreclosure Properties</h2>
        <p className="search-limit">
          {userTier} Tier: {remainingSearches} searches remaining
        </p>
      </div>

      <div className="search-form">
        <div className="search-row">
          <input 
            type="text" 
            placeholder="Enter address, city, state, or ZIP code"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading || (userTier !== 'ELITE' && searchCount >= searchLimits[userTier])}
          >
            🔍 Search
          </button>
        </div>

        <div className="filter-row">
          <select 
            className="filter-select"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Property Types</option>
            <option value="single-family">Single Family</option>
            <option value="multi-family">Multi-Family</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
          </select>

          <select 
            className="filter-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="pre-foreclosure">Pre-Foreclosure</option>
            <option value="auction">Auction</option>
            <option value="bank-owned">Bank Owned</option>
          </select>

          <input 
            type="number" 
            placeholder="Min Price"
            className="filter-input"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />

          <input 
            type="number" 
            placeholder="Max Price"
            className="filter-input"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />

          <button 
            className="btn btn-outline"
            onClick={() => setFilters({ type: '', status: '', minPrice: '', maxPrice: '' })}
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Searching properties...</div>
      ) : properties.length > 0 ? (
        <div className="search-results">
          <h3>Found {properties.length} properties</h3>
          <div className="property-grid">
            {properties.map((property) => (
              <div key={property.id} className="property-card">
                <div className="property-image">
                  <img src="/images/property-placeholder.jpg" alt={property.address} />
                  <span className={`property-badge ${property.status.toLowerCase().replace(' ', '-')}`}>
                    {property.status}
                  </span>
                </div>
                <div className="property-info">
                  <h4>{property.address}</h4>
                  <p className="property-location">{property.city}, {property.state} {property.zip}</p>
                  <div className="property-details">
                    {property.bedrooms} bed • {property.bathrooms} bath • {property.sqft.toLocaleString()} sqft
                  </div>
                  <div className="property-price">
                    <strong>${property.estimatedValue.toLocaleString()}</strong>
                  </div>
                  {property.roi && (
                    <div className="property-roi">
                      Potential ROI: <span className="positive">{property.roi}%</span>
                    </div>
                  )}
                  <div className="property-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => window.location.href = `/property/${property.id}`}
                    >
                      View Details
                    </button>
                    {userTier !== 'FREE' && (
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => window.location.href = `/property/${property.id}/analyze`}
                      >
                        Analyze
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-results">
          <p>Enter a location to search for properties</p>
        </div>
      )}

      {userTier === 'FREE' && (
        <div className="upgrade-prompt">
          <p>🏠 Upgrade for more searches and advanced features!</p>
          <a href="/credit-repair/pricing" className="btn btn-primary">View Plans</a>
        </div>
      )}
    </div>
  );
};

export default PropertySearch;
