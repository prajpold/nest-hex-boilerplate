import { describe, expect, it } from "vitest";

import { InvalidEmailError } from "@modules/users/domain/errors/invalid-email.error";

import { Email } from "./email.vo";

describe("Email", () => {
  it("creates a valid email", () => {
    const email = Email.create("Test@Example.com");
    expect(email.toString()).toBe("test@example.com");
  });

  it("throws InvalidEmailError for malformed input", () => {
    expect(() => Email.create("not-an-email")).toThrow(InvalidEmailError);
  });

  it("two emails with same value are equal", () => {
    const a = Email.create("same@example.com");
    const b = Email.create("SAME@example.com");
    expect(a.equals(b)).toBe(true);
  });
});
