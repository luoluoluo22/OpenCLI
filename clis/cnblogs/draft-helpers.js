import * as fs from 'node:fs';
import * as path from 'node:path';
import { ArgumentError, CommandExecutionError } from '@jackwener/opencli/errors';

export function parseDraftArgs(args) {
  const title = String(args.title ?? '').trim();
  if (!title) throw new ArgumentError('cnblogs draft requires --title');
  if (title.length > 100) throw new ArgumentError('Title exceeds 100 characters');
  const hasFile = Boolean(String(args.file ?? '').trim());
  const hasContent = Boolean(String(args.content ?? '').trim());
  if (hasFile === hasContent) throw new ArgumentError('Provide positional content or --file, not both');
  let content = String(args.content ?? '');
  if (hasFile) {
    const filename = path.resolve(String(args.file));
    if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      throw new ArgumentError('Draft file does not exist: ' + filename);
    }
    content = fs.readFileSync(filename, 'utf8');
  }
  if (!content.trim()) throw new ArgumentError('Draft content cannot be empty');
  return { title, content };
}

export function parseSavedDraft(url, savedText) {
  if (!url.includes('/posts/edit-done') || !url.includes('isPublished=false')) {
    throw new CommandExecutionError('No confirmed unpublished draft save; current URL: ' + url);
  }
  if (!String(savedText).includes('保存成功')) throw new CommandExecutionError('Draft confirmation missing');
  const match = /postId=(\d+)/.exec(url);
  if (!match) throw new CommandExecutionError('Draft saved but post ID missing');
  return { status: 'draft_saved', draft_id: match[1], edit_url: 'https://i.cnblogs.com/posts/edit;postId=' + match[1] };
}
