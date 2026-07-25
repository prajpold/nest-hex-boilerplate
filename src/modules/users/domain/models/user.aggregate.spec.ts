import { describe, expect, it } from "vitest";

import { Email } from "@modules/users/domain/value-objects/email.vo";
import { HashedPassword } from "@modules/users/domain/value-objects/hashed-password.vo";

import { User } from "./user.aggregate";

describe("User", () => {
  const email = Email.create("test@example.com");
  const password = HashedPassword.fromHash("hashed-value");

  describe("register", () => {
    it("creates a new active user", () => {
      const user = User.register(email, password);

      expect(user.userId).toBeDefined();
      expect(user.userEmail.equals(email)).toBe(true);
      expect(user.active).toBe(true);
    });

    it("emits a UserRegisteredEvent", () => {
      const user = User.register(email, password);
      const events = user.getUncommittedEvents();

      expect(events).toHaveLength(1);
      expect(events[0].constructor.name).toBe("UserRegisteredEvent");
    });
  });

  describe("deactivate", () => {
    it("sets the user as inactive", () => {
      const user = User.register(email, password);
      user.deactivate();

      expect(user.active).toBe(false);
    });
  });

  describe("changePassword", () => {
    it("updates the hashed password", () => {
      const user = User.register(email, password);
      const newPassword = HashedPassword.fromHash("new-hashed-value");

      user.changePassword(newPassword);

      expect(user.hashedPassword.equals(newPassword)).toBe(true);
    });
  });
});
