import assert from "node:assert/strict";

const { normalizeLoginActionErrorMessage } = await import(
  "../lib/auth-login-error.ts"
);

assert.equal(
  normalizeLoginActionErrorMessage(
    new TypeError("Cannot read properties of undefined (reading 'nombre')"),
  ),
  "No pudimos validar tu perfil después del inicio de sesión. Intenta nuevamente o contacta soporte.",
);

assert.equal(
  normalizeLoginActionErrorMessage(
    new Error("Correo o contraseña incorrectos."),
  ),
  "Correo o contraseña incorrectos.",
);
