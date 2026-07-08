import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(
  new URL("../app/comparativo/page.tsx", import.meta.url),
  "utf8"
);
const categoryChart = readFileSync(
  new URL("../components/bar-chart-comparison-category.tsx", import.meta.url),
  "utf8"
);
const pathologyChart = readFileSync(
  new URL("../components/bar-chart-comparison-patologie.tsx", import.meta.url),
  "utf8"
);

test("comparative courses come from the selected school catalog", () => {
  assert.match(page, /fetchCoursesForSchool\(schoolId\)/);
  assert.match(page, /selectedSchoolId/);
  assert.doesNotMatch(page, /\["Todos",\s*"3°B"/);
});

test("selected course filters both course-based comparison charts", () => {
  assert.match(page, /courseName=\{courseFilter\?\.curso_id/);
  assert.match(categoryChart, /item\.name === courseName/);
  assert.match(pathologyChart, /item\.name === courseName/);
});
