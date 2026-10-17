import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Zap, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function StationCard({ station }) {
  const isAvailable = station.operational_chargers_count > 0;

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      transition: 'var(--transition)'
    }}>
      {/* Top Banner with visual gradient & status badge */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#86EFAC',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Zap size={14} fill="#86EFAC" /> {station.city}
          </span>
          <span className={`badge ${isAvailable ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
            {isAvailable ? `${station.operational_chargers_count} Available` : 'Busy / Reserved'}
          </span>
        </div>

        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          marginTop: '0.5rem',
          lineHeight: 1.3,
          color: '#F8FAFC'
        }}>
          {station.name}
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.825rem',
          color: '#94A3B8',
          marginTop: '0.4rem'
        }}>
          <MapPin size={14} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {station.address}
          </span>
        </div>
      </div>

      {/* Content Specs */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '1rem' }}>
        {/* Connector pills & Max Power */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          {station.connector_types?.map((type) => (
            <span
              key={type}
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#F1F5F9',
                color: 'var(--navy-light)',
                border: '1px solid var(--border)'
              }}
            >
              {type}
            </span>
          ))}

          {station.max_power_kw > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                color: 'var(--primary)',
                marginLeft: 'auto'
              }}
            >
              Up to {station.max_power_kw} kW
            </span>
          )}
        </div>

        {/* Pricing & Hours Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 0',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Tariff from</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>
              ₹{station.min_price_per_kwh?.toFixed(1) || '0.0'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}> / kWh</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
              <Clock size={12} /> Opening Hours
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>
              {station.opening_hours || '24/7'}
            </span>
          </div>
        </div>

        {/* Amenities preview */}
        {station.amenities?.length > 0 && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {station.amenities.slice(0, 3).join(' • ')}
              {station.amenities.length > 3 && ` +${station.amenities.length - 3}`}
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <Link
            to={`/stations/${station.id}`}
            className="btn btn-outline btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Details
          </Link>
          <Link
            to={`/stations/${station.id}`}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Book Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
