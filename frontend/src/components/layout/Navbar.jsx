import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Menu, X, User as UserIcon, Calendar, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      height: '70px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
          }}>
            <Zap size={22} fill="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.1 }}>
              EV Charge Finder
            </span>
            <span style={{ fontSize: '0.675rem', fontWeight: 600, color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Find. Charge. Go.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
          <Link
            to="/"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive('/') && location.pathname === '/' ? 'var(--primary)' : 'var(--navy-light)',
              transition: 'var(--transition)'
            }}
          >
            Home
          </Link>
          <Link
            to="/stations"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive('/stations') ? 'var(--primary)' : 'var(--navy-light)',
              transition: 'var(--transition)'
            }}
          >
            Find Stations
          </Link>
          <a
            href="/#how-it-works"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--navy-light)', transition: 'var(--transition)' }}
          >
            How It Works
          </a>
          <a
            href="/#features"
            style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--navy-light)', transition: 'var(--transition)' }}
          >
            Features
          </a>

          {isAuthenticated && (
            <Link
              to="/my-bookings"
              style={{
                fontSize: '0.925rem',
                fontWeight: 500,
                color: isActive('/my-bookings') ? 'var(--primary)' : 'var(--navy-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Calendar size={16} />
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="badge badge-warning"
              style={{ padding: '0.35rem 0.65rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Shield size={14} />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Auth CTA or User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-auth">
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '9999px',
                  backgroundColor: userDropdownOpen ? '#F1F5F9' : '#FFFFFF'
                }}
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-subtle)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.full_name?.split(' ')[0]}</span>
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '210px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  zIndex: 100
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>{user?.full_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
                    <span className="badge badge-info" style={{ marginTop: '0.35rem', textTransform: 'capitalize' }}>
                      {user?.role}
                    </span>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--navy-light)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--navy-light)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <Calendar size={16} /> My Bookings
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--navy-light)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <UserIcon size={16} /> Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        color: 'var(--warning)',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Shield size={16} /> Admin Portal
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      color: 'var(--error)',
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: 'var(--navy)'
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 70,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 49,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          borderTop: '1px solid var(--border)'
        }}>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)' }}
          >
            Home
          </Link>
          <Link
            to="/stations"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)' }}
          >
            Find Stations
          </Link>
          <a
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)' }}
          >
            How It Works
          </a>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)' }}
          >
            Features
          </a>

          {isAuthenticated ? (
            <>
              <div style={{ height: 1, backgroundColor: varColorBorder }} />
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500 }}>
                Dashboard
              </Link>
              <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500 }}>
                My Bookings
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 500 }}>
                Profile ({user?.full_name})
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--warning)' }}>
                  Admin Portal
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ marginTop: '1rem' }}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline" style={{ width: '100%' }}>
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav, .desktop-auth {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}

const varColorBorder = 'var(--border)';
