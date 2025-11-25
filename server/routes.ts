// API Routes - references javascript_log_in_with_replit blueprint
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertDemonSchema, insertRecordSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // ============================================================================
  // AUTH ROUTES
  // ============================================================================

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============================================================================
  // PUBLIC ROUTES (No auth required)
  // ============================================================================

  // Get all demons (with optional listType filter)
  app.get("/api/demons", async (req, res) => {
    try {
      const listType = req.query.listType as string | undefined;
      const demons = await storage.getAllDemons(listType);
      res.json(demons);
    } catch (error) {
      console.error("Error fetching demons:", error);
      res.status(500).json({ message: "Failed to fetch demons" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // ============================================================================
  // PROTECTED ROUTES (Auth required)
  // ============================================================================

  // Submit a record
  app.post("/api/records", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertRecordSchema.safeParse(req.body);
      
      if (!validation.success) {
        const validationError = fromError(validation.error);
        return res.status(400).json({ message: validationError.toString() });
      }

      const record = await storage.createRecord(userId, validation.data);
      res.json(record);
    } catch (error: any) {
      console.error("Error creating record:", error);
      res.status(500).json({ message: error.message || "Failed to create record" });
    }
  });

  // ============================================================================
  // ADMIN ROUTES (Admin auth required)
  // ============================================================================

  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get all records with user and demon data (admin only)
  app.get("/api/admin/records", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const records = await storage.getAllRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ message: "Failed to fetch records" });
    }
  });

  // Approve a record (admin only)
  app.post("/api/admin/records/:id/approve", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const recordId = req.params.id;
      const reviewerId = req.user.claims.sub;
      await storage.approveRecord(recordId, reviewerId);
      res.json({ message: "Record approved" });
    } catch (error: any) {
      console.error("Error approving record:", error);
      res.status(500).json({ message: error.message || "Failed to approve record" });
    }
  });

  // Reject a record (admin only)
  app.post("/api/admin/records/:id/reject", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const recordId = req.params.id;
      const reviewerId = req.user.claims.sub;
      await storage.rejectRecord(recordId, reviewerId);
      res.json({ message: "Record rejected" });
    } catch (error: any) {
      console.error("Error rejecting record:", error);
      res.status(500).json({ message: error.message || "Failed to reject record" });
    }
  });

  // Create a demon (admin only)
  app.post("/api/admin/demons", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validation = insertDemonSchema.safeParse(req.body);
      
      if (!validation.success) {
        const validationError = fromError(validation.error);
        return res.status(400).json({ message: validationError.toString() });
      }

      const demon = await storage.createDemon(validation.data);
      res.json(demon);
    } catch (error: any) {
      console.error("Error creating demon:", error);
      res.status(500).json({ message: error.message || "Failed to create demon" });
    }
  });

  // Update a demon (admin only)
  app.put("/api/admin/demons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const demonId = req.params.id;
      const validation = insertDemonSchema.safeParse(req.body);
      
      if (!validation.success) {
        const validationError = fromError(validation.error);
        return res.status(400).json({ message: validationError.toString() });
      }

      const demon = await storage.updateDemon(demonId, validation.data);
      res.json(demon);
    } catch (error: any) {
      console.error("Error updating demon:", error);
      res.status(500).json({ message: error.message || "Failed to update demon" });
    }
  });

  // Delete a demon (admin only)
  app.delete("/api/admin/demons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const demonId = req.params.id;
      await storage.deleteDemon(demonId);
      res.json({ message: "Demon deleted" });
    } catch (error: any) {
      console.error("Error deleting demon:", error);
      res.status(500).json({ message: error.message || "Failed to delete demon" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
