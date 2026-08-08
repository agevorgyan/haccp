import { TemplateAdapter } from '@nestjs-modules/mailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CustomHandlebarsAdapter
 * A robust, Node.js v24 compliant Handlebars template adapter for @nestjs-modules/mailer.
 */
export class CustomHandlebarsAdapter implements TemplateAdapter {
  compile(mail: any, callback: (err?: any, body?: string) => any, options: any): void {
    try {
      const templateName = mail.data.template;
      let templatePath = templateName;

      if (!path.isAbsolute(templatePath)) {
        const baseDir = options?.template?.dir || options?.dir || path.join(__dirname, '../templates');
        templatePath = templateName.endsWith('.hbs')
          ? path.join(baseDir, templateName)
          : path.join(baseDir, `${templateName}.hbs`);
      }

      if (!fs.existsSync(templatePath)) {
        return callback(new Error(`Email template file not found at path: ${templatePath}`));
      }

      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent, options?.template?.options || options?.options);
      
      const html = compiledTemplate(mail.data.context || {});
      mail.data.html = html;

      return callback(null, html);
    } catch (err) {
      return callback(err);
    }
  }
}
