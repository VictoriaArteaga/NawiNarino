const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return email.length <= 254 && EMAIL_RE.test(email);
}

/** Misma regla que el backend: 8–128 caracteres con letras y números. */
export function passwordProblem(password: string): string | undefined {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (password.length > 128) return "La contraseña es demasiado larga";
  if (!/[A-Za-zÀ-ɏ]/.test(password) || !/\d/.test(password)) {
    return "La contraseña debe incluir letras y números";
  }
  return undefined;
}
