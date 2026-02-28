/**
 * Node.js module hook registration for running Vite-oriented code in Node.js.
 * Handles .css imports and import.meta.env polyfilling.
 *
 * Usage: tsx --import ./scripts/css-loader.mjs ...
 */

import { register } from 'node:module';

register('./css-loader-hooks.mjs', import.meta.url);
