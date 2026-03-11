import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import './Layout.css';

interface LayoutProps {
  showSidebar?: boolean;
}

export default function Layout({ showSidebar = true }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Header
        onMenuToggle={showSidebar ? () => setIsSidebarOpen(!isSidebarOpen) : undefined}
        isMenuOpen={showSidebar ? isSidebarOpen : undefined}
      />
      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}
      <main className={`main-content ${showSidebar ? 'with-sidebar' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
