// Injected during build with the full module map: { [packageName]: { file, core?, bundle? } }
export const modules = null;

// Base URL prepended to every module file fetch. Override via configure() before first load.
let _baseUrl = './codemirror/';

// Replaceable transport function. Receives the full URL, must return Promise<string> (JS source).
let _loader = (url) => fetch(url).then((r) => r.text());

/**
 * Configure the loader before any modules are requested.
 *
 * @param {object} options
 * @param {string} [options.baseUrl] - Directory URL where module files are served from.
 *   Trailing slash is added automatically. Defaults to './codemirror/'.
 * @param {(url: string) => Promise<string>} [options.loader] - Custom transport function.
 *   Replaces the default fetch-based loader. Useful for WebView asset registries,
 *   XMLHttpRequest, or any environment without fetch.
 */
export function configure({ baseUrl, loader } = {}) {
  if (baseUrl !== undefined) {
    _baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  }
  if (typeof loader === 'function') {
    _loader = loader;
  }
}

// Resolved exports for every module that has been loaded, keyed by package name.
// Stubs ({}) are inserted before loading begins so circular dependencies get the same reference.
const moduleCache = new Map();

// Tracks stubs that are still being populated (loading in progress).
const _pendingStubs = new Set();

// In-flight load Promises keyed by package name. Concurrent external callers for the
// same module await this Promise to get fully populated exports rather than the empty stub.
const _loadingPromises = new Map();

// Singleton promise for the core bundle load. All 14 core packages share one fetch.
let _coreBundlePromise = null;

/**
 * Fetches _core.js once and initialises all core packages in dependency order.
 * Each package's exports are merged into any pre-existing cache stub so that
 * callers that received a stub reference before the bundle finished still get
 * the populated object.
 */
function _loadCoreBundle() {
  if (_coreBundlePromise) return _coreBundlePromise;
  _coreBundlePromise = _loader(_baseUrl + '_core.js')
    .then(async (code) => {
      // eval returns the moduleInitFunction reference defined at the end of the bundle.
      // The trailing ';moduleInitFunction' is required because ESM is always strict —
      // strict-mode eval does not leak function declarations into the outer scope.
      const bundleInit = eval(code + ';moduleInitFunction');
      const bundleExports = await bundleInit(requireAsyncModule);
      for (const [name, exports] of Object.entries(bundleExports)) {
        const stub = moduleCache.get(name);
        if (stub) {
          // Populate the stub that was cached before the bundle loaded (covers
          // the case where multiple core modules were requested in parallel).
          Object.assign(stub, exports);
        } else {
          moduleCache.set(name, exports);
        }
      }
    });
  return _coreBundlePromise;
}

async function _asyncLoad(moduleName, moduleExports) {
  const info = modules[moduleName];
  if (info.bundle) {
    // Core module: load the shared bundle instead of an individual file.
    await _loadCoreBundle();
    const cached = moduleCache.get(moduleName);
    if (cached && cached !== moduleExports) Object.assign(moduleExports, cached);
    return moduleExports;
  }
  const code = await _loader(_baseUrl + info.file + '.js');
  const moduleInitFunction = eval(code + ';moduleInitFunction');
  const result = await moduleInitFunction(requireAsyncModule, moduleExports);
  // If the module replaced module.exports entirely (e.g. rollup CJS interop
  // assigns the default export), copy named exports back into the cached stub
  // so both existing stub references and future cache hits get the full object.
  if (result !== moduleExports && result instanceof Object) {
    Object.assign(moduleExports, result);
  }
  return moduleExports;
}

/**
 * Asynchronously loads a CodeMirror module by package name and returns its exports.
 * Results are cached — repeated calls for the same name return the cached value immediately.
 * A stub object is stored in the cache before loading begins, so circular dependencies
 * between modules receive the same reference that will be populated once loading completes.
 *
 * @param {string} moduleName - npm package name, e.g. '@codemirror/state'
 * @returns {object|Promise<object>} Cached exports (sync) or a Promise resolving to exports.
 */
export function requireAsyncModule(moduleName) {
  if (moduleCache.has(moduleName)) {
    const cached = moduleCache.get(moduleName);
    if (_pendingStubs.has(cached)) return _loadingPromises.get(moduleName);
    return cached;
  }
  const moduleExports = {};
  _pendingStubs.add(moduleExports);
  moduleCache.set(moduleName, moduleExports);
  const promise = _asyncLoad(moduleName, moduleExports).then((result) => {
    _pendingStubs.delete(moduleExports);
    _loadingPromises.delete(moduleName);
    return result;
  });
  _loadingPromises.set(moduleName, promise);
  return promise;
}
