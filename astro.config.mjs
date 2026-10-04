// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://eakietcoffee.com.vn',
  integrations: [tailwind()],
  // The awards page was folded into About (Hồ sơ pháp lý & Chứng nhận).
  redirects: {
    '/awards': '/about#chung-nhan',
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  build: {
    inlineStylesheets: 'auto',
  },
});
