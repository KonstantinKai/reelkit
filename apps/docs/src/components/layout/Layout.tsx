import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { ScrollToTop } from '../ScrollToTop';
import { RouteProgressBar } from '../ui/RouteProgressBar';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const showSidebar = location.pathname.startsWith('/docs');

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
      <ScrollToTop />
      <RouteProgressBar />
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
        <Footer />
      </main>
    </div>
  );
}
