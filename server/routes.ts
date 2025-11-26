// API Routes
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSessionAuth, isAuthenticated, isAdmin, isModerator } from "./sessionAuth";
import { setupCustomAuth } from "./customAuth";
import { insertDemonSchema, insertRecordSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session and auth setup
  await setupSessionAuth(app);
  await setupCustomAuth(app);

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

  app.get('/api/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username } = req.body;

      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return res.status(400).json({ message: "Username is required" });
      }

      const user = await storage.updateUserProfile(userId, username.trim());
      res.json(user);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ message: "Username already taken" });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch('/api/auth/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileImageUrl, country } = req.body;

      const user = await storage.updateUserSettings(userId, profileImageUrl, country);
      res.json(user);
    } catch (error: any) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
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

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get a specific demon by ID
  app.get("/api/demons/:id", async (req, res) => {
    try {
      const demonId = req.params.id;
      const demon = await storage.getDemon(demonId);
      if (!demon) {
        return res.status(404).json({ message: "Demon not found" });
      }
      res.json(demon);
    } catch (error) {
      console.error("Error fetching demon:", error);
      res.status(500).json({ message: "Failed to fetch demon" });
    }
  });

  // Get approved records for a demon
  app.get("/api/demons/:id/records", async (req, res) => {
    try {
      const demonId = req.params.id;
      const records = await storage.getApprovedRecordsByDemon(demonId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching records:", error);
      res.status(500).json({ message: "Failed to fetch records" });
    }
  });

  // Get player details
  app.get("/api/players/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const playerDetails = await storage.getPlayerDetails(userId);
      if (!playerDetails) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(playerDetails);
    } catch (error) {
      console.error("Error fetching player details:", error);
      res.status(500).json({ message: "Failed to fetch player details" });
    }
  });

  // Get leaderboard with optional list type filter
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const listType = req.query.listType as string | undefined;
      const leaderboard = await storage.getLeaderboard(listType);
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

      let demonData = { ...validation.data };
      
      // If verifier name is provided, look up the user and set verifierId
      if (validation.data.verifier && validation.data.verifier.trim()) {
        const verifierUser = await storage.getUserByUsername(validation.data.verifier.trim());
        if (verifierUser) {
          demonData = { ...demonData, verifierId: verifierUser.id };
        }
      }

      const demon = await storage.createDemon(demonData);
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

      let demonData: any = { ...validation.data };
      
      // If verifier name is provided, look up the user and set verifierId
      if (validation.data.verifier && validation.data.verifier.trim()) {
        const verifierUser = await storage.getUserByUsername(validation.data.verifier.trim());
        if (verifierUser) {
          demonData = { ...demonData, verifierId: verifierUser.id };
        }
      } else {
        // If verifier is empty, clear the verifierId
        demonData = { ...demonData, verifierId: null };
      }

      const demon = await storage.updateDemon(demonId, demonData);
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

  // Reorder demons and recalculate points (admin or moderator)
  app.post("/api/admin/demons/reorder", isAuthenticated, isModerator, async (req: any, res) => {
    try {
      const { demons: demonOrder, listType } = req.body;
      
      if (!Array.isArray(demonOrder) || !listType) {
        return res.status(400).json({ message: "Invalid request data" });
      }

      await storage.reorderDemons(demonOrder, listType);
      res.json({ message: "Demons reordered and points recalculated" });
    } catch (error: any) {
      console.error("Error reordering demons:", error);
      res.status(500).json({ message: error.message || "Failed to reorder demons" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
