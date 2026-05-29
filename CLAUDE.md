# CLAUDE.md — Project context for @actualwave/codemirror-package

## What this project is

A build tool + runtime loader that packages CodeMirror 6 and related libraries for use in
React Native WebViews (or any environment without a bundler). The output (`docs/` or `dist/`)
is a directory of browser-loadable JS files that a WebView can fetch and execute on demand.

This is NOT a normal npm library with a source/dist split. The build script (`start.js`) runs
via `postinstall` in the **consumer** project, transforming packages from `node_modules/` into
async-loadable modules. Everything in `dist/` and `docs/` is **generated** — do not edit those
files directly.

## Project structure

```
start.js                  — build script, run via `node start.js` or `npm start`
requireAsyncModule.js     — source template for the runtime loader (injected with module map at build time)
index.js                  — browser facade: createEditor(), registerExtension(), etc.
rollup.serve.config.js    — dev server (rollup --serve), for testing docs/ locally
docs/                     — built output, served statically (GitHub Pages / WebView asset dir)
docs/codemirror/          — individual module JS files (one per package)
docs/codemirror/_core.js  — all 14 core packages concatenated into one bundle
docs/requireAsyncModule.js — loader with module map baked in
docs/index.js             — the browser facade
dist/                     — same as docs/ (build artefact, gitignored)
```

## Build pipeline (`start.js`)

For each package:

1. **Resolve entry** — reads `package.json` to find the CJS entry (`exports.require` or `main`).
   Sub-path imports (e.g. `@babel/runtime/helpers/interopRequireDefault`) have no `package.json`
   of their own, so fallback is `node_modules/<packageName>.js`.

2. **Rollup pre-bundle** (`bundleToSingleFile`) — runs rollup with `@rollup/plugin-commonjs` to
   collapse all *relative* requires (`./color`, `./dark`, etc.) into a single CJS file.
   External npm packages remain as `require('pkg')` calls.

   **Critical**: After rollup, the code replaces `getDefaultExportFromCjs` with an identity
   function. Rollup generates this helper to "unwrap" `__esModule` modules to just their
   default export, which loses named exports like `createTheme`. The identity keeps the full
   exports object intact.

   ```js
   code = code.replace(
     /function getDefaultExportFromCjs\s*\([^)]*\)\s*\{[^}]+\}/,
     'function getDefaultExportFromCjs(x){return x}',
   );
   ```

3. **Babel IoC transform** — `@actualwave/babel-ioc-dep-wrap-plugin` wraps the entire file in
   `async function moduleInitFunction(requireAsyncModule, exports={})` and converts every
   `require('pkg')` to `await requireAsyncModule('pkg')`. Also runs `babel-preset-minify`.

4. **Transitive deps scan** — after all listed packages are built, the script scans every output
   file for `requireAsyncModule('...')` calls and processes any that aren't in the module map yet.
   This is how `@babel/runtime/helpers/*` get picked up without being listed explicitly.

5. **Core bundle** — the 14 core packages (in `CORE_PACKAGES`) are concatenated into `_core.js`
   with renamed init functions, loaded as one fetch instead of 14.

6. **Module map** — `modules.json` maps every package name to its file and flags:
   `{ file: 'filename-without-ext', core?: true, bundle?: '_core' }`.
   This map is injected into `requireAsyncModule.js` at build time.

## Runtime loader (`requireAsyncModule.js`)

Key design decisions:

- **Stub-first caching**: before loading starts, an empty `{}` stub is stored in `moduleCache`.
  Circular dependencies get this same object reference, which is populated once loading finishes.

- **`_asyncLoad` return contract**: after running `moduleInitFunction`, if the result is different
  from the cached stub (i.e. the module did `module.exports = something`), we
  `Object.assign(stub, result)` to populate the stub with all enumerable properties.
  This handles two cases:
  - Plain objects: `@uiw/codemirror-themes` returns `{ createTheme, default, __esModule }` —
    all named exports land on the stub.
  - Functions: `@babel/runtime` helpers do `module.exports = fn; fn.__esModule = true; fn.default = fn`.
    `Object.assign(stub, fn)` copies `__esModule` and `default` onto the stub so
    `stub["default"]` resolves to the function.
  Uses `result instanceof Object` (not `typeof result === 'object'`) to cover both cases.

- **Core bundle singleton**: `_loadCoreBundle()` uses a single promise so concurrent requests
  for any core module share one fetch.

- **`configure({ baseUrl, loader })`**: lets the consumer override the fetch URL base and/or
  replace the transport entirely (needed for WebView asset:// schemes or `window.ReactNativeWebView`
  injection).

## Browser facade (`index.js`)

- `createEditor(options)` — mounts a CodeMirror editor, lazy-loads language and extension modules.
- `registerExtension(name, resolver)` — adds a package to the extension resolver registry.
- Extension spec forms accepted by `createEditor({ extensions })`:
  - `'@codemirror/autocomplete'` — string, looked up in registry, resolver called with no options
  - `['@codemirror/autocomplete', { icons: false }]` — string + options, passed to resolver
  - `['@uiw/codemirror-theme-github', 'githubDark']` — string + string, returns `mod[exportName]`
    directly (no registry needed; use this for themes)
  - anything else — passed through as-is (already a CM Extension)

