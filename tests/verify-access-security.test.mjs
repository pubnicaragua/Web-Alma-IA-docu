import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../components/authentication/verify-access.tsx", import.meta.url),
  "utf8"
);

test("VerifyAccess remains closed while permissions are loading", () => {
  assert.match(
    source,
    /Boolean\(userData\)\s*&&\s*!isLoading\s*&&\s*getFuntions\(permission\)/
  );
  assert.doesNotMatch(source, /if\s*\(!userData\)\s*return\s+true/);
  assert.doesNotMatch(source, /if\s*\(isLoading\)\s*return\s+true/);
});

test("VerifyAccess does not redirect before user data resolves", () => {
  assert.match(source, /if\s*\(isLoading\s*\|\|\s*!userData\)\s*return/);
});
