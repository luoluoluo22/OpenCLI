# CSDN Blog

**Mode:** 🔐 Browser · **Domain:** `editor.csdn.net`

## Commands

| Command | Description |
| --- | --- |
| `opencli csdn draft` | Save and verify an unpublished Markdown article draft |

Sign in to [CSDN blog editor](https://editor.csdn.net/md/) through the connected browser extension.

## Examples

```bash
opencli csdn draft "Markdown body" --title "A tested problem-solving note"
opencli csdn draft --file ./solution.md --title "A tested problem-solving note"
```

The command fills the article title and Markdown editor, selects **保存草稿** from the editor menu, then reloads the created article using the returned `articleId`. It reports success only when the reopened editor contains the expected title and body, preventing a misleading "saved" result if the browser's autosave or menu action silently fails.

**Publishing safety:** The command has no public publish path, and it never clicks **发布文章**. The resulting draft is not indexed as a public article until explicitly published through another action.

**Limitations:** Works with CSDN's desktop Markdown editor and an authenticated browser session. UI changes, risk controls, and alternate editor modes may require an adapter update.
