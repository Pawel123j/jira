import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

test('an empty advisory feed cannot approve a missing source patch', () => {
  const directory = mkdtempSync(join(tmpdir(), 'jira-security-gate-'));
  try {
    const braces = join(directory, 'node_modules/braces');
    mkdirSync(join(braces, 'lib'), { recursive: true });
    writeFileSync(join(braces, 'package.json'), JSON.stringify({ name: 'braces', version: '3.0.3' }));
    writeFileSync(join(braces, 'lib/parse.js'), '// Original or modified parser without the required patch.\n');
    const fakeAudit = join(directory, 'audit.cjs');
    writeFileSync(fakeAudit, 'console.log(JSON.stringify({vulnerabilities: {}, metadata: {vulnerabilities: {total: 0}}}));\n');
    const gate = join(directory, 'security-gate.mjs');
    copyFileSync(fileURLToPath(new URL('./security-gate.mjs', import.meta.url)), gate);
    const result = spawnSync(process.execPath, [gate], {
      cwd: directory,
      env: { ...process.env, npm_execpath: fakeAudit },
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0, 'A missing patch must fail even when npm reports zero vulnerabilities');
    assert.match(result.stderr, /Missing or changed nesting-limit patch/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
