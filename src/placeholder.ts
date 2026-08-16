import React from "react";

// Default avatar shown whenever a user/author has no image, or their image fails to load.
// This is a self-contained inline SVG (no network request at all), so it can never
// break due to a dead third-party CDN — unlike api.realworld.io / productionready.io,
// which this project's other assets rely on and which have proven unreliable.
export const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#ccc"/>
      <circle cx="50" cy="38" r="18" fill="#fff"/>
      <path d="M50 60c-22 0-38 12-38 30v10h76V90c0-18-16-30-38-30z" fill="#fff"/>
    </svg>`
  );

export function avatarUrl(image?: string | null): string {
  return image && image.trim() !== "" ? image : DEFAULT_AVATAR;
}

// Attach to <img onError={onAvatarError}> so a dead/broken image URL from the
// backend (not just a missing one) also falls back to the placeholder.
export function onAvatarError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (img.src !== DEFAULT_AVATAR) img.src = DEFAULT_AVATAR;
}
