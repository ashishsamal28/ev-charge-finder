import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Heart, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--navy)',
      color: '#F8FAFC',
      padding: '4rem 0 2rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Zap size={20} fill="#FFFFFF" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                EV Charge Finder
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Empowering electric vehicle drivers with seamless discovery, transparent tariffs, and guaranteed slot reservations across India.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(22, 163, 74, 0.15)',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.775rem',
              color: '#4ADE80',
              fontWeight: 500
            }}>
              <ShieldCheck size={14} /> Academic Demonstration Project
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/" style={{ color: '#94A3B8', fontSize: '0.9rem', transition: 'var(--transition)' }}>
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/stations" style={{ color: '#94A3B8', fontSize: '0.9rem', transition: 'var(--transition)' }}>
                  Find Stations
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" style={{ color: '#94A3B8', fontSize: '0.9rem', transition: 'var(--transition)' }}>
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#features" style={{ color: '#94A3B8', fontSize: '0.9rem', transition: 'var(--transition)' }}>
                  Platform Features
                </a>
              </li>
              <li>
                <Link to="/my-bookings" style={{ color: '#94A3B8', fontSize: '0.9rem', transition: 'var(--transition)' }}>
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Demonstration Coverage */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Coverage Network
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Sample high-speed charging hubs live across Indian Tier-1 metropolitan centers:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Gurugram'].map((city) => (
                <span
                  key={city}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#E2E8F0',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Policies & Support
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/privacy" style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                  Terms & Conditions
                </Link>
              </li>
              <li style={{ color: '#94A3B8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Mail size={14} /> demo-support@evchargefinder.local
              </li>
              <li style={{ color: '#94A3B8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} /> College Project Evaluation Showcase
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} EV Charge Finder. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span>Built with precision for next-gen electric mobility</span>
            <Heart size={14} style={{ color: '#16A34A' }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
