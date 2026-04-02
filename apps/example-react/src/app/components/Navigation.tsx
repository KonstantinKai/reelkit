import { Link, useLocation } from 'react-router-dom';

const navStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  boxSizing: 'border-box',
  zIndex: 1000,
  display: 'flex',
  gap: 6,
  padding: '8px 12px',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  background:
    'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
};

const linkStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: 8,
  fontSize: '0.8rem',
  transition: 'background-color 0.2s',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  backgroundColor: 'rgba(255,255,255,0.9)',
  color: '#000',
};

const links = [
  { to: '/', label: 'Full Page Slider' },
  { to: '/reel-player', label: 'Reel Player' },
  { to: '/reel-player-custom', label: 'Custom Player' },
  { to: '/image-preview', label: 'Image Gallery' },
  { to: '/image-preview-custom', label: 'Custom Gallery' },
  { to: '/image-preview-video', label: 'Video Gallery' },
  { to: '/stories-player', label: 'Stories Player' },
  { to: '/stories-player-custom', label: 'Custom Stories' },
];

function Navigation() {
  const location = useLocation();

  return (
    <nav style={navStyle}>
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          style={location.pathname === to ? activeLinkStyle : linkStyle}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default Navigation;
