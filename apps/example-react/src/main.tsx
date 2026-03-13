import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './app/App';
import FullPageSlider from './app/pages/FullPageSlider';
import ReelPlayerPage from './app/pages/ReelPlayerPage';
import ReelPlayerCustomPage from './app/pages/ReelPlayerCustomPage';
import ImagePreviewPage from './app/pages/ImagePreviewPage';
import ImagePreviewCustomPage from './app/pages/ImagePreviewCustomPage';
import ImagePreviewVideoPage from './app/pages/ImagePreviewVideoPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<FullPageSlider />} />
          <Route path="reel-player" element={<ReelPlayerPage />} />
          <Route path="reel-player-custom" element={<ReelPlayerCustomPage />} />
          <Route path="image-preview" element={<ImagePreviewPage />} />
          <Route
            path="image-preview-custom"
            element={<ImagePreviewCustomPage />}
          />
          <Route
            path="image-preview-video"
            element={<ImagePreviewVideoPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
