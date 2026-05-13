import { resolve, basename, extname, isAbsolute } from 'path';
import { rm, mkdir, readdir, readFile, writeFile, copyFile } from 'fs/promises';
import babel from '@babel/core';
import { wrapWithAsyncFn } from '@actualwave/babel-ioc-dep-wrap-plugin';
import { rollup } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';

const DIST_FOLDER = resolve(process.cwd(), 'dist');
const DIST_CODEMIRROR_FOLDER = resolve(process.cwd(), 'dist/codemirror');
const DOCS_FOLDER = resolve(process.cwd(), 'docs');
const DOCS_CODEMIRROR_FOLDER = resolve(process.cwd(), 'docs/codemirror');
const NODE_MODULES = resolve(process.cwd(), 'node_modules');

// These packages are bundled together into a single loadable unit.
// Order matters: each entry must only depend on packages listed before it.
const CORE_PACKAGES = [
  'crelt',
  'style-mod',
  'w3c-keyname',
  '@marijn/find-cluster-break',
  '@lezer/common',
  '@lezer/highlight',
  '@lezer/lr',
  '@codemirror/state',
  '@codemirror/view',
  '@codemirror/language',
  '@codemirror/commands',
  '@codemirror/autocomplete',
  '@codemirror/search',
  '@codemirror/lint',
];

// Each of these is a separate loadable module.
// Lezer parsers are listed before the lang packages that depend on them.
const SEPARATE_PACKAGES = [
  // codemirror meta-package (provides basicSetup, re-exports core)
  'codemirror',

  // optional codemirror extensions
  '@codemirror/collab',
  '@codemirror/language-data',
  '@codemirror/merge',
  '@codemirror/theme-one-dark',

  // @uiw community themes (shared base must come before individual themes)
  '@uiw/codemirror-themes',
  '@uiw/codemirror-theme-androidstudio',
  '@uiw/codemirror-theme-andromeda',
  '@uiw/codemirror-theme-atomone',
  '@uiw/codemirror-theme-aura',
  '@uiw/codemirror-theme-basic',
  '@uiw/codemirror-theme-bbedit',
  '@uiw/codemirror-theme-copilot',
  '@uiw/codemirror-theme-darcula',
  '@uiw/codemirror-theme-dracula',
  '@uiw/codemirror-theme-duotone',
  '@uiw/codemirror-theme-eclipse',
  '@uiw/codemirror-theme-github',
  '@uiw/codemirror-theme-material',
  '@uiw/codemirror-theme-monokai',
  '@uiw/codemirror-theme-nord',
  '@uiw/codemirror-theme-okaidia',
  '@uiw/codemirror-theme-solarized',
  '@uiw/codemirror-theme-sublime',
  '@uiw/codemirror-theme-vscode',
  '@uiw/codemirror-theme-xcode',

  // lezer parsers (deps of lang packages below)
  '@lezer/css',
  '@lezer/go',
  '@lezer/html',
  '@lezer/java',
  '@lezer/javascript',
  '@lezer/json',
  '@lezer/cpp',
  '@lezer/lezer',
  '@lezer/markdown',
  '@lezer/php',
  '@lezer/python',
  '@lezer/rust',
  '@lezer/sass',
  '@lezer/xml',
  '@lezer/yaml',

  // language packages
  '@codemirror/lang-angular',
  '@codemirror/lang-cpp',
  '@codemirror/lang-css',
  '@codemirror/lang-go',
  '@codemirror/lang-html',
  '@codemirror/lang-java',
  '@codemirror/lang-javascript',
  '@codemirror/lang-jinja',
  '@codemirror/lang-json',
  '@codemirror/lang-less',
  '@codemirror/lang-lezer',
  '@codemirror/lang-liquid',
  '@codemirror/lang-markdown',
  '@codemirror/lang-php',
  '@codemirror/lang-python',
  '@codemirror/lang-rust',
  '@codemirror/lang-sass',
  '@codemirror/lang-sql',
  '@codemirror/lang-vue',
  '@codemirror/lang-wast',
  '@codemirror/lang-xml',
  '@codemirror/lang-yaml',
];

