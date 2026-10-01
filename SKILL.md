---
name: codemirror-package
description: "Embed and control a CodeMirror 6 editor inside a React Native WebView. Use when building a code editor component for React Native that lazily loads language support and extensions on demand. Keywords: codemirror, webview, react-native, code-editor, lazy-loading, javascript-editor"
license: MIT
compatibility: Works with any agent that can read files and write JavaScript/HTML
metadata:
  author: Oleg Galaburda
  version: "0.0.6"
  type: utility
  mode: application
---

# codemirror-package: CodeMirror 6 for React Native WebView

Integrate a fully featured CodeMirror 6 editor into a React Native WebView, loading only the language and extension modules actually needed.

## When to Use This Skill

Use this skill when:
- Building a React Native screen that contains a code editor
- Serving `dist/` files to a WebView from a local server or Android assets
- Writing the HTML page that bootstraps the editor inside the WebView
- Controlling the editor from the React Native side (set content, switch language, toggle extensions)
- Wiring up the React Native ↔ WebView message bridge for editor events

Do NOT use this skill when:
- Running CodeMirror in a plain browser without React Native (use the docs demo as a reference instead)
- Modifying the build pipeline (`start.js`) or adding new packages to the distribution

## Core Principle

**Ship `dist/` as static files, control everything through `window.editor` via injected scripts and postMessage.**

## WebView HTML Page

The HTML page is loaded inside the WebView. It imports the facade, creates the editor, and bridges events back to React Native.

```html
<!DOCTYPE html>
<html>
<head>
  <style>html, body { margin: 0; padding: 0; width: 100%; height: 100%; }</style>
</head>
<body></body>
<script type="module">
  import { configure, createEditor } from './index.js';

  // Point to wherever dist/codemirror/ is served from (see Asset Loading below)
  configure({ baseUrl: 'http://localhost:8080/codemirror/' });

  window.editor = await createEditor({
    parent: document.body,
    doc: '',
    language: 'javascript',
    languageConfig: { jsx: true, typescript: true },
    extensions: ['@codemirror/autocomplete'],
    onChange(value) {
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'change', value }));
    },
  });

  window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'ready' }));
</script>
</html>
```

## Instructions

### Step 1: Serve dist/ files

The WebView must be able to fetch files from `dist/`. Two common approaches on Android:

**Option A — Local HTTP server** (`react-native-static-server` or similar):
```js
configure({ baseUrl: 'http://localhost:8080/codemirror/' });
```

**Option B — WebViewAssetLoader** (Android, no extra server):
```java
WebViewAssetLoader assetLoader = new WebViewAssetLoader.Builder()
    .addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(context))
    .build();
```
```js
configure({ baseUrl: 'https://appassets.androidplatform.net/assets/codemirror/' });
```

**Option C — Custom loader function** (full control):
```js
configure({
  loader: (url) => fetch(url).then((r) => r.text()),
});
```

### Step 2: Bootstrap the editor

`createEditor` options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `parent` | `Element` | `document.body` | Mount target |
| `doc` | `string` | `''` | Initial content |
| `language` | `string` | — | e.g. `'javascript'`, `'python'`. Loads `@codemirror/lang-{name}` on demand |
| `languageConfig` | `object` | — | Passed as the sole argument to the resolved language factory, e.g. `{ jsx: true, typescript: true }` for `'javascript'`. Ignored by languages resolved via the legacy-modes fallback. |
| `extensions` | `Array` | `[]` | Extension specs (see Extension Specs below) |
| `onChange` | `(value: string) => void` | — | Called on every document change |

### Step 3: Control the editor from React Native

Always wait for the `ready` message before injecting commands.

```jsx
const webViewRef = useRef(null);
const [isReady, setIsReady] = useState(false);

function inject(js) {
  webViewRef.current?.injectJavaScript(js + '; true;');
}

<WebView
  ref={webViewRef}
  source={{ uri: 'file:///android_asset/editor.html' }}
  onMessage={(event) => {
    const msg = JSON.parse(event.nativeEvent.data);
    if (msg.type === 'ready') setIsReady(true);
    if (msg.type === 'change') onContentChange(msg.value);
  }}
/>
```

**Read content:**
```js
inject(`
  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: 'value', value: window.editor.getValue() })
  );
`);
```

**Set content:**
```js
inject(`window.editor.setValue(${JSON.stringify(code)});`);
```

**Switch language:**
```js
inject(`window.editor.setLanguage('python');`);
// async — loads @codemirror/lang-python on first call
```

**Switch language with config:**
```js
inject(`window.editor.setLanguage('javascript', { jsx: true, typescript: true });`);
// second arg is passed as the sole argument to the language factory (e.g. javascript())
// must be plain serializable data — it crosses the WebView bridge as injected JS / postMessage
```

**Toggle extensions:**
```js
inject(`window.editor.setExtensions(['@codemirror/theme-one-dark', '@codemirror/autocomplete']);`);
inject(`window.editor.setExtensions([]);`); // remove all optional extensions
```

**Destroy:**
```js
inject(`window.editor.destroy();`);
```

## EditorController Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `getValue()` | `string` | Current document content |
| `setValue(value)` | — | Replace entire document |
| `setLanguage(name, config?)` | `Promise` | Swap language; loads module on demand. `config` is passed to the language factory, e.g. `{ jsx: true, typescript: true }` for `'javascript'` |
| `setExtensions(specs)` | `Promise` | Replace active extensions |
| `loadExtension(moduleName)` | `Promise<object>` | Load module, return raw exports |
| `destroy()` | — | Destroy editor and remove from DOM |
| `view` | `EditorView` | Underlying CM6 EditorView |

