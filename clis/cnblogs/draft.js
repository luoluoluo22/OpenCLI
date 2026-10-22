/**
 * Save a Markdown blog post in CNBlogs as an unpublished draft.
 * Never clicks "发布", and confirms isPublished=false in server result.
 */
import { cli, Strategy } from '@jackwener/opencli/registry';
import { AuthRequiredError, CommandExecutionError } from '@jackwener/opencli/errors';
import { parseDraftArgs, parseSavedDraft } from './draft-helpers.js';

const EDIT_URL = 'https://i.cnblogs.com/posts/edit';
cli({
  site: 'cnblogs',
  name: 'draft',
  description: 'Save a Markdown post as an unpublished CNBlogs draft',
  access: 'write',
  domain: 'i.cnblogs.com',
  strategy: Strategy.UI,
  browser: true,
  example: 'opencli cnblogs draft --title "Post title" --file ./post.md',
  args: [
    { name: 'content', positional: true, required: false, help: 'Markdown body, instead of --file' },
    { name: 'title', type: 'string', required: true, help: 'Draft title' },
    { name: 'file', type: 'string', required: false, help: 'UTF-8 Markdown file, instead of content' },
  ],
  columns: ['status', 'draft_id', 'title', 'edit_url'],
  func: async (page, args) => {
    if (!page) throw new CommandExecutionError('Connected browser required');
    const { title, content } = parseDraftArgs(args);
    await page.goto(EDIT_URL, { waitUntil: 'load', settleMs: 1200 });
    const ready = await page.evaluate('() => ({ title: !!document.querySelector("#post-title"), editor: !!document.querySelector("#md-editor") })');
    if (!ready?.title || !ready?.editor) throw new AuthRequiredError('CNBlogs login and Markdown editor required at i.cnblogs.com');
    await page.fillText('#post-title', title);
    await page.fillText('#md-editor', content);
    const fields = await page.evaluate('() => ({ title: document.querySelector("#post-title")?.value || "", content: document.querySelector("#md-editor")?.value || "" })');
    if (fields?.title !== title || fields?.content !== content) {
      throw new CommandExecutionError('Editor field verification failed; refusing to save');
    }
    const clicked = await page.evaluate('() => { const btn = [...document.querySelectorAll("button")].find(e => e.textContent.trim() === "存为草稿" && !e.disabled); if (!btn) return false; btn.click(); return true; }');
    if (!clicked) throw new CommandExecutionError('Save as draft button missing');
    for (let attempt = 0; attempt < 20; attempt++) {
      await page.wait({ time: 0.5 });
      const result = await page.evaluate('() => ({url: location.href, text: document.body.innerText.slice(0, 1800)})');
      if (result?.url?.includes('/posts/edit-done')) return [{ ...parseSavedDraft(result.url, result.text), title }];
    }
    throw new CommandExecutionError('Timed out waiting for saved unpublished draft confirmation');
  },
});