const toIntermediateName = (packageName) => packageName.replace(/\//g, '_');

// Pre-bundle a CJS package entry into a single file, inlining all relative
// requires. Non-relative requires (npm packages) remain as external require()
// calls so the babel IoC transform can convert them to requireAsyncModule().
const bundleToSingleFile = async (entryFile) => {
  const bundle = await rollup({
    input: entryFile,
    plugins: [commonjs()],
    external: (id) => !id.startsWith('.') && !isAbsolute(id),
    onwarn: () => {},
  });
  const { output } = await bundle.generate({ format: 'cjs', exports: 'auto' });
  await bundle.close();
  let code = output[0].code;
  // Rollup's getDefaultExportFromCjs unwraps __esModule modules to just their
  // default export, losing named exports like createTheme. Replace it with an
  // identity so the full CJS exports object is preserved and requireAsyncModule
  // returns { createTheme, default, ... } instead of just createTheme.
  code = code.replace(
    /function getDefaultExportFromCjs\s*\([^)]*\)\s*\{[^}]+\}/,
    'function getDefaultExportFromCjs(x){return x}',
  );
  return code;
};

const convertModuleFile = async (moduleFile, intermediateName) => {
  const fileContent = await bundleToSingleFile(moduleFile);
  const { code } = babel.transformSync(fileContent, {
    plugins: [
      wrapWithAsyncFn(false, { hoistNestedRequires: true, requireName: 'requireAsyncModule' }),
    ],
    presets: [
      [
        'minify',
        {
          builtIns: false,
          mangle: false,
        },
      ],
    ],
  });

  await writeFile(resolve(DIST_CODEMIRROR_FOLDER, `${intermediateName}.js`), code);
};

const resolvePackageEntry = async (packageName) => {
  const pkgPath = resolve(NODE_MODULES, packageName);
  try {
    const packageJson = JSON.parse(await readFile(resolve(pkgPath, 'package.json')));
    const { main, exports: { require: requireFile } = {} } = packageJson;
    return resolve(pkgPath, requireFile || main || 'index.cjs');
  } catch {
    // Sub-path import (e.g. @babel/runtime/helpers/interopRequireDefault) —
    // no package.json, resolve directly as a .js file.
    return pkgPath + '.js';
  }
};

const processPackage = async (packageName) => {
  const intermediateName = toIntermediateName(packageName);
  try {
    const entryFile = await resolvePackageEntry(packageName);
    await convertModuleFile(entryFile, intermediateName);
    return intermediateName;
  } catch (error) {
    console.error(`  Failed: ${packageName} — ${error.message}`);
    return null;
  }
};

