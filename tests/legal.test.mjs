import assert from "node:assert/strict";

const { MEDICAL_DISCLAIMER_TEXT } = await import("../lib/legal.ts");

assert.equal(
  MEDICAL_DISCLAIMER_TEXT,
  "⚠ AlmaIA no reemplaza evaluación médica ni diagnóstico clínico profesional.",
);
