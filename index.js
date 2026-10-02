import { requireAsyncModule, configure } from './requireAsyncModule.js';

export { requireAsyncModule, configure };

/**
 * Registry mapping package name → (mod, options?) => CodeMirror extension.
 * Covers the extension-providing packages included in this distribution.
 * Add entries for custom packages with registerExtension().
 */
const extensionResolvers = new Map([
  ['@codemirror/autocomplete',   (mod, options) => mod.autocompletion(options)],
  ['@codemirror/search',         (mod, options) => mod.search(options)],
  ['@codemirror/lint',           (mod, options) => mod.lintGutter(options)],
  ['@codemirror/collab',         (mod, options) => mod.collab(options)],
  ['@codemirror/theme-one-dark', (mod) => mod.oneDark],
]);

/**
 * Register a resolver for a package not covered by the built-in registry,
 * or override an existing one.
 *
 * @param {string} moduleName - npm package name.
 * @param {(mod: object, options?: any) => import('@codemirror/state').Extension} resolver
 */
export function registerExtension(moduleName, resolver) {
  extensionResolvers.set(moduleName, resolver);
}

/**
 * Resolves an extension spec into a CodeMirror Extension value.
 *
 * Accepted forms:
 *   - string                    → package name; loaded and resolved via extensionResolvers
 *   - [string, string]          → [packageName, exportName]; loads module, returns mod[exportName]
 *   - [string, object|undefined]→ package name + options object passed to the resolver
 *   - anything else             → returned as-is (already a CM Extension)
 */
async function resolveExtensionSpec(spec) {
  if (typeof spec !== 'string' && !(Array.isArray(spec) && typeof spec[0] === 'string')) {
    return spec;
  }
  const [moduleName, second] = Array.isArray(spec) ? spec : [spec, undefined];

  // [moduleName, 'exportName'] — return a named export directly (e.g. themes)
  if (typeof second === 'string') {
    const mod = await requireAsyncModule(moduleName);
    return mod[second];
  }

  const resolver = extensionResolvers.get(moduleName);
  if (!resolver) {
    throw new Error(`No extension resolver for "${moduleName}". Call registerExtension() to add one.`);
  }
  const mod = await requireAsyncModule(moduleName);
  return resolver(mod, second);
}

/**
 * Registry mapping language name → npm package name for packages that don't
 * follow the @codemirror/lang-{name} convention. Empty by default — this is a
 * generic facade with no built-in knowledge of any specific language package;
 * callers must register the ones they need via registerLanguage().
 */
const languagePackages = new Map();

/**
 * Register a custom language package that doesn't follow the
 * @codemirror/lang-{name} convention.
 *
 * @param {string} name - Language name used in createEditor({ language }).
 * @param {string} packageName - npm package name to load.
 */
export function registerLanguage(name, packageName) {
  languagePackages.set(name, packageName);
}

/**
 * Packages providing tagged-template DSL embeddings for the 'javascript'
 * language. Each package must export `createEmbedding() => { matcher, language }`
 * — see @actualwave/codemirror-lang-embed-core. Empty by default; register the
 * embeddings a given app needs via registerTaggedTemplate().
 */
const taggedTemplateEmbeddings = new Set();

/**
 * Registers an additional tagged-template DSL embedding package to be mixed
 * into the 'javascript' language (e.g. a future embed-glsl/embed-icu package).
 *
 * @param {string} packageName - npm package name exporting createEmbedding().
 */
export function registerTaggedTemplate(packageName) {
  taggedTemplateEmbeddings.add(packageName);
}

/**
 * Packages contributing plain CM extensions (completion sources, decoration
 * ViewPlugins, etc) to a base language's support set, for DSLs with no
 * grammar to parse — e.g. flat class-name token lists rather than a
 * `parseMixed` nested language. Each package must export
 * `createSupportExtension(languageSupport, config?) => Extension`. Keyed by
 * package name → its config (or `undefined`), registered once up front rather
 * than threaded through every createEditor() call, matching how
 * registerTaggedTemplate works. Empty by default; register what a given app
 * needs via registerSupportExtension(). Currently only mixed in for the
 * 'javascript' base language (see resolveLanguageExtension) — not JS-specific
 * by name or contract, just not yet wired up for other base languages.
 */
const supportExtensions = new Map();

/**
 * Registers an additional package contributing support extensions (not a
 * nested grammar) to a base language — currently only 'javascript'.
 *
 * @param {string} packageName - npm package name exporting createSupportExtension().
 * @param {object} [config] - Passed as createSupportExtension's second argument.
 */
export function registerSupportExtension(packageName, config) {
  supportExtensions.set(packageName, config);
}

/**
 * Extracts a StreamParser mode object from a legacy-modes module.
 * Tries exact match first, then case-insensitive, then single-export fallback
 * (handles mismatches like coffeescript→coffeeScript, simple-mode→simpleMode).
 */
