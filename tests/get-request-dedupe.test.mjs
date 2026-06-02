import assert from "node:assert/strict";

const { createGetRequestDeduper } = await import("../lib/get-request-dedupe.ts");

let calls = 0;
const dedupeGet = createGetRequestDeduper({ recentTtlMs: 500 });

const [first, second] = await Promise.all([
  dedupeGet("/alumnos/detalle/713", { params: { colegio_id: 0 } }, async () => {
    calls += 1;
    return { data: { id: 713 } };
  }),
  dedupeGet("/alumnos/detalle/713", { params: { colegio_id: 0 } }, async () => {
    calls += 1;
    return { data: { id: 713 } };
  }),
]);

assert.equal(calls, 1);
assert.equal(first, second);

const third = await dedupeGet("/alumnos/detalle/713", { params: { colegio_id: 0 } }, async () => {
  calls += 1;
  return { data: { id: 713 } };
});

assert.equal(calls, 1);
assert.equal(third, first);

await new Promise((resolve) => setTimeout(resolve, 550));

await dedupeGet("/alumnos/detalle/713", { params: { colegio_id: 0 } }, async () => {
  calls += 1;
  return { data: { id: 713, fresh: true } };
});

assert.equal(calls, 2);
