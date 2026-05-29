export const ALERTS_VIEW_PERMISSION = "Alertas";
export const ANONYMOUS_STUDENT_IMAGE = "/anonymous-student-avatar.png";

const normalizePermission = (permission: string) =>
  permission.trim().toLowerCase();

export function hasPermission(permissions: string[], permission: string) {
  const target = normalizePermission(permission);
  return permissions.some((item) => normalizePermission(item) === target);
}

export function canRevealStudentIdentity(isAnonymous: boolean) {
  return !isAnonymous;
}

export function getStudentIdentityLabel(
  studentName: string | undefined,
  isAnonymous: boolean
) {
  if (!canRevealStudentIdentity(isAnonymous)) return "Anónimo";
  return studentName?.trim() || "Estudiante";
}

export function shouldUseDefaultStudentImage(isAnonymous: boolean) {
  return !canRevealStudentIdentity(isAnonymous);
}