## Known tricky areas

### `@uiw/codemirror-themes` and individual theme packages

- `@uiw/codemirror-themes` **must come before** individual theme packages in `SEPARATE_PACKAGES`.
  Each theme package requires it at runtime.
- These packages were compiled with `@babel/plugin-transform-runtime`, so they externalize
  `@babel/runtime/helpers/*`. Those helpers are resolved automatically by the transitive deps scan.
- `@babel/runtime` must be in `dependencies` (not devDependencies) so it is installed in
  consumer projects when `postinstall` runs.

### Package resolution when installed as a dependency

When npm runs `postinstall`, `cwd` is the package's own directory
(`consumer/node_modules/@actualwave/codemirror-package/`). Using
`resolve(process.cwd(), 'node_modules')` would look for packages in
`consumer/node_modules/@actualwave/codemirror-package/node_modules/`, but
npm hoists all dependencies to `consumer/node_modules/`.

**Fix**: `start.js` uses `createRequire(import.meta.url)` to resolve package
locations. Node's standard upward-search algorithm finds hoisted packages
wherever npm placed them. Output paths (`dist/`, `docs/`) use
`dirname(fileURLToPath(import.meta.url))` so they always resolve relative to
`start.js`, not `cwd`.

### Publishing model — pre-built assets, no postinstall

The package is published with pre-built files already in `docs/`. All build
tools and codemirror packages live in `devDependencies`. There is no
`postinstall` script.

Reasons:
1. No overhead — consumers install nothing except the built assets.
2. Sealed versions — the exact working combination of codemirror packages is
   frozen at publish time; no upstream update can silently break consumers.
3. No supply-chain risk from lifecycle scripts running arbitrary code on install.
4. Local/unpublished deps (like `@actualwave/codemirror-lang-sksl`) work fine
   because their built output is already embedded in `docs/codemirror/`.

The `files` field in `package.json` publishes only `docs/`, `index.js`, and
`requireAsyncModule.js`. To release a new version: run `npm run build`, bump
the version, then `npm publish`.

### Why build tools were previously in `dependencies` (postinstall era)

`postinstall` runs in the **consumer project** after `npm install`. At that point only
`dependencies` are installed. So `@babel/core`, `@actualwave/babel-ioc-dep-wrap-plugin`,
`babel-preset-minify`, `rollup`, `@rollup/plugin-commonjs`, and `@babel/runtime` must all be
in `dependencies`.

### `getDefaultExportFromCjs` override

Rollup generates this helper when it detects `__esModule: true` on a CJS module. Without
the override, `@uiw/codemirror-themes`'s init function returns just the `createTheme` function
(the default export), not the object with named exports. Every `require$$N["default"]` access
on a helper would also break because the stub would be empty. The identity replacement is safe:
for modules without `__esModule` it is a no-op (the helper already returned `x`), and for
`__esModule` modules it preserves the full named-exports object.

### `module.exports` reassignment and the stub

When a CJS module does `module.exports = X` (replacing the exports object entirely), the cached
stub `{}` is never populated by the module code. The fix in `_asyncLoad`:

```js
const result = await moduleInitFunction(requireAsyncModule, moduleExports);
if (result !== moduleExports && result instanceof Object) {
  Object.assign(moduleExports, result);
}
return moduleExports;
```

This ensures the stub gets all enumerable properties of the returned value, so both existing
references to the stub and future cache hits see the correct exports.

### Infinite loop in transitive deps scan (fixed)

Before the rollup pre-bundling step, relative requires inside packages (e.g. `./color` from
`@uiw/codemirror-themes`) were converted to `requireAsyncModule('./color')` by the babel plugin.
These could never be resolved, causing the scan to loop forever. Rollup inlines all relative
requires first, so they never appear in the output.

## Intended usage (React Native context)

The consumer repo (a separate React Native project) will:
1. Install this package as a dependency (triggering `postinstall` / `node start.js`).
2. Copy `docs/` (or `dist/`) into the RN app's assets.
3. Mount a WebView pointing to `docs/index.html`, or inject `index.js` and `requireAsyncModule.js`
   via `injectedJavaScript`.
4. Communicate with the editor via `postMessage` / injected scripts.
5. Call `configure({ baseUrl, loader })` if assets are served from a non-standard path or
   require a custom transport (e.g. `asset://` scheme on Android).

## Adding new packages

1. Add the npm package to `dependencies` in `package.json`.
2. Add the package name to `SEPARATE_PACKAGES` in `start.js` (order matters — dependencies
   must appear before the packages that require them).
3. Run `node start.js` to rebuild.
4. If the package exports a CodeMirror Extension and needs a convenience API, add a resolver
   to `extensionResolvers` in `index.js`. For packages that export named values (like themes),
   the `[packageName, 'exportName']` tuple form works without a registry entry.
