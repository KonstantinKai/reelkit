/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createSignal, reaction, Observe } from '@reelkit/react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { ScrollToTop } from '../ScrollToTop';
import { RouteProgressBar } from '../ui/RouteProgressBar';
import FrameworkSwitcher from '../FrameworkSwitcher';
import {
  frameworkSignal,
  frameworkRoutePairs,
} from '../../data/frameworkSignal';

export default function Layout() {
  const [sidebarOpen] = useState(() => createSignal(false));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    return reaction(
      () => [frameworkSignal],
      () => {
        const fw = frameworkSignal.value;
        const path = window.location.pathname;
        const fromIdx = fw === 'angular' ? 0 : 1;
        const toIdx = fw === 'angular' ? 1 : 0;
        const pair = frameworkRoutePairs.find((p) => p[fromIdx] === path);
        if (pair) navigate(pair[toIdx], { replace: true });
      },
    );
  }, [navigate]);

  const showSidebar = location.pathname.startsWith('/docs');

  useEffect(() => {
    sidebarOpen.value = false;
  }, [location.pathname]);

  useEffect(() => {
    return reaction(
      () => [sidebarOpen],
      () => {
        document.body.style.overflow = sidebarOpen.value ? 'hidden' : '';
      },
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <RouteProgressBar />
      <Observe signals={[sidebarOpen]}>
        {() => (
          <>
            <Header
              onMenuToggle={
                showSidebar
                  ? () => (sidebarOpen.value = !sidebarOpen.value)
                  : undefined
              }
              isMenuOpen={showSidebar ? sidebarOpen.value : undefined}
              showNav={true}
            />
            <Sidebar
              isOpen={sidebarOpen.value}
              showDesktop={showSidebar}
              onClose={() => (sidebarOpen.value = false)}
            />
          </>
        )}
      </Observe>
      {showSidebar && <FrameworkSwitcher />}
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
