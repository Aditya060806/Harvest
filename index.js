// Public entry point for the `harvest-scan` package.
// The core engine ships inside this package (packages/core) so it installs
// cleanly from npm with no unpublished scoped dependencies.
export { scan, fix, getRating, DEFAULT_WEIGHTS } from './packages/core/src/index.js';
export { scan as default } from './packages/core/src/index.js';
