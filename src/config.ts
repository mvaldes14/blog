// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "MValdes";
export const SITE_DESCRIPTION =
  "Thoughts and not prayers";
export const TWITTER_HANDLE = "@mrmvaldes";
export const MY_NAME = "Miguel Valdes";

// setup in astro.config.mjs
const BASE_URL = new URL(import.meta.env.SITE);
export const SITE_URL = BASE_URL.origin;
