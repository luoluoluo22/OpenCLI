# CNBlogs (博客园)

**Mode:** 🔐 Browser · **Domain:** `i.cnblogs.com`

## Commands

| Command | Description |
| --- | --- |
| `opencli cnblogs draft` | Create a new unpublished Markdown draft (never publish) |

Sign in to [CNBlogs dashboard](https://i.cnblogs.com/) using the connected browser profile, and select the **Markdown** editor.

## Examples

```bash
opencli cnblogs draft "# Hello" --title "My first draft"
opencli cnblogs draft --file ./article.md --title "Draft from file"
```

The command checks the typed editor fields, clicks the visible **存为草稿** action, and verifies that the completion page includes `isPublished=false` and a `postId`. If any check fails, the command reports an error rather than guessing that the draft was saved. The returned `draft_id` and `edit_url` allow reopening the saved post.

**Publishing safety:** This adapter deliberately implements only `draft`. It has no option to publish, and creates no public article.

**Limitations:** Supports the Markdown editor in the desktop CNBlogs dashboard. A UI redesign, CAPTCHA, expired session, or rich-text editor selection may require manual intervention.
