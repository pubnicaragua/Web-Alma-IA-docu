import assert from "node:assert/strict";

const { normalizeSelectedSchoolId } = await import("../lib/school-id.ts");

assert.equal(normalizeSelectedSchoolId("0"), "0");
assert.equal(normalizeSelectedSchoolId("1"), "1");
assert.equal(normalizeSelectedSchoolId(""), null);
assert.equal(normalizeSelectedSchoolId(null), null);
