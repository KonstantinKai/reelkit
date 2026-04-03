import { StrictMode } from 'react';
import { RouterProvider } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import { setCdnBase } from '@reelkit/example-data';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './app/app';
import './styles.css';

if (import.meta.env.DEV) setCdnBase('/cdn');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