function findLegacyMode(mod, name) {
  const isMode = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const skip = new Set(['__esModule', 'default']);
  if (isMode(mod[name])) return mod[name];
  const lname = name.toLowerCase();
  for (const [k, v] of Object.entries(mod)) {
    if (!skip.has(k) && k.toLowerCase() === lname && isMode(v)) return v;
  }
  const modes = Object.entries(mod).filter(([k, v]) => !skip.has(k) && isMode(v));
  return modes.length === 1 ? modes[0][1] : null;
}

/**
 * Resolves a language name to a CodeMirror language extension.
 * Resolution order:
 *   1. Custom registry (registerLanguage) — empty by default
 *   2. 'javascript' special case — wraps @codemirror/lang-javascript with
 *      tagged-template DSL embedding for whatever's been registered via
 *      registerTaggedTemplate/registerSupportExtension (none by default) plus
 *      whatever's passed in per-call via the embeds argument
 *   3. @codemirror/lang-{name}  (official first-class language packages)
 *   4. @codemirror/legacy-modes/mode/{name}  (wrapped with StreamLanguage.define)
 *
 * @param {string} name
 * @param {object} [config] - Passed as the sole argument to the resolved factory function
 *   (e.g. { jsx: true, typescript: true } for 'javascript'). Ignored by the legacy-modes
 *   fallback, since those export StreamParser objects rather than factory functions.
 * @param {object} [embeds] - Only used when name === 'javascript'.
 * @param {string[]} [embeds.taggedTemplates] - Extra tagged-template embedding package
 *   names for this call only, merged with whatever's registered via registerTaggedTemplate.
 * @param {Array<string|[string, object]>} [embeds.supportExtensions] - Extra support-extension
 *   packages for this call only (same spec shape as registerSupportExtension's arguments —
 *   a bare package name, or a [packageName, config] tuple), merged with whatever's registered
 *   via registerSupportExtension (per-call config wins on a shared package name).
 */
async function resolveLanguageExtension(name, config, embeds = {}) {
  if (languagePackages.has(name)) {
    const mod = await requireAsyncModule(languagePackages.get(name));
    const fn = mod[name] ?? Object.values(mod).find((v) => typeof v === 'function');
    if (fn) return fn(config);
  }

  if (name === 'javascript') {
    const { taggedTemplates = [], supportExtensions: callSupportExtensions = [] } = embeds;

    const [jsMod, embedCore, { LanguageSupport }] = await Promise.all([
      requireAsyncModule('@codemirror/lang-javascript'),
      requireAsyncModule('@actualwave/codemirror-lang-embed-core'),
      requireAsyncModule('@codemirror/language'),
    ]);
    const base = jsMod.javascript(config);
    const registry = embedCore.createTagRegistry();
    const extras = [];

    const allTaggedTemplates = new Set([...taggedTemplateEmbeddings, ...taggedTemplates]);
    for (const packageName of allTaggedTemplates) {
      try {
        const { createEmbedding } = await requireAsyncModule(packageName);
        const { matcher, language, extension } = createEmbedding();
        registry.register(matcher, language);
        if (extension) extras.push(extension);
      } catch {}
    }
    const embedded = embedCore.embedTaggedTemplates(base, registry);

    const allSupportExtensions = new Map(supportExtensions);
    for (const spec of callSupportExtensions) {
      const [packageName, supportConfig] = Array.isArray(spec) ? spec : [spec, undefined];
      allSupportExtensions.set(packageName, supportConfig);
    }
    for (const [packageName, supportConfig] of allSupportExtensions) {
      try {
        const { createSupportExtension } = await requireAsyncModule(packageName);
        extras.push(createSupportExtension(embedded, supportConfig));
      } catch {}
    }
    return extras.length ? new LanguageSupport(embedded.language, [embedded.support, extras]) : embedded;
  }

  try {
    const mod = await requireAsyncModule(`@codemirror/lang-${name}`);
    const fn = mod[name] ?? Object.values(mod).find((v) => typeof v === 'function');
    if (fn) return fn(config);
  } catch {}

  try {
    const [legacyMod, { StreamLanguage }] = await Promise.all([
      requireAsyncModule(`@codemirror/legacy-modes/mode/${name}`),
      requireAsyncModule('@codemirror/language'),
    ]);
    const mode = findLegacyMode(legacyMod, name);
    if (mode) return StreamLanguage.define(mode);
  } catch {}

  throw new Error(`No language support found for "${name}". Use registerLanguage() for custom packages.`);
}

