import { Link } from 'react-router-dom';
import { Github, Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Header.css';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export default function Header({ onMenuToggle, isMenuOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          {onMenuToggle && (
            <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
          <Link to="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">reelkit</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/docs/getting-started" className="nav-link">Docs</Link>
          <Link to="/docs/api/react" className="nav-link">API</Link>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link github-link"
          >
            <Github size={20} />
          </a>
        </nav>
      </div>
    </header>
  );
}
