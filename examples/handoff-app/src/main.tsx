import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// The design system: tokens, theme, base layer and every component's styles,
// pre-compiled. Then the font files, then this app's page layout.
import 'instacart-ps-ds/standalone.css';
import '@fontsource-variable/dm-sans';
import './app.css';

import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
