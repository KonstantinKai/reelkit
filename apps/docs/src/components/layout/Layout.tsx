import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const showSidebar = location.pathname.startsWith('/docs');

  // Close mobile sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onMenuToggle={
          showSidebar ? () => setIsSidebarOpen(!isSidebarOpen) : undefined
        }
        isMenuOpen={showSidebar ? isSidebarOpen : undefined}
        showNav={true}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        showDesktop={showSidebar}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main
        className={`flex-1 pt-16 transition-all duration-300 ${
          showSidebar ? 'lg:pl-64' : ''
        }`}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
