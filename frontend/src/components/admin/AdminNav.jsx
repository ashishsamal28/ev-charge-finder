import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MapPin, Zap, Calendar, Shield } from 'lucide-react';

export default function AdminNav() {
  const navItems = [
    { to: '/admin', label: 'Platform Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/stations', label: 'Stations Management', icon: MapPin },
    { to: '/admin/chargers', label: 'Charger Bays', icon: Zap },
    { to: '/admin/bookings', label: 'All Reservations', icon: Calendar },
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      backgroundColor: '#FFFFFF',
      padding: '0.5rem',
      borderRadius: 'var(--radius)',
      border: '1px solid var(--border)',
      marginBottom: '2rem'
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: 600,
              textDecoration: 'none',
              backgroundColor: isActive ? 'var(--navy)' : 'transparent',
              color: isActive ? '#FFFFFF' : 'var(--navy-light)',
              transition: 'var(--transition)'
            })}
          >
            <Icon size={16} />
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
}
