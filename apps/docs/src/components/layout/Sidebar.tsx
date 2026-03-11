import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', path: '/docs/getting-started' },
      { label: 'Installation', path: '/docs/installation' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { label: 'Core', path: '/docs/api/core' },
      { label: 'React', path: '/docs/api/react' },
      { label: 'React Reel Player', path: '/docs/api/react-reel-player' },
      { label: 'React Lightbox', path: '/docs/api/react-lightbox' },
      { label: 'Vue', path: '/docs/api/vue', comingSoon: true },
      { label: 'Svelte', path: '/docs/api/svelte', comingSoon: true },
    ],
  },
  {
    title: 'Examples',
    items: [
      { label: 'Basic Slider', path: '/docs/examples/basic' },
      { label: 'Infinite List', path: '/docs/examples/infinite' },
      { label: 'Reel Player', path: '/docs/examples/reel-player' },
    ],
  },
] as const;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.title} className="nav-section">
              <h3 className="nav-section-title">{section.title}</h3>
              <ul className="nav-list">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}${'comingSoon' in item && item.comingSoon ? ' coming-soon' : ''}`}
                      onClick={onClose}
                    >
                      {item.label}
                      {'comingSoon' in item && item.comingSoon && (
                        <span className="badge-coming-soon">Soon</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
