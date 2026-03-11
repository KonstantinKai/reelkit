import { Link, useLocation } from 'react-router-dom';

const navStyle: React.CSSProperties = {
  position: 'fixed',
  top: 16,
  left: 16,
  zIndex: 1000,
  display: 'flex',
  gap: 8,
};

const linkStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: 'rgba(0,0,0,0.6)',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: 8,
  fontSize: '0.85rem',
  transition: 'background-color 0.2s',
};

const activeLinkStyle: React.CSSProperties = {
  ...linkStyle,
  backgroundColor: 'rgba(255,255,255,0.9)',
  color: '#000',
};

function Navigation() {
  const location = useLocation();

  return (
    <nav style={navStyle}>
      <Link
        to="/"
        style={location.pathname === '/' ? activeLinkStyle : linkStyle}
      >
        Full Page Slider
      </Link>
      <Link
        to="/reel-player"
        style={location.pathname === '/reel-player' ? activeLinkStyle : linkStyle}
      >
        Reel Player
      </Link>
      <Link
        to="/image-preview"
        style={location.pathname === '/image-preview' ? activeLinkStyle : linkStyle}
      >
        Image Gallery
      </Link>
    </nav>
  );
}

export default Navigation;
