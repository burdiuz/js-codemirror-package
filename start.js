import { resolve, basename, extname } from 'path';
import { stat, rm, mkdir, readdir, readFile, writeFile } from 'fs/promises';
import { spawn } from 'child_process';
import babel from '@babel/core';
import { wrapWithGeneratorFn } from '@actualwave/babel-ioc-dep-wrap-plugin';

const INTERMEDIATE_FOLDER = resolve(process.cwd(), 'intermediate');
const SOURCES_FOLDER = resolve(process.cwd(), 'codemirror.next');
const SOURCE_DEPS_FOLDER = resolve(SOURCES_FOLDER, 'node_modules');
const SOURCES_REPO = 'https://github.com/codemirror/codemirror.next.git';
const EXCLUDES = ['bin', 'node_modules', 'demo'];

const runThrough = (cmd, args, options, done = () => null) => {
  console.log('>----------------------------------- running command');
  console.log('::', cmd, args.join(' '));
  const promise = new Promise((res, rej) => {
    const cb = spawn(cmd, args, options);
    cb.stdout.on('data', (data) => console.log(String(data)));
    cb.stderr.on('data', (data) => console.error(String(data)));
    cb.on('error', (error) => rej(error));
    cb.on('close', (code) => {
      if (code) {
        rej(`Child Process "${cmd}" exited with code ${code}.`);
      } else {
        res(code);
      }
    });
  });

  promise.then(done); // callback execution should not affect returned promise.

  return promise;
};

const convertModuleFile = async (moduleFile, moduleName) => {
  const fileContent = await readFile(moduleFile, { encoding: 'utf8' });
  const { code } = babel.transformSync(fileContent, {
    plugins: [wrapWithGeneratorFn()],
    presets: [
      [
        'minify',
        {
          builtIns: false,
          mangle: false, // removing this causes babel-minify error https://github.com/babel/minify/issues/556
        },
      ],
    ],
  });

  await writeFile(resolve(INTERMEDIATE_FOLDER, `${moduleName}.js`), code);
};

const prepareModule = async (path, modules, intermediates) => {
  let moduleName;
  let moduleFile;

  try {
    const packageJson = JSON.parse(
      await readFile(resolve(path, 'package.json')),
    );
    const {
      name,
      main,
      exports: { require: requireFile } = {},
      dependencies = {},
    } = packageJson;
    moduleName = name;
    moduleFile = resolve(path, requireFile || main || 'index.js');

    if(intermediates[moduleName]) {
      return { modules, intermediates };
    }

    modules = [
      ...modules,
      ...Object.keys(dependencies).map((name) =>
        resolve(SOURCE_DEPS_FOLDER, name),
      ),
    ];
  } catch (error) {
    return { modules, intermediates };
  }

  try {
    const moduleStats = await stat(moduleFile);

    if (moduleStats.isFile()) {
      const intermediateFile = moduleName.replace(/[\\\/]/, '_');
      await convertModuleFile(moduleFile, intermediateFile);
      intermediates = {
        ...intermediates,
        [moduleName]: intermediateFile,
      };
    }
  } catch (error) {
    console.error(moduleFile);
    console.error(error.message);
  }

  return { modules, intermediates };
};

// main execution flow
(async () => {
  try {
    await stat(INTERMEDIATE_FOLDER);
    await rm(INTERMEDIATE_FOLDER, { recursive: true });
  } catch (error) {}

  await mkdir(INTERMEDIATE_FOLDER);

  try {
    await stat(SOURCES_FOLDER);
  } catch (error) {
    await runThrough(`git`, ['clone', SOURCES_REPO]);
  }

  try {
    await stat(SOURCE_DEPS_FOLDER);
  } catch (error) {
    await runThrough('node', ['bin/cm.js', 'install'], {
      cwd: SOURCES_FOLDER,
    });
  }

  let intermediates = {};
  let modules = await readdir(SOURCES_FOLDER);
  modules = modules
    .filter((name) => name.charAt() !== '.' && !EXCLUDES.includes(name))
    .map((name) => resolve(SOURCES_FOLDER, name));

  for (let index = 0; index < modules.length; index++) {
    const path = modules[index];
    const stats = await stat(path);

    if (!stats.isDirectory()) {
      continue;
    }

    ({ modules, intermediates } = await prepareModule(
      path,
      modules,
      intermediates,
    ));
  }

  // legacy modes case
  const legacyModesPath = resolve(SOURCES_FOLDER, 'legacy-modes/mode');
  const legacyStats = await stat(legacyModesPath);

  if (legacyStats.isDirectory()) {
    const legacyModules = await readdir(legacyModesPath);
    for (let name of legacyModules) {
      if (extname(name) != '.cjs') {
        continue;
      }

      const fileName = basename(name, '.cjs');
      const intermediateName = `@codemirror_legacy-modes_mode_${fileName}`;

      await convertModuleFile(resolve(legacyModesPath, name), intermediateName);
      intermediates[`@codemirror/legacy-modes/mode/${fileName}`] =
        intermediateName;
    }
  }

  await writeFile(
    resolve(INTERMEDIATE_FOLDER, '.modules.json'),
    JSON.stringify(intermediates, null, 2),
  );
})();
