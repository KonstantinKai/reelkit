import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '../components/ScrollToTop';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import GettingStarted from '../pages/docs/GettingStarted';
import Installation from '../pages/docs/Installation';
import SSR from '../pages/docs/SSR';
import CoreGuide from '../pages/docs/core/Guide';
import CoreApi from '../pages/docs/core/Api';
import ReactGuide from '../pages/docs/react/Guide';
import ReactApi from '../pages/docs/react/Api';
import ReelPlayer from '../pages/docs/ReelPlayer';
import Lightbox from '../pages/docs/Lightbox';
import Changelog from '../pages/docs/Changelog';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="docs/getting-started" element={<GettingStarted />} />
          <Route path="docs/installation" element={<Installation />} />
          <Route path="docs/ssr" element={<SSR />} />
          <Route path="docs/core/guide" element={<CoreGuide />} />
          <Route path="docs/core/api" element={<CoreApi />} />
          <Route path="docs/react/guide" element={<ReactGuide />} />
          <Route path="docs/react/api" element={<ReactApi />} />
          <Route path="docs/reel-player" element={<ReelPlayer />} />
          <Route path="docs/lightbox" element={<Lightbox />} />
          <Route path="docs/changelog" element={<Changelog />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
        </Route>
      </Routes>
    </>
  );
}
