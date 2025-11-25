// Custom username/password authentication
import * as bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { Express } from "express";
import { fromError } from "zod-validation-error";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
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

      const { username, password } = validation.data;
      const user = await storage.getUserByUsername(username);

      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set session with user data
      req.session.user = {
        claims: { sub: user.id },
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isModerator: user.isModerator,
      };
      req.session.save(() => {
        res.json({ message: "Logged in successfully" });
      });
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

      const { username, password, firstName, lastName } = validation.data;

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.upsertUser({
        username,
        passwordHash,
        firstName,
        lastName,
      });

      // Set session with user data
      req.session.user = {
        claims: { sub: user.id },
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        isModerator: user.isModerator,
      };
      req.session.save(() => {
        res.json({ message: "Account created successfully" });
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ message: error.message || "Signup failed" });
    }
  });
}
