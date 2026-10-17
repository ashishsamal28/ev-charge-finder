import React from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = Search,
  title = 'No results found',
  description = 'Try adjusting your search criteria or filters.',
  actionText,
  actionLink,
  onAction,
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '3.5rem 1.5rem',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border)',
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: '#F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem',
        color: 'var(--text-secondary)'
      }}>
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.35rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: 420, marginBottom: '1.25rem' }}>
        {description}
      </p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button onClick={onAction} className="btn btn-outline btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
}
