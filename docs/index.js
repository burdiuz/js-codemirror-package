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
 *   - string               → package name; loaded and resolved via extensionResolvers
 *   - [string, options]    → package name + options object passed to the resolver
 *   - anything else        → returned as-is (already a CM Extension)
 */
async function resolveExtensionSpec(spec) {
  if (typeof spec !== 'string' && !(Array.isArray(spec) && typeof spec[0] === 'string')) {
    return spec;
  }
  const [moduleName, options] = Array.isArray(spec) ? spec : [spec, undefined];
  const resolver = extensionResolvers.get(moduleName);
  if (!resolver) {
    throw new Error(`No extension resolver for "${moduleName}". Call registerExtension() to add one.`);
  }
  const mod = await requireAsyncModule(moduleName);
  return resolver(mod, options);
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
  const [{ basicSetup, EditorView }, { EditorState, Compartment }] = await Promise.all([
    requireAsyncModule('codemirror'),
    requireAsyncModule('@codemirror/state'),
  ]);

  // Separate Compartments allow language and extensions to be swapped independently
  // after the editor is created without rebuilding the entire editor state.
  const languageCompartment = new Compartment();
  const extensionCompartment = new Compartment();

  const [langExt, resolvedExtensions] = await Promise.all([
    language ? resolveLanguageExtension(language) : Promise.resolve([]),
    Promise.all(extensions.map(resolveExtensionSpec)),
  ]);

  const builtinExtensions = [
    basicSetup,
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
