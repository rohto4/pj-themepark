import '@fontsource-variable/atkinson-hyperlegible-next';
import '@fontsource-variable/fraunces';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App';
import './styles/morrowlight.css';

const root = document.querySelector('#root');

if (!root) throw new Error('Morrowlight could not find its arrival gate.');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
