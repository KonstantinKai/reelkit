import { Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import GettingStarted from './pages/docs/GettingStarted';
import Installation from './pages/docs/Installation';
import CoreApi from './pages/docs/api/Core';
import ReactApi from './pages/docs/api/React';
import ReactReelPlayerApi from './pages/docs/api/ReactReelPlayer';
import ReactLightboxApi from './pages/docs/api/ReactLightbox';
import VueApi from './pages/docs/api/Vue';
import SvelteApi from './pages/docs/api/Svelte';
import BasicExample from './pages/docs/examples/Basic';
import InfiniteExample from './pages/docs/examples/Infinite';
import ReelPlayerExample from './pages/docs/examples/ReelPlayer';

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Home page without sidebar */}
      <Route path="/" element={<Layout showSidebar={false} />}>
        <Route index element={<Home />} />
      </Route>
      {/* Docs pages with sidebar */}
      <Route path="/docs" element={<Layout showSidebar={true} />}>
        <Route path="getting-started" element={<GettingStarted />} />
        <Route path="installation" element={<Installation />} />
        <Route path="api/core" element={<CoreApi />} />
        <Route path="api/react" element={<ReactApi />} />
        <Route path="api/react-reel-player" element={<ReactReelPlayerApi />} />
        <Route path="api/react-lightbox" element={<ReactLightboxApi />} />
        <Route path="api/vue" element={<VueApi />} />
        <Route path="api/svelte" element={<SvelteApi />} />
        <Route path="examples/basic" element={<BasicExample />} />
        <Route path="examples/infinite" element={<InfiniteExample />} />
        <Route path="examples/reel-player" element={<ReelPlayerExample />} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
