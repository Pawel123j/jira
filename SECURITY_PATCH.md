# Temporary dependency security patch

Reviewed again on **2026-11-17**, using Node 24.19.0 and a clean `npm ci`.
The registry still publishes `braces@3.0.3` as latest. Its unpatched string parser
permits recursive nesting that can overflow the stack (GHSA-vfj7-8cjw-p6xm).
The versioned patch rejects nesting beyond 128 before compilation, stringification
or expansion. Untrusted prebuilt AST objects are outside the string-pattern API
used by this project's build tools.

`npm ci` applies the patch with `patch-package --error-on-fail`.
`npm run security:check` obtains a fresh full audit and verifies the package name,
version and parser SHA-256 for **every braces copy in package-lock.json**, plus
any additional copy reported by the feed. Verification is mandatory even when the
feed omits the advisory. Missing/changed patches, unavailable audit, unexpected
advisories at **any severity**, or the review deadline fail the gate.

## Review evidence

An independent review reproduced an unpatched stack overflow using 4999 nested
delimiters and a 9999-character pattern, below the separate length limit.
The patched parser rejects it with the nesting error. Persistent checks cover:

- Valid 127/128-level patterns and rejection at 129, including public string APIs.
- Braces, parentheses, mixed/mismatched/unfinished input and very long patterns.
- Escaped/quoted delimiters, literal character classes, shallow groups and ranges.
- Empty advisory feeds, altered root and nested locked copies, paths outside
  node_modules, exact advisory matching and unexpected severities including info.

The new assessment supports review **before 2026-12-17**. This is a temporary
mitigation, not an upstream fix. Remove the patch/exception when a compatible
fixed version is released; do not extend its deadline without another assessment.
The Nov 17 raw npm audit reported zero advisories; this does not remove the need
to validate the patch. `npm run test:security` runs the gate fixtures offline.

Selector-parser issues are addressed with 7.1.6. The targeted
`@typescript-eslint/typescript-estree` override to `minimatch@11.0.8` addresses
GHSA-g3hv-icrc-35l4 without changing other dependency paths. Lint, types, build
and browser CI continue to verify integration on Node 24.