## Extension Specs

Each item in `extensions` / `setExtensions` may be:

| Form | Example | Description |
|------|---------|-------------|
| Package name string | `'@codemirror/autocomplete'` | Loaded and resolved via built-in registry |
| `[packageName, options]` | `['@codemirror/search', { top: true }]` | Resolver called with options |
| CM Extension object | `myExtension` | Passed through as-is |

Built-in registry: `@codemirror/autocomplete`, `@codemirror/search`, `@codemirror/lint`, `@codemirror/collab`, `@codemirror/theme-one-dark`.

Register a custom resolver:
```js
import { registerExtension } from './index.js';
registerExtension('@my/theme', (mod, options) => mod.myTheme(options));
```

**Note:** `createEditor` always wires `completionKeymap` and `autocompletion()` into its baked-in setup, so `Ctrl-Space` opens the completion popup by default — requesting `'@codemirror/autocomplete'` via `extensions` is not required just for that binding. App-level shortcuts that call back out to React Native (save, run, etc.) are a different API — `registerShortcut`/`unregisterShortcut` on the [react-native-codeditor](https://github.com/burdiuz/react-native-codeditor) side, not this package.

## Supported Languages

Pass any of these to `language` / `setLanguage`:

`angular` `cpp` `css` `go` `html` `java` `javascript` `jinja` `json` `less` `lezer` `liquid` `markdown` `php` `python` `rust` `sass` `sql` `vue` `wast` `xml` `yaml`

Most of these factories take no arguments (`cpp`, `css`, `go`, `java`, `json`, `less`, `lezer`, `python`, `rust`, `wast`, `yaml`). The rest accept an optional config object via `languageConfig` / the second `setLanguage` argument: `angular`, `html`, `javascript` (`{ jsx, typescript }`), `jinja`, `liquid`, `markdown`, `php`, `sass`, `sql` (`SQLConfig`), `vue`, `xml` (`XMLConfig`). Check the installed package's own types for the exact shape — this list is the packages currently bundled, not a guarantee for future versions.

Not pre-registered — the registry starts empty. Register custom `@actualwave/codemirror-lang-*` packages (or your own) via `registerLanguage`, e.g. `sksl`, `glsl`, `icu`.

Legacy modes via `loadExtension`:
```js
const { swift } = await editor.loadExtension('@codemirror/legacy-modes/mode/swift');
```

## Custom Languages and Embedded DSLs

### `registerLanguage(name, packageName)`

Registers a top-level language package that doesn't follow the `@codemirror/lang-{name}` convention, so it becomes usable via `language` / `setLanguage(name)`.

```js
import { registerLanguage } from './index.js';
registerLanguage('mylang', '@my/codemirror-lang-mylang');
```

### `registerTaggedTemplate(packageName)`

Mixes a nested grammar into `'javascript'` for a tagged-template DSL (`` tag`...` ``), via `parseMixed`. The package must export `createEmbedding() => { matcher, language, extension? }`. Empty by default — register what you need, e.g. `@actualwave/codemirror-lang-embed-{sql,graphql,css,sksl,glsl,icu-messageformat}`.

```js
import { registerTaggedTemplate } from './index.js';
registerTaggedTemplate('@my/codemirror-lang-embed-toml');
// `` toml`key = "value"` `` now highlights inside any 'javascript' editor
```

### `registerJavascriptSupport(packageName, config)`

Adds a package contributing plain extensions (completions, decorations — no nested grammar) to `'javascript'`'s support set. The package must export `createSupportExtension(jsLanguageSupport, config?) => Extension`. Empty by default — e.g. register `@actualwave/codemirror-lang-embed-tailwind` or `-embed-react-native` if you need them.

```js
import { registerJavascriptSupport } from './index.js';
registerJavascriptSupport('@my/codemirror-lang-embed-emojis', { setName: 'twemoji' });
```

Both `registerTaggedTemplate` and `registerJavascriptSupport` only affect editors created with `language: 'javascript'`.

## Anti-Patterns

### Injecting commands before `ready`
**Problem:** `window.editor` is `undefined` until `createEditor` resolves and the page sends the `ready` message.
**Fix:** Gate all `inject()` calls on an `isReady` flag set in `onMessage`.

### Awaiting async methods in injected JS without handling the Promise
**Problem:** `setLanguage` and `setExtensions` return Promises. Injected JS runs and returns but the operation may not be complete.
**Fix:** If you need confirmation, send a `postMessage` from inside the page after the awaited call, or wrap in an async IIFE: `inject('(async () => { await window.editor.setLanguage("python"); ... })();');`

### Hardcoding `./codemirror/` base URL in a native app
**Problem:** Relative paths don't resolve correctly when the HTML is loaded from `file://` or a custom URI scheme.
**Fix:** Always call `configure({ baseUrl })` with an absolute URL before `createEditor`.

## What This Skill Does NOT Cover

- Modifying the build pipeline (`start.js`, `CORE_PACKAGES`, `SEPARATE_PACKAGES`)
- Adding new CodeMirror packages to the distribution
- iOS WebView integration specifics (same API, different asset serving setup)
- Server-side rendering or Node.js usage of the editor
