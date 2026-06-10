import assert from "node:assert/strict";

const { runOptionalAxiosRequest } = await import("../lib/optional-axios-request.ts");

let skippedThenCalled = false;
const skipped = await runOptionalAxiosRequest(
  () => undefined,
  () => {
    skippedThenCalled = true;
  }
);

assert.equal(skipped, undefined);
assert.equal(skippedThenCalled, false);

const response = { data: { ok: true } };
let received = null;

const result = await runOptionalAxiosRequest(
  () => Promise.resolve(response),
  (res) => {
    received = res.data;
  }
);

assert.equal(result, response);
assert.deepEqual(received, { ok: true });
