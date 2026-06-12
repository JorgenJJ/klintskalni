import type { ImageMetadata } from 'astro';

// Alle bilder under src/images/ lastes inn ved bygg slik at de kan optimaliseres
// (flere størrelser + moderne formater) av Astro. Innholdsfilene refererer kun
// til filnavn (f.eks. "gallery/sea-view.jpg"), så en redaktør slipper kode.
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/images/**/*.{jpeg,jpg,png,webp,avif}',
  { eager: true },
);

/**
 * Slå opp et bilde fra dets filnavn/relative sti (slik det står i innholdsfilen).
 * Returnerer undefined hvis bildet mangler, slik at siden ikke krasjer.
 */
export function resolveImage(name: string | undefined): ImageMetadata | undefined {
  if (!name) return undefined;
  // Tåler både "gallery/x.jpg" og Sveltia-stier som "/src/images/gallery/x.jpg".
  const needle = name.replace(/^\/+/, '').replace(/^src\/images\//, '');
  const hit = Object.entries(images).find(([path]) => path.endsWith(`/src/images/${needle}`));
  return hit?.[1].default;
}
