import type { APIRoute } from 'astro';
import { sparkPath, SPARK_VIEWBOX } from '../data/tech';

/** The favicon is the skills spark, drawn from the same data as the Technologies section. */
export const GET: APIRoute = () =>
  new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SPARK_VIEWBOX}"><path d="${sparkPath}" fill="none" stroke="#d97757" stroke-width="12" stroke-linecap="round"/></svg>`,
    { headers: { 'Content-Type': 'image/svg+xml' } },
  );
