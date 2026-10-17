import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Zap,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  BatteryCharging,
  Sliders,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Smartphone
} from 'lucide-react';
import { stationApi, statsApi } from '../services/api';
import StationCard from '../components/stations/StationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredStations, setFeaturedStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [stats, setStats] = useState({
    active_stations: 8,
    active_chargers: 19,
    completed_bookings: 12,
    cities_covered: 7,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch featured stations
    stationApi.getStations({ limit: 6, sort: 'recommended' })
      .then((res) => {
        setFeaturedStations(res.data || []);
      })
      .catch((err) => {
        console.warn('Could not load featured stations:', err.message);
      })
      .finally(() => {
        setLoadingStations(false);
      });

    // Fetch live platform stats
    statsApi.getPublicStats()
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch((err) => {
        console.warn('Could not load platform statistics:', err.message);
      });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stations?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/stations');
    }
  };

  const handleQuickFilter = (type) => {
    switch (type) {
      case 'available':
        navigate('/stations?available_only=true');
        break;
      case 'fast':
        navigate('/stations?category=DC&min_power=50');
        break;
      case 'budget':
        navigate('/stations?sort=price_asc');
        break;
      default:
        navigate('/stations');
        break;
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        background: 'radial-gradient(circle at top right, rgba(22, 163, 74, 0.08) 0%, rgba(248, 250, 252, 1) 60%)',
        padding: '5rem 0 4.5rem',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'center',
            gap: '3.5rem'
          }}>
            {/* Left Content */}
            <div className="animate-fade-in">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary-dark)',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
                border: '1px solid rgba(22, 163, 74, 0.2)'
              }}>
                <Zap size={16} fill="var(--primary)" /> Smart EV Charging Infrastructure
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                color: 'var(--navy)',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem'
              }}>
                Power Your <span style={{ color: 'var(--primary)' }}>Journey.</span>
              </h1>

              <p style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                maxWidth: 520,
                marginBottom: '2rem'
              }}>
                Discover nearby EV charging stations, compare charging speeds, and reserve your next charge in seconds with verified live slot availability.
              </p>

              {/* Prominent Location Search Field */}
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  padding: '0.4rem',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-md)',
                  border: '1px solid var(--border)',
                  maxWidth: 520,
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{ padding: '0 0.85rem', color: 'var(--text-secondary)' }}>
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city (e.g. Delhi, Mumbai, Bengaluru) or station..."
                  style={{
                    flexGrow: 1,
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    color: 'var(--text)',
                    backgroundColor: 'transparent'
                  }}
                  aria-label="Search charging stations by city or name"
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  Search Stations
                </button>
              </form>

              {/* Quick Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>
                  Quick Filters:
                </span>
                <button onClick={() => handleQuickFilter('all')} className="btn btn-outline btn-sm" style={{ borderRadius: '9999px' }}>
                  All Stations
                </button>
                <button onClick={() => handleQuickFilter('available')} className="btn btn-outline btn-sm" style={{ borderRadius: '9999px' }}>
                  Available Now
                </button>
                <button onClick={() => handleQuickFilter('fast')} className="btn btn-outline btn-sm" style={{ borderRadius: '9999px' }}>
                  ⚡ Fast Charging (DC)
                </button>
                <button onClick={() => handleQuickFilter('budget')} className="btn btn-outline btn-sm" style={{ borderRadius: '9999px' }}>
                  Lowest Tariff
                </button>
              </div>
            </div>

            {/* Right Visual: Interactive EV Mobility Card & Graphic */}
            <div style={{ display: 'flex', justifyContent: 'center' }} className="hero-visual">
              <div style={{ position: 'relative', width: '100%', maxWidth: 460 }}>
                {/* Background decorative glow circle */}
                <div style={{
                  position: 'absolute',
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(22, 163, 74, 0.25) 0%, rgba(22, 163, 74, 0) 70%)',
                  top: '-40px',
                  right: '-40px',
                  zIndex: 0
                }} />

                {/* Main Card */}
                <div className="card animate-float" style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '1.75rem',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        backgroundColor: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}>
                        <BatteryCharging size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>HyperCharge Session</h4>
                        <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Central Delhi Hub • Bay #01</p>
                      </div>
                    </div>
                    <span className="badge badge-success" style={{ animation: 'pulseGlow 2s infinite' }}>
                      Live Active
                    </span>
                  </div>

                  {/* Charging Progress Meter */}
                  <div style={{ marginBottom: '1.25rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Battery State</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>78%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '78%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      <span>Power: 120 kW DC Fast</span>
                      <span>Est. Full: 14 mins</span>
                    </div>
                  </div>

                  {/* Real-time details grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: '#FFFFFF' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Energy Added</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>34.2 kWh</span>
                    </div>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', backgroundColor: '#FFFFFF' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Tariff Snapshot</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy)' }}>₹18.0 / kWh</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--navy)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.85rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ShieldCheck size={16} style={{ color: '#4ADE80' }} /> Guaranteed Slot Reserved
                    </span>
                    <span style={{ fontWeight: 700, color: '#4ADE80' }}>BK-CP4912</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE STATISTICS SECTION */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '2.5rem 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats.active_stations}+
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>Verified Stations</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In active operation</span>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)' }}>
                {stats.active_chargers}+
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>Fast DC & AC Bays</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Type 2, CCS2 & CHAdeMO</span>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats.cities_covered || 7}
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>Major Cities Covered</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Delhi, Mumbai, BLR & more</span>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)' }}>
                100%
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--navy)' }}>No Conflict Booking</p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Atomic interval locking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED STATIONS SECTION */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Featured Charging Network
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.25rem' }}>
                Popular Charging Hubs
              </h2>
            </div>
            <Link to="/stations" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              View All Stations <ArrowRight size={16} />
            </Link>
          </div>

          {loadingStations ? (
            <LoadingSpinner message="Loading stations from network..." />
          ) : featuredStations.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}>
              {featuredStations.map((station) => (
                <StationCard key={station.id} station={station} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No charging stations currently loaded.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{ backgroundColor: '#FFFFFF', padding: '5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seamless Experience
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              How EV Charge Finder Works
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Reserve your electric charging slot in four intuitive steps and avoid waiting in long queues at crowded stations.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                step: '01',
                title: 'Discover a Station',
                desc: 'Locate nearby certified charging hubs by city, connector type, charging power, or real-time availability.',
                icon: Search,
              },
              {
                step: '02',
                title: 'Select Compatible Charger',
                desc: 'Choose between CCS2 DC Fast (up to 150 kW), Type 2 AC, or CHAdeMO connectors tailored to your vehicle.',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Reserve Your Slot',
                desc: 'Pick your preferred date, arrival time, and charging duration with instant atomic slot reservation.',
                icon: CalendarCheck,
              },
              {
                step: '04',
                title: 'Plug In & Go',
                desc: 'Arrive at the station, present your confirmed booking reference, and plug in with guaranteed zero wait time.',
                icon: CheckCircle2,
              },
            ].map((item) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={item.step}
                  className="card"
                  style={{
                    padding: '2rem 1.5rem',
                    position: 'relative',
                    border: '1px solid var(--border)',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#E2E8F0',
                    lineHeight: 1,
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.5rem'
                  }}>
                    {item.step}
                  </div>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    <StepIcon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PLATFORM FEATURES GRID */}
      <section id="features" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 3.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Advanced Capabilities
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.35rem', marginBottom: '0.75rem' }}>
              Engineered for Modern Mobility
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Built with cutting-edge full-stack architecture to ensure reliability, security, and exceptional performance.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.75rem'
          }}>
            {[
              {
                icon: Search,
                title: 'Smart Discovery Engine',
                desc: 'Filter stations dynamically by city, power tier, connector compatibility, and operational status.'
              },
              {
                icon: Zap,
                title: 'Fast Charging Spectrum',
                desc: 'Compare charging speeds from 11 kW destination AC to 150 kW ultra-fast DC highway chargers.'
              },
              {
                icon: TrendingUp,
                title: 'Transparent Tariffs',
                desc: 'Clear per-kWh rates with immutable booking price snapshots so you always know your tariff up front.'
              },
              {
                icon: Cpu,
                title: 'Zero Race-Condition Engine',
                desc: 'Atomic write-locked database transactions guarantee that concurrent users never double-book a slot.'
              },
              {
                icon: CalendarCheck,
                title: 'Flexible Booking Management',
                desc: 'Review upcoming reservations, view historic sessions, and manage cancellations with clear cutoff policies.'
              },
              {
                icon: Smartphone,
                title: 'Mobile-Optimized Interface',
                desc: 'Fully responsive UI optimized across desktop, tablet, and mobile screens with touch-friendly controls.'
              }
            ].map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '1.75rem',
                    border: '1px solid var(--border)',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.05)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <FeatIcon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CLOSING CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(22, 163, 74, 0.2)',
            color: '#86EFAC',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            <Zap size={14} fill="#86EFAC" /> The Electric Future is Here
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Ready to Power Your Next Journey?
          </h2>

          <p style={{ fontSize: '1.1rem', color: '#94A3B8', maxWidth: 540, margin: '0 auto 2.25rem', lineHeight: 1.6 }}>
            Join smart EV drivers who save time by booking their slots in advance. Guaranteed availability, zero waiting.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/stations" className="btn btn-primary btn-lg">
              Find Stations Now <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
