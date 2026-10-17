import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Zap,
  MapPin
} from 'lucide-react';
import { stationApi } from '../services/api';
import StationCard from '../components/stations/StationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function StationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL query params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedConnector, setSelectedConnector] = useState(searchParams.get('connector') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPower, setMinPower] = useState(searchParams.get('min_power') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available_only') === 'true');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'recommended');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [stations, setStations] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state to URL
  const updateUrlParams = useCallback((newParams) => {
    const params = new URLSearchParams();
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  // Fetch stations from backend
  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        q: searchQuery,
        city: selectedCity,
        connector: selectedConnector,
        category: selectedCategory,
        min_power: minPower ? parseFloat(minPower) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        available_only: availableOnly ? 'true' : undefined,
        sort: sortOption,
        page: currentPage,
        limit: 9,
      };

      const res = await stationApi.getStations(queryParams);
      setStations(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      setError(err.message || 'Failed to load charging stations');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCity, selectedConnector, selectedCategory, minPower, maxPrice, availableOnly, sortOption, currentPage]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrlParams({
      q: searchQuery,
      city: selectedCity,
      connector: selectedConnector,
      category: selectedCategory,
      min_power: minPower,
      max_price: maxPrice,
      available_only: availableOnly,
      sort: sortOption,
      page: 1,
    });
  };

  const handleFilterChange = (updates) => {
    setCurrentPage(1);
    const updated = {
      q: searchQuery,
      city: selectedCity,
      connector: selectedConnector,
      category: selectedCategory,
      min_power: minPower,
      max_price: maxPrice,
      available_only: availableOnly,
      sort: sortOption,
      page: 1,
      ...updates,
    };
    if (updates.city !== undefined) setSelectedCity(updates.city);
    if (updates.connector !== undefined) setSelectedConnector(updates.connector);
    if (updates.category !== undefined) setSelectedCategory(updates.category);
    if (updates.min_power !== undefined) setMinPower(updates.min_power);
    if (updates.max_price !== undefined) setMaxPrice(updates.max_price);
    if (updates.available_only !== undefined) setAvailableOnly(updates.available_only);
    if (updates.sort !== undefined) setSortOption(updates.sort);
    updateUrlParams(updated);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedConnector('');
    setSelectedCategory('');
    setMinPower('');
    setMaxPrice('');
    setAvailableOnly(false);
    setSortOption('recommended');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.total_pages) {
      setCurrentPage(newPage);
      updateUrlParams({
        q: searchQuery,
        city: selectedCity,
        connector: selectedConnector,
        category: selectedCategory,
        min_power: minPower,
        max_price: maxPrice,
        available_only: availableOnly,
        sort: sortOption,
        page: newPage,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Top Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>
          Explore Charging Stations
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Find, compare, and reserve verified EV charging hubs across India.
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Station Results */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }} className="stations-layout">
        
        {/* DESKTOP FILTERS SIDEBAR */}
        <aside className="filters-sidebar card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={18} /> Filters
            </h3>
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <RotateCcw size={13} /> Reset All
            </button>
          </div>

          {/* City Filter */}
          <div className="form-group">
            <label className="form-label">City</label>
            <select
              value={selectedCity}
              onChange={(e) => handleFilterChange({ city: e.target.value })}
              className="form-select"
            >
              <option value="">All Cities</option>
              <option value="Delhi">New Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Pune">Pune</option>
              <option value="Gurugram">Gurugram</option>
            </select>
          </div>

          {/* Connector Type */}
          <div className="form-group">
            <label className="form-label">Connector Type</label>
            <select
              value={selectedConnector}
              onChange={(e) => handleFilterChange({ connector: e.target.value })}
              className="form-select"
            >
              <option value="">All Connectors</option>
              <option value="CCS2">CCS2 (DC Fast)</option>
              <option value="Type 2">Type 2 (AC Destination)</option>
              <option value="CHAdeMO">CHAdeMO (DC)</option>
            </select>
          </div>

          {/* Speed Category */}
          <div className="form-group">
            <label className="form-label">Power Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleFilterChange({ category: e.target.value })}
              className="form-select"
            >
              <option value="">All Speeds</option>
              <option value="DC">⚡ DC Fast Charging (&gt;22 kW)</option>
              <option value="AC">🔌 AC Normal Charging (≤22 kW)</option>
            </select>
          </div>

          {/* Min Power (kW) */}
          <div className="form-group">
            <label className="form-label">Min Power (kW)</label>
            <select
              value={minPower}
              onChange={(e) => handleFilterChange({ min_power: e.target.value })}
              className="form-select"
            >
              <option value="">Any Power</option>
              <option value="22">22 kW and above</option>
              <option value="50">50 kW and above</option>
              <option value="100">100 kW and above</option>
              <option value="150">150 kW Ultra-Fast</option>
            </select>
          </div>

          {/* Max Price Tariff */}
          <div className="form-group">
            <label className="form-label">Max Tariff (₹ / kWh)</label>
            <select
              value={maxPrice}
              onChange={(e) => handleFilterChange({ max_price: e.target.value })}
              className="form-select"
            >
              <option value="">Any Tariff</option>
              <option value="14">Up to ₹14 / kWh</option>
              <option value="16">Up to ₹16 / kWh</option>
              <option value="18">Up to ₹18 / kWh</option>
              <option value="20">Up to ₹20 / kWh</option>
            </select>
          </div>

          {/* Availability Toggle */}
          <div style={{ marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--navy)'
            }}>
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => handleFilterChange({ available_only: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
              />
              Available Slots Only
            </label>
          </div>
        </aside>

        {/* RESULTS SECTION */}
        <main>
          {/* Search bar & Sort Controls Header */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <form onSubmit={handleSearchSubmit} style={{ flexGrow: 1, maxWidth: 480, display: 'flex' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '0 0.5rem'
              }}>
                <Search size={18} style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }} />
                <input
                  type="text"
                  placeholder="Search station name, address, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    padding: '0.6rem 0.65rem',
                    fontSize: '0.9rem',
                    color: 'var(--text)'
                  }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.4rem 0.85rem' }}>
                  Search
                </button>
              </div>
            </form>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="btn btn-outline btn-sm mobile-filter-btn"
              style={{ display: 'none', alignItems: 'center', gap: '0.4rem' }}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                Sort by:
              </span>
              <select
                value={sortOption}
                onChange={(e) => handleFilterChange({ sort: e.target.value })}
                className="form-select"
                style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Results Count Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}>
            <span>Showing <strong>{meta.total}</strong> charging {meta.total === 1 ? 'station' : 'stations'}</span>
            {meta.total_pages > 1 && (
              <span>Page {meta.page} of {meta.total_pages}</span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#FEE2E2',
              color: 'var(--error)',
              borderRadius: 'var(--radius)',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {/* Cards Grid */}
          {loading ? (
            <LoadingSpinner message="Searching charging network..." />
          ) : stations.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {stations.map((station) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No charging stations match your criteria"
              description="We could not find any active stations matching your selected search query or filters. Try clearing your filters."
              actionText="Reset All Filters"
              onAction={resetFilters}
            />
          )}

          {/* Pagination Controls */}
          {meta.total_pages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '3rem'
            }}>
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`btn btn-sm ${p === meta.page ? 'btn-primary' : 'btn-outline'}`}
                  style={{ minWidth: 36, height: 36, padding: '0 0.5rem' }}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.total_pages}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="modal-overlay" onClick={() => setMobileFilterOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)' }}>Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <select
                value={selectedCity}
                onChange={(e) => handleFilterChange({ city: e.target.value })}
                className="form-select"
              >
                <option value="">All Cities</option>
                <option value="Delhi">New Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
                <option value="Gurugram">Gurugram</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Connector Type</label>
              <select
                value={selectedConnector}
                onChange={(e) => handleFilterChange({ connector: e.target.value })}
                className="form-select"
              >
                <option value="">All Connectors</option>
                <option value="CCS2">CCS2 (DC Fast)</option>
                <option value="Type 2">Type 2 (AC Destination)</option>
                <option value="CHAdeMO">CHAdeMO (DC)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Power Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
                className="form-select"
              >
                <option value="">All Speeds</option>
                <option value="DC">⚡ DC Fast Charging (&gt;22 kW)</option>
                <option value="AC">🔌 AC Normal Charging (≤22 kW)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Min Power (kW)</label>
              <select
                value={minPower}
                onChange={(e) => handleFilterChange({ min_power: e.target.value })}
                className="form-select"
              >
                <option value="">Any Power</option>
                <option value="22">22 kW and above</option>
                <option value="50">50 kW and above</option>
                <option value="100">100 kW and above</option>
                <option value="150">150 kW Ultra-Fast</option>
              </select>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => handleFilterChange({ available_only: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                />
                Available Slots Only
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={resetFilters} className="btn btn-outline" style={{ flex: 1 }}>
                Reset
              </button>
              <button onClick={() => setMobileFilterOpen(false)} className="btn btn-primary" style={{ flex: 1 }}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .stations-layout {
            grid-template-columns: 1fr !important;
          }
          .filters-sidebar {
            display: none !important;
          }
          .mobile-filter-btn {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
}
