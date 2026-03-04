/**
 * Pro Detector - Detects availability of AIOS Pro modules
 *
 * This module provides graceful detection of the optional @aios/pro package.
 * When Pro is not installed (community/free edition), all functions return
 * safe defaults that allow the pipeline to continue without Pro features.
 *
 * Pro features include:
 * - Memory Layer (memory-loader, progressive retrieval)
 * - License/Feature Gating (feature-gate, license-api)
 * - Extended agent capabilities
 *
 * Installation:
 *   Pro is distributed as a private npm package (@aios/pro).
 *   When installed, this module auto-detects it and enables Pro features.
 *
 * @module bin/utils/pro-detector
 * @see .aios-core/cli/commands/pro/index.js - Pro CLI commands
 */

'use strict';

const path = require('path');
const fs = require('fs');

/**
 * Cached detection result to avoid repeated filesystem checks.
 * @type {boolean|null}
 */
let _proAvailableCache = null;

/**
 * Resolved base path for Pro modules.
 * @type {string|null}
 */
let _proBasePath = null;

/**
 * Known Pro module search paths, in priority order.
 * @type {string[]}
 */
const PRO_SEARCH_PATHS = [
  // 1. Sibling directory (monorepo layout)
  path.resolve(__dirname, '..', '..', 'pro'),
  // 2. Inside .aios-core (bundled)
  path.resolve(__dirname, '..', '..', '.aios-core', 'pro'),
  // 3. npm package in project node_modules
  path.resolve(__dirname, '..', '..', 'node_modules', '@aios', 'pro'),
  // 4. npm package in .aios-core node_modules
  path.resolve(__dirname, '..', '..', '.aios-core', 'node_modules', '@aios', 'pro'),
];

/**
 * Check if AIOS Pro is available in the current installation.
 *
 * Searches known paths for the Pro package and caches the result.
 * Returns false gracefully when Pro is not installed (community edition).
 *
 * @returns {boolean} true if Pro modules are available
 */
function isProAvailable() {
  if (_proAvailableCache !== null) {
    return _proAvailableCache;
  }

  // Check each search path
  for (const searchPath of PRO_SEARCH_PATHS) {
    try {
      const indexPath = path.join(searchPath, 'index.js');
      const packagePath = path.join(searchPath, 'package.json');

      if (fs.existsSync(indexPath) || fs.existsSync(packagePath)) {
        _proBasePath = searchPath;
        _proAvailableCache = true;
        return true;
      }
    } catch {
      // Continue searching
    }
  }

  // Also try require.resolve as last resort
  try {
    require.resolve('@aios/pro');
    _proBasePath = path.dirname(require.resolve('@aios/pro'));
    _proAvailableCache = true;
    return true;
  } catch {
    // @aios/pro not installed
  }

  _proAvailableCache = false;
  return false;
}

/**
 * Load a Pro module by relative path.
 *
 * Attempts to require a module from the Pro package.
 * Returns null gracefully when Pro is not installed.
 *
 * @param {string} modulePath - Relative path within the Pro package
 *   (e.g., 'memory/memory-loader', 'license/feature-gate')
 * @returns {*|null} The loaded module, or null if unavailable
 *
 * @example
 * const MemoryLoader = loadProModule('memory/memory-loader');
 * if (MemoryLoader) {
 *   const loader = new MemoryLoader(projectRoot);
 *   const memories = await loader.loadForAgent('dev');
 * }
 */
function loadProModule(modulePath) {
  if (!isProAvailable() || !_proBasePath) {
    return null;
  }

  try {
    const fullPath = path.join(_proBasePath, modulePath);
    return require(fullPath);
  } catch (error) {
    // Module exists in Pro but failed to load — log but don't crash
    if (process.env.AIOS_DEBUG) {
      console.warn(`[pro-detector] Failed to load pro module '${modulePath}':`, error.message);
    }
    return null;
  }
}

/**
 * Get the resolved Pro base path (if available).
 * Useful for debugging and diagnostics.
 *
 * @returns {string|null} Absolute path to Pro package root, or null
 */
function getProBasePath() {
  isProAvailable(); // Ensure detection has run
  return _proBasePath;
}

/**
 * Reset the detection cache.
 * Primarily used for testing.
 */
function resetCache() {
  _proAvailableCache = null;
  _proBasePath = null;
}

module.exports = {
  isProAvailable,
  loadProModule,
  getProBasePath,
  resetCache,
};
