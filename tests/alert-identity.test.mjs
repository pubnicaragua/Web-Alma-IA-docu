import assert from "node:assert/strict";
import {
  canRevealStudentIdentity,
  getStudentIdentityLabel,
  shouldUseDefaultStudentImage,
} from "../lib/alert-identity.ts";

assert.equal(
  canRevealStudentIdentity(false),
  true,
  "alerta no anonima revela identidad"
);

assert.equal(
  canRevealStudentIdentity(true),
  false,
  "alerta anonima nunca revela identidad"
);

assert.equal(
  getStudentIdentityLabel("Ana Perez", false),
  "Ana Perez",
  "alerta no anonima muestra nombre real"
);

assert.equal(
  getStudentIdentityLabel("Ana Perez", true),
  "Anónimo",
  "alerta anonima muestra etiqueta anonima"
);

assert.equal(
  shouldUseDefaultStudentImage(true),
  true,
  "alerta anonima usa imagen default"
);

assert.equal(
  shouldUseDefaultStudentImage(false),
  false,
  "alerta no anonima puede usar imagen real"
);
