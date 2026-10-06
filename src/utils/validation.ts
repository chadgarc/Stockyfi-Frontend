// src/utils/validation.ts
// Shared field validators for login, staff registration, and profile updates.
// Each returns an error string or "" when valid, so pages can render it in red.

export const validateEmail = (email: string): string => {
  if (!email.trim()) return "Enter your email address.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim()))
    return "That doesn't look like an email address.";
  return "";
};

export const validatePassword = (password: string, min = 8): string => {
  if (password.length < min)
    return `Passwords are at least ${min} characters.`;
  return "";
};

// Used by LoginPage; register/profile forms reuse validateEmail and
// validatePassword plus their own name/role/store checks.
export const validateLogin = (email: string, password: string): string => {
  return validateEmail(email) || validatePassword(password);
};
