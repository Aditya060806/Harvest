import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugins ship with the package; resolve relative to this module, not the cwd.
const PLUGINS_DIR = path.resolve(__dirname, 'packages/core/plugins');
// User configuration lives in their project root.
const CONFIG_PATH = path.join(process.cwd(), 'harvest.config.js');

async function readConfig() {
  try {
    await fs.access(CONFIG_PATH);
    const mod = await import(pathToFileURL(CONFIG_PATH).href);
    return mod.default ?? mod ?? { plugins: {} };
  } catch {
    return { plugins: {} };
  }
}

async function writeConfig(config) {
  const content = `export default ${JSON.stringify(config, null, 2)};\n`;
  await fs.writeFile(CONFIG_PATH, content);
}

async function pluginFiles() {
  try {
    const files = await fs.readdir(PLUGINS_DIR);
    return files.filter(
      (f) => f.endsWith('.js') && f !== 'template.js' && !f.endsWith('.d.ts')
    );
  } catch {
    return [];
  }
}

/** Returns [{ name, enabled }]. Plugins are enabled unless explicitly disabled. */
export async function listPlugins() {
  const files = await pluginFiles();
  const config = await readConfig();
  return files.map((file) => {
    const name = file.replace(/\.js$/, '');
    const enabled = config.plugins?.[name]?.enabled !== false;
    return { name, enabled };
  });
}

export async function setPluginEnabled(name, enabled) {
  const files = await pluginFiles();
  const names = files.map((f) => f.replace(/\.js$/, ''));
  if (!names.includes(name)) {
    throw new Error(`Plugin not found: ${name}`);
  }
  const config = await readConfig();
  config.plugins = config.plugins || {};
  config.plugins[name] = { ...(config.plugins[name] || {}), enabled };
  await writeConfig(config);
}

export async function enablePlugin(name) {
  await setPluginEnabled(name, true);
}

export async function disablePlugin(name) {
  await setPluginEnabled(name, false);
}

export async function createPlugin(name) {
  const safe = String(name).replace(/[^a-z0-9-_]/gi, '');
  if (!safe) throw new Error('Invalid plugin name.');

  const templatePath = path.join(PLUGINS_DIR, 'template.js');
  const newPluginPath = path.join(PLUGINS_DIR, `${safe}.js`);

  const raw = await fs.readFile(templatePath, 'utf8');
  const className = `${safe.charAt(0).toUpperCase()}${safe.slice(1).replace(/[-_]/g, '')}Plugin`;
  const source = raw
    .replace(/class TemplatePlugin/g, `class ${className}`)
    .replace(/static pluginName = 'template';/, `static pluginName = '${safe}';`);

  await fs.writeFile(newPluginPath, source);

  const config = await readConfig();
  config.plugins = config.plugins || {};
  config.plugins[safe] = { enabled: true };
  await writeConfig(config);

  return { name: safe, path: newPluginPath };
}
