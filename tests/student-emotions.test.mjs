import assert from "node:assert/strict";

const {
  buildEmotionGroups,
  buildRadarComparisonData,
  buildComparisonEmotionNames,
  buildRadarComparisonDataFromApi,
  hasMeaningfulComparisonItems,
} = await import("../lib/student-emotions.ts");

const sourceEmotions = [
  {
    nombre: "Aceptación",
    total: 9,
    positivos: 5,
    neutrales: 0,
    negativos: 0,
    conotacion: "Positiva",
    color: "#4CAF50",
  },
  {
    nombre: "Calma",
    total: 8,
    positivos: 4,
    neutrales: 0,
    negativos: 0,
    conotacion: "Positiva",
    color: "#64B5F6",
  },
  {
    nombre: "Gratitud",
    total: 7,
    positivos: 3,
    neutrales: 0,
    negativos: 0,
    conotacion: "Positiva",
    color: "#8E24AA",
  },
  {
    nombre: "Frustración",
    total: 10,
    positivos: 0,
    neutrales: 0,
    negativos: 6,
    conotacion: "Negativa",
    color: "#EF5350",
  },
  {
    nombre: "Ansiedad",
    total: 6,
    positivos: 0,
    neutrales: 0,
    negativos: 2,
    conotacion: "Negativa",
    color: "#FB8C00",
  },
  {
    nombre: "Calma interna",
    total: 4,
    positivos: 0,
    neutrales: 1,
    negativos: 0,
    conotacion: "Neutra",
    color: "#90A4AE",
  },
];

const groups = buildEmotionGroups(sourceEmotions);

assert.deepEqual(groups.positivo.map((item) => item.name), [
  "Aceptación",
  "Calma",
  "Gratitud",
]);
assert.deepEqual(groups.negativo.map((item) => item.name), [
  "Frustración",
  "Ansiedad",
]);
assert.deepEqual(groups.neutro.map((item) => item.name), ["Calma interna"]);
assert.deepEqual(groups.positivo.map((item) => item.value), [5, 4, 3]);
assert.deepEqual(groups.negativo.map((item) => item.value), [6, 2]);
assert.deepEqual(groups.neutro.map((item) => item.value), [1]);
assert.deepEqual(groups.positivo[0], {
  name: "Aceptación",
  value: 5,
  positivos: 5,
  neutrales: 0,
  negativos: 0,
  color: "#4CAF50",
  connotation: "positivo",
});

const comparisonData = [
  { nombre: "Frustración", cantidad_alumno: 3, proporcion_alumno: 1.4 },
  { nombre: "Aceptación", cantidad_alumno: 4, proporcion_alumno: 2.1 },
  { nombre: "Calma", cantidad_alumno: 2, proporcion_alumno: 1.2 },
];

assert.deepEqual(buildRadarComparisonData(groups, comparisonData), [
  {
    name: "Aceptación",
    alumno: 4,
    promedio: 2.1,
    color: "#4CAF50",
    connotation: "positivo",
  },
  {
    name: "Calma",
    alumno: 2,
    promedio: 1.2,
    color: "#64B5F6",
    connotation: "positivo",
  },
  {
    name: "Frustración",
    alumno: 3,
    promedio: 1.4,
    color: "#EF5350",
    connotation: "negativo",
  },
  {
    name: "Ansiedad",
    alumno: 0,
    promedio: 0,
    color: "#FB8C00",
    connotation: "negativo",
  },
]);

assert.deepEqual(buildRadarComparisonData({ positivo: [], negativo: [], neutro: [] }, []), []);

assert.deepEqual(
  buildComparisonEmotionNames(groups),
  ["Aceptación", "Calma", "Frustración", "Ansiedad"]
);

assert.deepEqual(
  buildComparisonEmotionNames({
    positivo: [{ name: "Alegría" }, { name: "Calma" }, { name: "Confianza" }],
    negativo: [],
    neutro: [],
  }),
  ["Alegría", "Calma"]
);

const comparisonApiResponse = {
  alumno_id: 1610,
  scope: "curso",
  items: [
    {
      emocion: "Aceptación",
      conotacion: "Positiva",
      color: "#4CAF50",
      alumno: 5,
      promedio: 0.3,
      diferencia: 4.7,
    },
    {
      emocion: "Calma",
      conotacion: "Positiva",
      color: "#64B5F6",
      alumno: 4,
      promedio: 0.2,
      diferencia: 3.8,
    },
    {
      emocion: "Frustración",
      conotacion: "Negativa",
      color: "#EF5350",
      alumno: 2,
      promedio: 0.4,
      diferencia: 1.6,
    },
  ],
};

assert.deepEqual(buildRadarComparisonDataFromApi(comparisonApiResponse), [
  {
    name: "Aceptación",
    alumno: 5,
    promedio: 0.3,
    color: "#4CAF50",
    connotation: "positivo",
    diferencia: 4.7,
  },
  {
    name: "Calma",
    alumno: 4,
    promedio: 0.2,
    color: "#64B5F6",
    connotation: "positivo",
    diferencia: 3.8,
  },
  {
    name: "Frustración",
    alumno: 2,
    promedio: 0.4,
    color: "#EF5350",
    connotation: "negativo",
    diferencia: 1.6,
  },
]);

assert.equal(
  hasMeaningfulComparisonItems(buildRadarComparisonDataFromApi(comparisonApiResponse)),
  true
);
assert.equal(
  hasMeaningfulComparisonItems(
    buildRadarComparisonDataFromApi({
      items: [
        {
          emocion: "Aceptación",
          conotacion: "Positiva",
          color: "#4CAF50",
          alumno: 0,
          promedio: 0,
          diferencia: 0,
        },
      ],
    })
  ),
  false
);
