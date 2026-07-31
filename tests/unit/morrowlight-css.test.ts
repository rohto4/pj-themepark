import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('Morrowlight CSS tokens', () => {
  it('defines every custom property used by the authored experience', () => {
    const css = readFileSync(path.resolve('src/styles/morrowlight.css'), 'utf8');
    const app = readFileSync(path.resolve('src/app/App.tsx'), 'utf8');
    const definitions = new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]));
    for (const match of app.matchAll(/['"](--[a-z0-9-]+)['"]\s*:/gi)) {
      definitions.add(match[1]);
    }
    const usages = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/gi)].map((match) => match[1]));
    const undefinedTokens = [...usages].filter((token) => !definitions.has(token)).sort();

    expect(undefinedTokens).toEqual([]);
  });
});
