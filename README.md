# @actualwave/codemirror-package

Support package for the [ReactNative CodeEditor](https://github.com/burdiuz/react-native-codeditor) component. Packages all [CodeMirror 6](https://codemirror.net/) modules into individually loadable JS files so they can be lazily fetched into a WebView on demand, avoiding the cost of shipping everything up front.

A live demo is deployed as a [GitHub Page for this repo](https://burdiuz.github.io/js-codemirror-package/).

---

## How it works

Each CodeMirror and Lezer package is transformed at build time using [@actualwave/babel-ioc-dep-wrap-plugin](https://github.com/burdiuz/babel-ioc-dep-wrap-plugin): every `require()` call inside the CJS source is converted to `await requireAsyncModule()`. The result is a folder of self-contained JS files that load their dependencies through the same async loader at runtime — no bundler, no `node_modules` in the browser.

The 14 foundational packages (state, view, language, commands, etc.) are combined into a single `_core.js` bundle so they are always fetched together in one request. All other packages (language support, themes, legacy modes) are fetched individually and cached on first use.

```
dist/
  requireAsyncModule.js   ← runtime loader (inject into WebView HTML)
  index.js                ← high-level editor facade (import in your page)
  modules.json            ← module registry used by the loader
  codemirror/
    _core.js              ← bundled core (14 packages, one fetch)
    @codemirror_lang-javascript.js
    @lezer_javascript.js
    codemirror.js
    ... (159 modules total)
```

---

## Installation

```bash
npm install @actualwave/codemirror-package
```

The `postinstall` script runs the build automatically. To rebuild manually:

```bash
npm start
```

---

## Browser / WebView usage

Include both files in your HTML page. The loader must come first so the module map is available before any `import` runs:

```html
<script type="module" src="requireAsyncModule.js"></script>
<script type="module">
  import { createEditor } from './index.js';

  const editor = await createEditor({
    parent: document.body,
    doc: 'function hello() {}',
    language: 'javascript',
    extensions: ['@codemirror/autocomplete'],
  });
</script>
```

---

## API

### `configure(options)`

Call before any modules are loaded to override defaults.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | `'./codemirror/'` | Directory URL where module `.js` files are served from. |
| `loader` | `(url: string) => Promise<string>` | `fetch` | Custom transport. Replace when `fetch` is unavailable (e.g. React Native asset registry). |

```js
configure({ baseUrl: 'https://cdn.example.com/codemirror/' });

// Custom loader for React Native WebView
configure({
  loader: (url) => loadLocalAsset(url),
});
```

---

### `createEditor(options)` → `Promise<EditorController>`

Creates and mounts a CodeMirror editor. Core modules are lazy-loaded on the first call and cached for the lifetime of the page.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `parent` | `Element` | `document.body` | DOM element to mount into. |
| `doc` | `string` | `''` | Initial content. |
| `language` | `string` | — | Language name. Loads `@codemirror/lang-{name}` on demand. |
| `extensions` | `Array` | `[]` | Extension specs (see below). |
| `onChange` | `(value: string) => void` | — | Called on every document change. |

#### Extension specs

Each entry in `extensions` (and in `setExtensions`) may be:

| Form | Example | Behaviour |
|------|---------|-----------|
| Package name string | `'@codemirror/autocomplete'` | Loaded and resolved via the built-in registry |
| `[packageName, exportName]` | `['@uiw/codemirror-theme-nord', 'nord']` | `mod[exportName]` returned directly — use for themes and named exports |
| `[packageName, options]` | `['@codemirror/search', { top: true }]` | Resolver called with options; must be registered in the extension registry |
| CM Extension object | `myExtension` | Passed through as-is |

Built-in registry covers: `@codemirror/autocomplete`, `@codemirror/search`, `@codemirror/lint`, `@codemirror/collab`, `@codemirror/theme-one-dark`.

**Note on `@uiw` themes**: each theme lives in its own package (`@uiw/codemirror-theme-{name}`), not the meta-package `@uiw/codemirror-themes`. Use the `[packageName, exportName]` form. Two themes use non-obvious export names: `github` → `githubDark`, `vscode` → `vscodeDark`.

```js
// ✓ correct
['@uiw/codemirror-theme-darcula', 'darcula']
['@uiw/codemirror-theme-github',  'githubDark']

// ✗ wrong — meta-package only exports createTheme, not individual themes
['@uiw/codemirror-themes', 'darcula']
```

---

### `EditorController`

The object returned by `createEditor`.

| Member | Description |
|--------|-------------|
| `view` | The underlying `EditorView` for direct CodeMirror access. |
| `getValue()` | Returns current document as a string. |
| `setValue(value)` | Replaces the entire document. |
| `setLanguage(name)` | Swaps the active language without rebuilding editor state. |
| `setExtensions(specs)` | Replaces the active extension set. Accepts the same spec forms as `extensions`. |
| `loadExtension(moduleName)` | Loads a module and returns its raw exports. Use when you need internals not exposed by the registry (e.g. building a custom completion source). |
| `destroy()` | Destroys the editor and removes it from the DOM. |

---

### `registerExtension(moduleName, resolver)`

Adds (or overrides) an entry in the extension registry.

```js
import { registerExtension, createEditor } from './index.js';

registerExtension('@my/custom-theme', (mod) => mod.myTheme);

const editor = await createEditor({
  extensions: ['@my/custom-theme'],
});
```

---

### `requireAsyncModule(moduleName)` → `object | Promise<object>`

Low-level loader. Returns the cached exports synchronously if already loaded, otherwise fetches and evaluates the module file and returns a Promise. All `createEditor` and `loadExtension` calls go through this internally.

```js
const { javascriptLanguage } = await requireAsyncModule('@codemirror/lang-javascript');
```

---

## Supported languages

All `@codemirror/lang-*` packages are included and loadable by name via the `language` option or `setLanguage()`:

`angular`, `cpp`, `css`, `go`, `html`, `java`, `javascript`, `jinja`, `json`, `less`, `lezer`, `liquid`, `markdown`, `php`, `python`, `rust`, `sass`, `sql`, `vue`, `wast`, `xml`, `yaml`

Legacy CodeMirror modes from `@codemirror/legacy-modes` are also available via `requireAsyncModule`:

```js
const { clike } = await requireAsyncModule('@codemirror/legacy-modes/mode/clike');
```

---

## Android WebView / React Native usage

Several Android WebView constraints require special handling when hosting the editor in React Native.

### Use plain `<script>` tags, not ES modules

`<script type="module">` causes silent failures in Android WebView when an imported file is
missing — the page just stops loading with no `window.onerror`. Use plain `<script>` tags and
IIFE bundles instead so errors are caught and surfaced:

```html
<!-- ✗ ES modules — silent failures on Android WebView -->
<script type="module" src="requireAsyncModule.js"></script>
<script type="module">import { createEditor } from './index.js';</script>

<!-- ✓ IIFE bundles — errors reported via window.onerror -->
<script src="./codemirror-editor.umd.js"></script>
<script>
(async () => {
  const { configure, createEditor } = window.CodeMirrorEditor;
  configure({ baseUrl: './codemirror/' });
  const editor = await createEditor({ ... });
})();
</script>
```

[react-native-codeditor](https://github.com/burdiuz/react-native-codeditor) ships a pre-built
`codemirror-editor.umd.js` IIFE bundle generated from this package.

### Use XHR instead of `fetch` for `file://` origins

Android WebView blocks `fetch()` for `file://` origins even for same-origin requests. Use XHR
instead — status `0` means success for `file://`:

```js
configure({
  loader: (url) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
        resolve(xhr.responseText);
      } else {
        reject(new Error('HTTP ' + xhr.status + ': ' + url));
      }
    };
    xhr.onerror = () => reject(new Error('XHR failed: ' + url));
    xhr.send();
  }),
});
```

### Disable EditContext for Chrome 147+ WebView compatibility

CM6 v6.42+ automatically enables the [EditContext API](https://developer.chrome.com/docs/web-platform/editcontext/)
on Android Chrome 126+. Chrome 147 has a race condition in its WebView EditContext implementation:
successive IME `textupdate` events arrive faster than CM6 can sync back, causing characters to
appear after the cursor during fast typing.

Set `EditorView.EDIT_CONTEXT = false` **after** the CM6 modules have loaded (so the flag is set on
the real class, not a module stub) and **before** `new EditorView()` is called:

```js
const [{ EditorView }, ...] = await Promise.all([
  requireAsyncModule('@codemirror/view'),
  // ...
]);

// Must be set on the resolved class, not before requireAsyncModule loads _core.js
EditorView.EDIT_CONTEXT = false;

const view = new EditorView({ ... });
```

This falls back to the `contenteditable` + MutationObserver path, which is stable at any typing
speed as long as `drawSelection()` is also omitted (see below).

### Omit `drawSelection()` for Android IME

CM6's `drawSelection()` replaces the native browser cursor with a custom overlay. Android's IME
tracks the native cursor to know where to insert text — hiding it causes characters to appear after
the cursor instead of advancing it.

Use a custom setup that omits `drawSelection()` rather than `basicSetup`:

```js
const { EditorView, lineNumbers, keymap, /* ... */ } = await requireAsyncModule('@codemirror/view');

// basicSetup without drawSelection()
const mobileSetup = [
  lineNumbers(),
  history(),
  // drawSelection(), ← intentionally omitted
  // ... all other basicSetup extensions
];
```

---

## Development

Serve the `docs/` demo locally:

```bash
npm run serve
# opens http://localhost:3000
```
