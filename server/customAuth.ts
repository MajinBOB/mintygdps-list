// Custom email/password authentication
import * as bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { Express } from "express";
import { fromError } from "zod-validation-error";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
});

export async function setupCustomAuth(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);

      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session
      req.session.user = {
        claims: { sub: user.id, email: user.email },
        customAuth: true,
      };

      res.json({ message: "Logged in successfully" });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ message: error.message || "Login failed" });
    }
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req: any, res) => {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        const error = fromError(validation.error);
        return res.status(400).json({ message: error.toString() });
      }

      const { email, firstName, lastName, password } = validation.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.upsertUser({
        email,
        firstName,
        lastName,
        passwordHash,
      });

      // Set session
      req.session.user = {
        claims: { sub: user.id, email: user.email },
        customAuth: true,
      };

      res.json({ message: "Account created successfully" });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: error.message || "Signup failed" });
    }
  });
}