(async () => {
  try {
    await rm(DIST_FOLDER, { recursive: true });
  } catch {}
  await mkdir(DIST_FOLDER);
  await mkdir(DIST_CODEMIRROR_FOLDER);

  const intermediates = {};

  console.log('Processing core packages...');
  for (const name of CORE_PACKAGES) {
    process.stdout.write(`  ${name} ... `);
    const intermediateName = await processPackage(name);
    if (intermediateName) {
      intermediates[name] = { file: intermediateName, core: true };
      console.log('ok');
    }
  }

  console.log('Processing separate packages...');
  for (const name of SEPARATE_PACKAGES) {
    process.stdout.write(`  ${name} ... `);
    const intermediateName = await processPackage(name);
    if (intermediateName) {
      intermediates[name] = { file: intermediateName };
      console.log('ok');
    }
  }

  console.log('Processing legacy modes...');
  const legacyModesPath = resolve(NODE_MODULES, '@codemirror/legacy-modes/mode');
  const legacyModeFiles = await readdir(legacyModesPath);
  for (const fileName of legacyModeFiles) {
    if (extname(fileName) !== '.cjs') continue;
    const modeName = basename(fileName, '.cjs');
    const packageName = `@codemirror/legacy-modes/mode/${modeName}`;
    const intermediateName = toIntermediateName(packageName);
    process.stdout.write(`  ${packageName} ... `);
    try {
      await convertModuleFile(resolve(legacyModesPath, fileName), intermediateName);
      intermediates[packageName] = { file: intermediateName };
      console.log('ok');
    } catch (error) {
      console.error(`failed — ${error.message}`);
    }
  }

  // Iteratively resolve any transitive deps (e.g. @babel/runtime helpers) that
  // were required by built files but not listed in SEPARATE_PACKAGES.
  let missingFound = true;
  while (missingFound) {
    missingFound = false;
    const missing = new Set();
    for (const fileName of await readdir(DIST_CODEMIRROR_FOLDER)) {
      if (extname(fileName) !== '.js' || fileName === '_core.js') continue;
      const code = await readFile(resolve(DIST_CODEMIRROR_FOLDER, fileName), 'utf8');
      for (const [, name] of code.matchAll(/requireAsyncModule\(["']([^"']+)["']\)/g)) {
        if (!intermediates[name]) missing.add(name);
      }
    }
    if (missing.size > 0) {
      missingFound = true;
      console.log(`Resolving ${missing.size} missing transitive dependencies...`);
      for (const name of [...missing].sort()) {
        process.stdout.write(`  ${name} ... `);
        const intermediateName = await processPackage(name);
        if (intermediateName) {
          intermediates[name] = { file: intermediateName };
          console.log('ok');
        }
      }
    }
  }

  console.log('Generating core bundle...');
  const coreNames = CORE_PACKAGES.filter((name) => intermediates[name]);
  let bundleCode = '';
  const initFnNames = [];

  for (const name of coreNames) {
    const initFnName = `_coreInit_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    initFnNames.push({ name, initFnName });
    const code = await readFile(
      resolve(DIST_CODEMIRROR_FOLDER, `${intermediates[name].file}.js`),
      'utf8',
    );
    bundleCode +=
      code.replace('async function moduleInitFunction', `async function ${initFnName}`) + '\n';
  }

  const initCalls = initFnNames
    .map(({ name, initFnName }) => `  r[${JSON.stringify(name)}]=await ${initFnName}(_req,{});`)
    .join('\n');

  bundleCode += `async function moduleInitFunction(_g){const r={};const _req=(n)=>{if(Object.prototype.hasOwnProperty.call(r,n))return r[n];return _g(n);};\n${initCalls}\nreturn r;}`;

  await writeFile(resolve(DIST_CODEMIRROR_FOLDER, '_core.js'), bundleCode);

  for (const name of coreNames) {
    intermediates[name].bundle = '_core';
  }

  await writeFile(resolve(DIST_FOLDER, 'modules.json'), JSON.stringify(intermediates, null, 2));

  // Inject module map into requireAsyncModule.js and write to dist/
  const loaderSource = await readFile(resolve(process.cwd(), 'requireAsyncModule.js'), 'utf8');
  const loaderWithMap = loaderSource.replace(
    'export const modules = null;',
    `export const modules = ${JSON.stringify(intermediates)};`,
  );
  await writeFile(resolve(DIST_FOLDER, 'requireAsyncModule.js'), loaderWithMap);

  // Copy index.js to dist/
  await copyFile(resolve(process.cwd(), 'index.js'), resolve(DIST_FOLDER, 'index.js'));

  console.log('\nUpdating docs...');
  await rm(DOCS_CODEMIRROR_FOLDER, { recursive: true }).catch(() => {});
  await mkdir(DOCS_CODEMIRROR_FOLDER, { recursive: true });

  const codemirrorFiles = await readdir(DIST_CODEMIRROR_FOLDER);
  for (const fileName of codemirrorFiles) {
    if (extname(fileName) === '.js') {
      await copyFile(
        resolve(DIST_CODEMIRROR_FOLDER, fileName),
        resolve(DOCS_CODEMIRROR_FOLDER, fileName),
      );
    }
  }
  await copyFile(
    resolve(DIST_FOLDER, 'requireAsyncModule.js'),
    resolve(DOCS_FOLDER, 'requireAsyncModule.js'),
  );
  await copyFile(resolve(DIST_FOLDER, 'index.js'), resolve(DOCS_FOLDER, 'index.js'));

  const total = Object.keys(intermediates).length;
  const coreCount = CORE_PACKAGES.length;
  console.log(
    `Done. ${total} modules processed (${coreCount} core, ${total - coreCount} separate).`,
  );
})();
