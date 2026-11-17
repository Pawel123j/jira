import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

function runGate(vulnerabilities, { missingPatch = false, extraUnpatchedCopy = false } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'jira-security-gate-'));
  try {
    const lock = JSON.parse(readFileSync(fileURLToPath(new URL('../package-lock.json', import.meta.url)), 'utf8'));
    mkdirSync(join(directory, 'node_modules'), { recursive: true });
    if (extraUnpatchedCopy) {
      const node = 'node_modules/fixture/node_modules/braces';
      lock.packages[node] = { version: '3.0.3' };
      const braces = join(directory, node);
      mkdirSync(join(braces, 'lib'), { recursive: true });
      writeFileSync(join(braces, 'package.json'), JSON.stringify({ name: 'braces', version: '3.0.3' }));
      writeFileSync(join(braces, 'lib/parse.js'), '// Unpatched nested copy omitted by the feed.\n');
    }
    writeFileSync(join(directory, 'package-lock.json'), JSON.stringify(lock));
    if (missingPatch) {
      const braces = join(directory, 'node_modules/braces');
      mkdirSync(join(braces, 'lib'), { recursive: true });
      writeFileSync(join(braces, 'package.json'), JSON.stringify({ name: 'braces', version: '3.0.3' }));
      writeFileSync(join(braces, 'lib/parse.js'), '// Original or modified parser without the required patch.\n');
    } else {
      symlinkSync(fileURLToPath(new URL('../node_modules/braces', import.meta.url)), join(directory, 'node_modules/braces'), 'dir');
    }
    const fakeAudit = join(directory, 'audit.cjs');
    const report = { vulnerabilities, metadata: { vulnerabilities: { total: Object.keys(vulnerabilities).length } } };
    writeFileSync(fakeAudit, `console.log(${JSON.stringify(JSON.stringify(report))});\n`);
    const gate = join(directory, 'security-gate.mjs');
    copyFileSync(fileURLToPath(new URL('./security-gate.mjs', import.meta.url)), gate);
    const result = spawnSync(process.execPath, [gate], {
      cwd: directory,
      env: { ...process.env, npm_execpath: fakeAudit },
      encoding: 'utf8',
      timeout: 10000,
    });
    assert.equal(result.error, undefined);
    return result;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('an empty advisory feed cannot approve a missing source patch', () => {
  const result = runGate({}, { missingPatch: true });
  assert.notEqual(result.status, 0, 'A missing patch must fail even when npm reports zero vulnerabilities');
  assert.match(result.stderr, /Missing or changed nesting-limit patch/);
});

test('an empty advisory feed passes only with the verified source patch', () => {
  const result = runGate({});
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Security gate PASS/);
});

for (const severity of ['info', 'low', 'moderate', 'high', 'critical', 'unknown']) {
  test(`an unmitigated ${severity} advisory fails the gate`, () => {
    const result = runGate({
      fixture: {
        name: 'fixture',
        nodes: ['node_modules/fixture'],
        via: [{ name: 'fixture', severity, url: 'https://github.com/advisories/GHSA-test-unmitigated' }],
      },
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unmitigated audit findings/);
    assert.ok(result.stderr.includes(`${severity}: fixture: https://github.com/advisories/GHSA-test-unmitigated`));
  });
}

test('only the exact patched braces advisory is exempt', () => {
  const vulnerability = {
    name: 'braces',
    nodes: ['node_modules/braces'],
    via: [{ name: 'braces', severity: 'high', url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm' }],
  };
  const patched = runGate({ braces: vulnerability });
  assert.equal(patched.status, 0, patched.stderr);
  const unexpected = runGate({
    braces: { ...vulnerability, via: [{ ...vulnerability.via[0], url: 'https://github.com/advisories/GHSA-test-unmitigated' }] },
  });
  assert.notEqual(unexpected.status, 0);
  assert.match(unexpected.stderr, /Unmitigated audit findings/);
});


test('an empty advisory feed cannot hide an unpatched nested locked copy', () => {
  const result = runGate({}, { extraUnpatchedCopy: true });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing or changed nesting-limit patch/);
});

test('reported patch locations cannot escape node_modules', () => {
  const result = runGate({ braces: {
    name: 'braces', nodes: ['../braces'],
    via: [{ name: 'braces', severity: 'high', url: 'https://github.com/advisories/GHSA-vfj7-8cjw-p6xm' }],
  } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /unexpected package location/);
});
