import type { APIRoute } from 'astro';
// The site stylesheet compiled by Tailwind, served at a stable URL for Decap's preview pane (public/admin/cms.js).
import css from '../../styles/global.css?inline';

export const prerender = true;

export const GET: APIRoute = () => new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });
