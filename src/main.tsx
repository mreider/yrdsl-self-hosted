import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import siteRaw from '../site.json';
import itemsRaw from '../items.json';
import { SaleItem, SaleSite } from './vendor/core/sale.js';
import { SaleViewer } from './vendor/viewer/index.js';
import './vendor/viewer/styles.css';

// Parse at boot so typos in JSON surface immediately in the console
// instead of silently producing a broken render.
const site = SaleSite.parse(siteRaw);
const items = SaleItem.array().parse(itemsRaw);

// Set the document title from the sale name.
document.title = site.siteName;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SaleViewer site={site} items={items} />
  </StrictMode>,
);
