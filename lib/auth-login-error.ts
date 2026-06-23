const PROFILE_VALIDATION_ERROR =
  "No pudimos validar tu perfil después del inicio de sesión. Intenta nuevamente o contacta soporte.";

export function normalizeLoginActionErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return "Ocurrió un error inesperado";
  }

  const message = error.message?.trim();
  if (!message) {
    return "Ocurrió un error inesperado";
  }

  if (
    message.includes("reading 'nombre'") ||
    message.includes('reading "nombre"') ||
    message.includes("perfil incompleto")
  ) {
    return PROFILE_VALIDATION_ERROR;
  }

  return message;
}

export { PROFILE_VALIDATION_ERROR };
