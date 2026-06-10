export const normalizeSelectedSchoolId = (id: string | null): string | null => {
  return id && id.trim() ? id : null;
};
