import { describe, it, expect } from "vitest";
import {
  validatePassword,
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  passwordSchema,
  emailSchema,
} from "@/lib/validations/auth";

describe("Password Validation", () => {
  describe("validatePassword", () => {
    it("returns true for valid password", () => {
      const result = validatePassword("Password1!");
      expect(result).toBe(true);
    });

    it("returns errors for password too short", () => {
      const result = validatePassword("Pass1!");
      expect(result).not.toBe(true);
      if (result !== true) {
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Password must be at least 8 characters");
      }
    });

    it("returns errors for password without number", () => {
      const result = validatePassword("Password!");
      expect(result).not.toBe(true);
      if (result !== true) {
        expect(result.valid).toBe(false);
        expect(result.errors).toContain("Password must contain at least 1 number");
      }
    });

    it("returns errors for password without special character", () => {
      const result = validatePassword("Password1");
      expect(result).not.toBe(true);
      if (result !== true) {
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          "Password must contain at least 1 special character"
        );
      }
    });

    it("returns multiple errors for completely invalid password", () => {
      const result = validatePassword("pass");
      expect(result).not.toBe(true);
      if (result !== true) {
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(1);
      }
    });
  });

  describe("passwordSchema", () => {
    it("accepts valid passwords", () => {
      const validPasswords = [
        "Password1!",
        "MySecure@123",
        "Test#Pass99",
        "Complex!Password1",
      ];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid passwords", () => {
      const invalidPasswords = [
        "short1!", // too short
        "NoNumbers!", // no number
        "NoSpecial1", // no special char
        "", // empty
      ];

      invalidPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
      });
    });
  });
});

describe("Email Validation", () => {
  describe("emailSchema", () => {
    it("accepts valid emails", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.org",
        "user+tag@example.co.uk",
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid emails", () => {
      const invalidEmails = [
        "notanemail",
        "@nodomain.com",
        "noat.com",
        "",
        "spaces in@email.com",
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });
});

describe("Login Schema", () => {
  it("validates correct login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("requires email", () => {
    const result = loginSchema.safeParse({
      password: "password",
    });
    expect(result.success).toBe(false);
  });

  it("requires password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("Reset Password Schema", () => {
  it("validates correct email", () => {
    const result = resetPasswordSchema.safeParse({
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = resetPasswordSchema.safeParse({
      email: "notanemail",
    });
    expect(result.success).toBe(false);
  });
});

describe("Update Password Schema", () => {
  it("validates matching passwords", () => {
    const result = updatePasswordSchema.safeParse({
      password: "Password1!",
      confirmPassword: "Password1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-matching passwords", () => {
    const result = updatePasswordSchema.safeParse({
      password: "Password1!",
      confirmPassword: "DifferentPassword1!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords do not match");
    }
  });

  it("validates password requirements even when matching", () => {
    const result = updatePasswordSchema.safeParse({
      password: "weak",
      confirmPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});
