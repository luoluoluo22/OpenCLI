/**
 * Draft-only CSDN Markdown writer.
 * Saves through the editor UI and reloads to validate server persistence.
 * It never clicks the public "发布文章" button.
 */
import { cli, Strategy } from '@jackwener/opencli/registry';
import { AuthRequiredError, CommandExecutionError } from '@jackwener/opencli/errors';
import { parseDraftArgs, verifyDraft, getDraftId } from './draft-helpers.js';

const URL = 'https://editor.csdn.net/md/';
const FIELDS = '() => ({ title: document.querySelector("input[maxlength]")?.value || "", content: document.querySelector("pre[contenteditable]")?.innerText || "" })';

cli({
  site: 'csdn',
  name: 'draft',
  description: 'Create and verify an unpublished CSDN Markdown draft',
  domain: 'editor.csdn.net',
  strategy: Strategy.UI,
  access: 'write',
  browser: true,
  example: 'opencli csdn draft --title "How I solved a problem" --file ./fix.md',
  args: [
    { name: 'content', positional: true, required: false, help: 'Markdown text (instead of --file)' },
    { name: 'title', type: 'string', required: true, help: 'Article title (5–100 characters)' },
    { name: 'file', type: 'string', required: false, help: 'Local UTF-8 Markdown path (instead of content)' },
  ],
  columns: ['status', 'draft_id', 'title', 'edit_url'],
  func: async (page, args) => {
    if (!page) throw new CommandExecutionError('A connected browser is required');
    const wanted = parseDraftArgs(args);
    await page.goto(URL, { waitUntil:'load', settleMs:1200 });
    const ready = await page.evaluate('() => ({ title: !!document.querySelector("input[maxlength]"), body: !!document.querySelector("pre[contenteditable]") })');
    if (!ready?.title || !ready?.body) throw new AuthRequiredError('Please sign in to CSDN and open the Markdown editor');

    await page.fillText('input[maxlength="100"]', wanted.title);
    await page.fillText('pre[contenteditable]', wanted.content);
    verifyDraft(await page.evaluate(FIELDS), wanted);

    // Select only save controls and use native CDP clicks, not synthetic JS clicks.
    const opened = await page.evaluate('() => { const b=[...document.querySelectorAll("button")].find(e=>e.textContent.trim()==="保存草稿"); if(!b) return false; b.setAttribute("data-opencli-draft-toggle","1"); return true; }');
    if (!opened) throw new CommandExecutionError('CSDN Save Draft button not found');
    await page.click('button[data-opencli-draft-toggle]');
    await page.wait({time:0.6});
    const menu = await page.evaluate('() => { const links=[...document.querySelectorAll("a")].filter(e=>e.textContent.trim()==="保存草稿"); const a=links.at(-1); if (!a) return false; a.setAttribute("data-opencli-draft-save","1"); return true; }');
    if (!menu) throw new CommandExecutionError('CSDN Save Draft dropdown option unavailable');
    await page.click('a[data-opencli-draft-save]');
    await page.wait({time:2});
    const current = await page.evaluate('() => location.href');
    const id = getDraftId(current);
    const editUrl = 'https://editor.csdn.net/md?articleId=' + id;
    await page.goto(editUrl, {waitUntil:'load', settleMs:1200});
    verifyDraft(await page.evaluate(FIELDS), wanted);
    return [{status:'draft_saved', draft_id:id, title:wanted.title, edit_url:editUrl}];
  },
});
