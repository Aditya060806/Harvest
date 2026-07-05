import path from 'node:path';
import { Plugin } from '../src/plugin-interface.js';

/**
 * Starter template for a Harvest plugin.
 *
 * Rename the class and `pluginName`, then implement `applies` + `run`.
 * The engine auto-discovers every plugin in this folder — no registration needed.
 */
export class TemplatePlugin extends Plugin {
  static pluginName = 'template';

  /** Return true for files this plugin should inspect. */
  static applies(filePath) {
    return path.extname(filePath) === '.js';
  }

  /**
   * @param {string} filePath
   * @param {{ content: string, target: string, mode: string }} context
   * @returns {Promise<Array<{ line:number, column:number, severity:'error'|'warning'|'info', message:string }>>}
   */
  async run(filePath, { content }) {
    const issues = [];
    // Example: flag TODO comments.
    content.split('\n').forEach((text, i) => {
      const idx = text.indexOf('TODO');
      if (idx !== -1) {
        issues.push({
          pluginName: this.constructor.pluginName,
          filePath,
          line: i + 1,
          column: idx + 1,
          severity: 'info',
          message: 'Unresolved TODO comment',
        });
      }
    });
    return issues;
  }
}
