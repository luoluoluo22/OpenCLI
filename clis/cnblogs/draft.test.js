import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { parseDraftArgs, parseSavedDraft } from './draft-helpers.js';

describe('CNBlogs draft input and confirmation safety', () => {
  it('rejects missing title / empty body', () => {
    expect(() => parseDraftArgs({content:'hi'})).toThrow();
    expect(() => parseDraftArgs({title:'Hi', content:''})).toThrow();
  });
  it('rejects providing both file and content', () => {
    expect(() => parseDraftArgs({title:'Hi', file:'a.md', content:'hi'})).toThrow();
  });
  it('preserves multiline body', () => {
    expect(parseDraftArgs({title:' X ',content:'# Heading\n\nBody'})).toEqual({title:'X',content:'# Heading\n\nBody'});
  });
  it('reads Markdown file', () => {
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'opencli-cnblogs-'));
    try { const filename=path.join(dir,'x.md'); fs.writeFileSync(filename,'# 测试\n','utf8');
      expect(parseDraftArgs({title:'X',file:filename}).content).toContain('测试');
    } finally { fs.rmSync(dir,{recursive:true,force:true}); }
  });
  it('requires server-side unpublished confirmation', () => {
    const base='https://i.cnblogs.com/posts/edit-done;postId=123;isPublished=';
    expect(() => parseSavedDraft(base+'true','保存成功')).toThrow();
    expect(() => parseSavedDraft(base+'false','error')).toThrow();
    expect(parseSavedDraft(base+'false','保存成功')).toMatchObject({status:'draft_saved',draft_id:'123'});
  });
});
