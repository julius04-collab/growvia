export const passwordRules = [
  { key: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "lower", label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { key: "upper", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { key: "num", label: "One number (0-9)", test: (p: string) => /\d/.test(p) },
] as const;

export const passwordOk = (p: string) => passwordRules.every((r) => r.test(p));
export const PASSWORD_MESSAGE = "Your password must have at least 8 characters, a lowercase letter, an uppercase letter and a number.";
