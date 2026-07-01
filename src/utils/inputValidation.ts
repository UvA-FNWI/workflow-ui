const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Digits, "+", "-" and brackets only.
const PHONE_REGEX = /^[0-9+()-]*$/;

// Empty values are valid here; required-ness is enforced separately.
export const isValidEmail = (value: string): boolean => {
    const trimmed = value.trim();
    return trimmed === "" || EMAIL_REGEX.test(trimmed);
};

export const isValidPhone = (value: string): boolean => PHONE_REGEX.test(value);
