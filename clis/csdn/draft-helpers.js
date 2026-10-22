import * as fs from 'node:fs';
import * as path from 'node:path';
import { ArgumentError, CommandExecutionError } from '@jackwener/opencli/errors';

export function parseDraftArgs(args) {
  const title = String(args.title ?? '').trim();
  if (title.length < 5 || title.length > 100) throw new ArgumentError('CSDN article title must contain 5–100 characters');
  const contentProvided = !!String(args.content ?? '').trim();
  const fileProvided = !!String(args.file ?? '').trim();
  if (contentProvided === fileProvided) throw new ArgumentError('Provide exactly one of content or --file');
  let content = String(args.content ?? '');
  if (fileProvided) {
    const filename = path.resolve(String(args.file));
    if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) throw new ArgumentError('Markdown file not found: ' + filename);
    content = fs.readFileSync(filename, 'utf8');
  }
  if (!content.trim()) throw new ArgumentError('Markdown draft cannot be empty');
  return { title, content };
}

export function verifyDraft(fields, expected) {
  const normalize = text => String(text ?? '').replace(/\r\n/g,'\n').trimEnd();
  if (String(fields?.title ?? '').trim() !== expected.title || normalize(fields?.content) !== normalize(expected.content)) {
    throw new CommandExecutionError('Draft content verification failed; saved text differs from requested input');
  }
}

export function getDraftId(url) {
  const match = /[?&]articleId=(\d+)/.exec(url ?? '');
  if (!match) throw new CommandExecutionError('CSDN draft did not return an articleId');
  return match[1];
}
