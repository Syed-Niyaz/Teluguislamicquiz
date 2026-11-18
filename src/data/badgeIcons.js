// Badge icon registry.
//
// Drop your own icon files into `src/assets/badges/` and they are picked up
// automatically — no code changes needed.
//
//   src/assets/badges/niyyat.svg   (matches badge id)
//   src/assets/badges/sprout.png   (matches badge iconKey)
//
// Supported formats: .svg, .png, .webp, .jpg, .jpeg
// Filename matching is case-insensitive and ignores spaces, dashes and the
// optional "badge"/"icon" prefix. If no file matches, the component falls
// back to the built-in line icons.

const files = import.meta.glob('../assets/badges/*.{svg,png,webp,jpg,jpeg}', {
  query: '?url',
  import: 'default',
  eager: true
});

const normalise = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\.(svg|png|webp|jpe?g)$/i, '')
    .replace(/^(badge|icon)[-_\s]*/i, '')
    .replace(/[-_\s]/g, '');

const registry = Object.entries(files).reduce((acc, [path, url]) => {
  const name = path.split('/').pop();
  const key = normalise(name);
  if (key) acc[key] = url;
  return acc;
}, {});

/** Returns the URL of a custom badge icon file, or null when none exists. */
export function getBadgeIcon(badge) {
  if (!badge) return null;
  return (
    registry[normalise(badge.id)] ||
    registry[normalise(badge.iconKey)] ||
    null
  );
}

export default getBadgeIcon;
