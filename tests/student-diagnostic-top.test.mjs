import assert from "node:assert/strict";

const { buildStudentDiagnosticItems } = await import("../lib/student-diagnostic-top.ts");

const source = [
  {
    nombre: "Ansiedad",
    total: 6,
    positivos: 6,
    neutrales: 0,
    negativos: 0,
    color: "#FF8A65",
    cantidad_preguntas: 6,
  },
  {
    nombre: "TEA",
    total: "4",
    positivos: "2",
    neutrales: "1",
    negativos: "1",
    color: null,
    cantidad_preguntas: "3",
  },
  {
    nombre: "TDAH",
    total: 3,
  },
  {
    nombre: "Dislexia",
    total: 2,
  },
  {
    nombre: "Depresión",
    total: 1,
  },
  {
    nombre: "Otro",
    total: 99,
  },
];

assert.deepEqual(buildStudentDiagnosticItems(source), [
  {
    name: "Ansiedad",
    total: 6,
    positivos: 6,
    neutrales: 0,
    negativos: 0,
    color: "#FF8A65",
    cantidadPreguntas: 6,
  },
  {
    name: "TEA",
    total: 4,
    positivos: 2,
    neutrales: 1,
    negativos: 1,
    color: "#94a3b8",
    cantidadPreguntas: 3,
  },
  {
    name: "TDAH",
    total: 3,
    positivos: 0,
    neutrales: 0,
    negativos: 0,
    color: "#94a3b8",
    cantidadPreguntas: 0,
  },
  {
    name: "Dislexia",
    total: 2,
    positivos: 0,
    neutrales: 0,
    negativos: 0,
    color: "#94a3b8",
    cantidadPreguntas: 0,
  },
  {
    name: "Depresión",
    total: 1,
    positivos: 0,
    neutrales: 0,
    negativos: 0,
    color: "#94a3b8",
    cantidadPreguntas: 0,
  },
]);

assert.deepEqual(buildStudentDiagnosticItems([], 5), []);
