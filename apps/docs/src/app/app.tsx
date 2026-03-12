import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '../components/ScrollToTop';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import GettingStarted from '../pages/docs/GettingStarted';
import Installation from '../pages/docs/Installation';
import SSR from '../pages/docs/SSR';
import CoreApi from '../pages/docs/api/Core';
import ReactApi from '../pages/docs/api/React';
import ReactReelPlayerApi from '../pages/docs/api/ReactReelPlayer';
import ReactLightboxApi from '../pages/docs/api/ReactLightbox';
import VueApi from '../pages/docs/api/Vue';
import SvelteApi from '../pages/docs/api/Svelte';
import BasicExample from '../pages/docs/examples/Basic';
import InfiniteExample from '../pages/docs/examples/Infinite';
import ReelPlayerExample from '../pages/docs/examples/ReelPlayer';
import LightboxExample from '../pages/docs/examples/Lightbox';

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
          <Route path="docs/api/core" element={<CoreApi />} />
          <Route path="docs/api/react" element={<ReactApi />} />
          <Route
            path="docs/api/react-reel-player"
            element={<ReactReelPlayerApi />}
          />
          <Route
            path="docs/api/react-lightbox"
            element={<ReactLightboxApi />}
          />
          <Route path="docs/api/vue" element={<VueApi />} />
          <Route path="docs/api/svelte" element={<SvelteApi />} />
          <Route path="docs/examples/basic" element={<BasicExample />} />
          <Route path="docs/examples/infinite" element={<InfiniteExample />} />
          <Route
            path="docs/examples/reel-player"
            element={<ReelPlayerExample />}
          />
          <Route path="docs/examples/lightbox" element={<LightboxExample />} />
        </Route>
      </Routes>
    </>
  );
}
