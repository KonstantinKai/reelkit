import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111',
        color: '#fff',
        textAlign: 'center',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          fontSize: 120,
          fontWeight: 800,
          color: 'rgba(255,255,255,0.08)',
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
        Page not found
      </h1>
      <p
        style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: 14,
          marginBottom: 32,
        }}
      >
        This page doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          padding: '10px 24px',
          borderRadius: 8,
          backgroundColor: '#fff',
          color: '#000',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Back to demos
      </Link>
    </div>
  );
}