/**
 * Creates and mounts a CodeMirror editor instance.
 * Core modules (state, view, basicSetup) are loaded on first call and cached for reuse.
 *
 * @param {object} [options]
 * @param {Element}  [options.parent=document.body] - DOM element to mount the editor into.
 * @param {string}   [options.doc='']               - Initial document content.
 * @param {string}   [options.language]             - Language name, e.g. 'javascript', 'python'.
 *   Tries @codemirror/lang-{name} first, then @codemirror/legacy-modes/mode/{name}.
 * @param {object}   [options.languageConfig]       - Options passed to the language factory,
 *   e.g. { jsx: true, typescript: true } for 'javascript'.
 * @param {Array}    [options.extensions=[]]        - Extension specs. Each item may be:
 *   a package-name string, a [packageName, options] tuple, or an already-built CM Extension.
 * @param {object}   [options.embeds]                - Only used when language === 'javascript'.
 *   Optional — defaults to none.
 * @param {string[]} [options.embeds.taggedTemplates] - Extra tagged-template embedding package
 *   names for this editor only, merged with whatever's registered globally via registerTaggedTemplate.
 * @param {Array<string|[string, object]>} [options.embeds.supportExtensions] - Extra
 *   support-extension packages for this editor only (a bare package name, or a
 *   [packageName, config] tuple), merged with whatever's registered globally via
 *   registerSupportExtension.
 * @param {(value: string) => void} [options.onChange] - Called with the full document string
 *   on every change. Use this to relay content back to the React Native side.
 *
 * @returns {Promise<EditorController>}
 */
export async function createEditor({
  parent = document.body,
  doc = '',
  language,
  languageConfig,
  extensions = [],
  embeds,
  onChange,
} = {}) {
  const [
    { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars,
      dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine, keymap },
    { EditorState, Compartment },
    { history, defaultKeymap, historyKeymap },
    { foldGutter, indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldKeymap },
    { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap },
    { highlightSelectionMatches, searchKeymap },
    { lintKeymap },
  ] = await Promise.all([
    requireAsyncModule('@codemirror/view'),
    requireAsyncModule('@codemirror/state'),
    requireAsyncModule('@codemirror/commands'),
    requireAsyncModule('@codemirror/language'),
    requireAsyncModule('@codemirror/autocomplete'),
    requireAsyncModule('@codemirror/search'),
    requireAsyncModule('@codemirror/lint'),
  ]);

  // Chrome 126+ WebView uses the EditContext API for IME input. On Chrome 147 there is a
  // race condition where successive textupdate events arrive faster than CM6 can sync back
  // via editContext.updateText/updateSelection, causing characters to appear after the cursor.
  // Disabling EditContext makes CM6 fall back to the contenteditable MutationObserver path,
  // which is stable for fast typing when drawSelection() is omitted (native cursor stays visible).
  EditorView.EDIT_CONTEXT = false;

  // basicSetup without drawSelection() — drawSelection() hides the native browser cursor,
  // which breaks Android IME composition (ghost text and cursor not advancing when typing fast).
  const mobileSetup = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      ...lintKeymap,
    ]),
  ];

  // Separate Compartments allow language and extensions to be swapped independently
  // after the editor is created without rebuilding the entire editor state.
  const languageCompartment = new Compartment();
  const extensionCompartment = new Compartment();

  const [langExt, resolvedExtensions] = await Promise.all([
    language ? resolveLanguageExtension(language, languageConfig, embeds) : Promise.resolve([]),
    Promise.all(extensions.map(resolveExtensionSpec)),
  ]);

  const builtinExtensions = [
    mobileSetup,
    languageCompartment.of(langExt),
    extensionCompartment.of(resolvedExtensions),
  ];

  if (onChange) {
    builtinExtensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) onChange(update.state.doc.toString());
      }),
    );
  }

  const view = new EditorView({
    state: EditorState.create({ doc, extensions: builtinExtensions }),
    parent,
  });

  /**
   * @typedef {object} EditorController
   */
  return {
    /** The underlying CodeMirror EditorView, for advanced direct access. */
    get view() { return view; },

    /** Returns the current document content as a string. */
    getValue() {
      return view.state.doc.toString();
    },

    /** Replaces the entire document content. */
    setValue(value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    },

    /**
     * Switches the active language. Loads @codemirror/lang-{name} on demand.
     * @param {string} name - Language name, e.g. 'python', 'css'.
     * @param {object} [config] - Options passed to the language factory, e.g.
     *   { jsx: true, typescript: true } for 'javascript'. Must be plain serializable
     *   data — it crosses the WebView bridge as a postMessage payload.
     * @param {object} [embeds] - Only used when name === 'javascript'; see createEditor's
     *   options.embeds. Optional — defaults to none.
     */
    async setLanguage(name, config, embeds) {
      const ext = await resolveLanguageExtension(name, config, embeds);
      view.dispatch({ effects: languageCompartment.reconfigure(ext) });
    },

    /**
     * Replaces the active extension set. Accepts the same spec forms as createEditor's
     * extensions option: package-name strings, [name, options] tuples, or CM Extensions.
     * @param {Array} newExtensions
     */
    async setExtensions(newExtensions) {
      const resolved = await Promise.all(newExtensions.map(resolveExtensionSpec));
      view.dispatch({ effects: extensionCompartment.reconfigure(resolved) });
    },

    /**
     * Loads a module by package name and returns its raw exports.
     * Use when you need direct access to module internals not exposed through
     * the extension registry (e.g. building a custom completion source).
     * @param {string} moduleName
     * @returns {Promise<object>}
     */
    async loadExtension(moduleName) {
      return requireAsyncModule(moduleName);
    },

    /** Destroys the editor and removes it from the DOM. */
    destroy() {
      view.destroy();
    },
  };
}
