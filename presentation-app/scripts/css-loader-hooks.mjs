/**
 * Module loader hooks for running Vite-oriented code in Node.js:
 * - Resolves .css imports to empty modules
 * - Polyfills import.meta.env in loaded source files
 *
 * Registered by css-loader.mjs via node:module register().
 */

const ENV_POLYFILL = 'if(!import.meta.env)Object.defineProperty(import.meta,"env",{value:{},configurable:true});\n';

export function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.css')) {
    return { url: 'data:text/javascript,export default {}', shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);

  // Inject import.meta.env polyfill into JS/TS modules from our source tree
  if (
    result.format === 'module' &&
    typeof result.source === 'string' &&
    url.includes('/src/')
  ) {
    return { ...result, source: ENV_POLYFILL + result.source };
  }

  return result;
}
