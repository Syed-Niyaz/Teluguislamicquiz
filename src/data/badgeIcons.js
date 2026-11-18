// Badge icon registry.
//
// The 10 badge images live in `src/assets/badges/`. Each badge is mapped to
// one file below — change the filename here if you replace an icon.
// If a file is missing, the built-in line icon is used as a fallback.

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

// Badge id → icon file in src/assets/badges/
export const BADGE_ICON_FILES = {
  niyyat: '3d-target.png',
  talib: 'goal (1).png',
  sabr: 'award.png',
  rah: 'rating.png',
  nurani: 'good-job.png',
  fath: 'confetti.png',
  jawahir: 'gold-bars.png',
  istiqamat: 'trophy.png',
  barakat: 'winner.png',
  nurul: 'winning.png'
};

/** Returns the URL of a badge icon file, or null when none exists. */
export function getBadgeIcon(badge) {
  if (!badge) return null;
  const mapped = BADGE_ICON_FILES[badge.id];
  return (
    (mapped && registry[normalise(mapped)]) ||
    registry[normalise(badge.id)] ||
    registry[normalise(badge.iconKey)] ||
    null
  );
}

export default getBadgeIcon;
