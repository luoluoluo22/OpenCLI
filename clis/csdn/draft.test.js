import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { parseDraftArgs, verifyDraft, getDraftId } from './draft-helpers.js';

describe('CSDN draft-only behavior', () => {
  it('enforces CSDN title length and nonempty body', () => {
    expect(() => parseDraftArgs({title:'abc',content:'text'})).toThrow();
    expect(() => parseDraftArgs({title:'Valid Title',content:''})).toThrow();
    expect(() => parseDraftArgs({title:'Valid Title',content:'hi',file:'a.md'})).toThrow();
  });
  it('accepts positional Markdown', () => {
    expect(parseDraftArgs({title:'Valid Title',content:'# Title\nBody'}).content).toContain('Body');
  });
  it('reads local UTF-8 files', () => {
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'opencli-csdn-'));
    try { const file=path.join(dir,'post.md'); fs.writeFileSync(file,'# 汉字\n','utf8');
      expect(parseDraftArgs({title:'Valid Title',file}).content).toContain('汉字');
    } finally { fs.rmSync(dir,{force:true,recursive:true}); }
  });
  it('tolerates contenteditable trailing newline but not different text', () => {
    const wanted={title:'Valid Title',content:'# Heading\ntext'};
    expect(() => verifyDraft({title:wanted.title,content:wanted.content+'\n'},wanted)).not.toThrow();
    expect(() => verifyDraft({title:wanted.title,content:'wrong'},wanted)).toThrow();
  });
  it('requires a persistent article ID', () => {
    expect(getDraftId('https://editor.csdn.net/md?articleId=123456')).toBe('123456');
    expect(() => getDraftId('https://editor.csdn.net/md')).toThrow();
  });
});
