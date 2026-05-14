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
 * Resolves a language name to a CodeMirror language extension by loading
 * @codemirror/lang-{name}. The exported function is located by matching the
 * name key first, then by scanning for the first exported function.
 */
async function resolveLanguageExtension(name) {
  const mod = await requireAsyncModule(`@codemirror/lang-${name}`);
  const fn = mod[name] ?? Object.values(mod).find((v) => typeof v === 'function');
  if (!fn) throw new Error(`No language function found in @codemirror/lang-${name}`);
  return fn();
}

/**
 * Creates and mounts a CodeMirror editor instance.
 * Core modules (state, view, basicSetup) are loaded on first call and cached for reuse.
 *
 * @param {object} [options]
 * @param {Element}  [options.parent=document.body] - DOM element to mount the editor into.
 * @param {string}   [options.doc='']               - Initial document content.
 * @param {string}   [options.language]             - Language name, e.g. 'javascript', 'python'.
 *   Loads @codemirror/lang-{name} on demand.
 * @param {Array}    [options.extensions=[]]        - Extension specs. Each item may be:
 *   a package-name string, a [packageName, options] tuple, or an already-built CM Extension.
 * @param {(value: string) => void} [options.onChange] - Called with the full document string
 *   on every change. Use this to relay content back to the React Native side.
 *
 * @returns {Promise<EditorController>}
 */
export async function createEditor({
  parent = document.body,
  doc = '',
  language,
  extensions = [],
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
    language ? resolveLanguageExtension(language) : Promise.resolve([]),
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
     */
    async setLanguage(name) {
      const ext = await resolveLanguageExtension(name);
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
