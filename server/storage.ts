// Database Storage - references javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  demons,
  records,
  type User,
  type UpsertUser,
  type Demon,
  type InsertDemon,
  type Record,
  type InsertRecord,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, username: string): Promise<User>;
  updateUserSettings(userId: string, profileImageUrl?: string, country?: string): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Demon operations
  getAllDemons(): Promise<Demon[]>;
  getDemon(id: string): Promise<Demon | undefined>;
  createDemon(demon: InsertDemon): Promise<Demon>;
  updateDemon(id: string, demon: Partial<InsertDemon>): Promise<Demon>;
  deleteDemon(id: string): Promise<void>;
  reorderDemons(demonOrder: Array<{ id: string; position: number }>, listType: string): Promise<void>;

  // Record operations
  getAllRecords(): Promise<any[]>;
  getRecordsByUser(userId: string): Promise<Record[]>;
  getApprovedRecordsByDemon(demonId: string): Promise<any[]>;
  createRecord(userId: string, record: InsertRecord): Promise<Record>;
  approveRecord(recordId: string, reviewerId: string): Promise<void>;
  rejectRecord(recordId: string, reviewerId: string): Promise<void>;

  // Leaderboard operations
  getLeaderboard(listType?: string): Promise<any[]>;
  
  // Player detail operations
  getPlayerDetails(userId: string): Promise<any>;
  
  // Stats operations
  getStats(): Promise<any>;

  // Moderators operations
  getModerators(): Promise<User[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserProfile(userId: string, username: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSettings(userId: string, profileImageUrl?: string, country?: string): Promise<User> {
    const updates: any = { updatedAt: new Date() };
    if (profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl || null;
    if (country !== undefined) updates.country = country || null;

    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Demon operations
  async getAllDemons(listType?: string): Promise<Demon[]> {
    if (listType && listType !== "all") {
      return await db
        .select()
        .from(demons)
        .where(eq(demons.listType, listType))
        .orderBy(demons.position);
    }
    return await db.select().from(demons).orderBy(demons.position);
  }

  async getDemon(id: string): Promise<Demon | undefined> {
    const [demon] = await db.select().from(demons).where(eq(demons.id, id));
    return demon;
  }

  async createDemon(demonData: InsertDemon): Promise<Demon> {
    const [demon] = await db.insert(demons).values(demonData).returning();
    return demon;
  }

  async updateDemon(id: string, demonData: Partial<InsertDemon>): Promise<Demon> {
    const [demon] = await db
      .update(demons)
      .set({ ...demonData, updatedAt: new Date() })
      .where(eq(demons.id, id))
      .returning();
    return demon;
  }

  async deleteDemon(id: string): Promise<void> {
    await db.delete(demons).where(eq(demons.id, id));
  }

  async reorderDemons(demonOrder: Array<{ id: string; position: number }>, listType: string): Promise<void> {
    // Calculate points based on position (rank #1 = 300 pts, rank #200 = 1 pt, 201+ = 0 pts)
    const calculatePoints = (position: number): number => {
      if (position < 1 || position > 200) return 0;
      if (position === 1) return 300;
      if (position === 200) return 1;
      // Linear interpolation: points = 300 - ((position - 1) * 299 / 199)
      const points = 300 - ((position - 1) * 299 / 199);
      return Math.round(points);
    };

    // STEP 1: Assign temporary unique negative positions to all demons being reordered
    // This avoids unique constraint violations during the update process
    for (let i = 0; i < demonOrder.length; i++) {
      await db
        .update(demons)
        .set({
          position: -(i + 1), // Temporary negative position: -1, -2, -3, etc.
          updatedAt: new Date(),
        })
        .where(eq(demons.id, demonOrder[i].id));
    }

    // STEP 2: Now assign the final correct positions and recalculate points
    // Since all positions are now negative/unique, no conflicts can occur
    for (const { id, position } of demonOrder) {
      const points = calculatePoints(position);
      await db
        .update(demons)
        .set({
          position,
          points,
          updatedAt: new Date(),
        })
        .where(eq(demons.id, id));
    }
  }

  // Record operations
  async getAllRecords(): Promise<any[]> {
    // Join with users and demons to get complete record data
    const result = await db
      .select({
        id: records.id,
        userId: records.userId,
        demonId: records.demonId,
        videoUrl: records.videoUrl,
        status: records.status,
        submittedAt: records.submittedAt,
        reviewedAt: records.reviewedAt,
        reviewedBy: records.reviewedBy,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
        },
        demon: {
          id: demons.id,
          name: demons.name,
          position: demons.position,
          difficulty: demons.difficulty,
          points: demons.points,
        },
      })
      .from(records)
      .leftJoin(users, eq(records.userId, users.id))
      .leftJoin(demons, eq(records.demonId, demons.id))
      .orderBy(desc(records.submittedAt));

    return result;
  }

  async getRecordsByUser(userId: string): Promise<Record[]> {
    return await db
      .select()
      .from(records)
      .where(eq(records.userId, userId))
      .orderBy(desc(records.submittedAt));
  }

  async getApprovedRecordsByDemon(demonId: string): Promise<any[]> {
    return await db
      .select({
        id: records.id,
        userId: records.userId,
        demonId: records.demonId,
        videoUrl: records.videoUrl,
        status: records.status,
        submittedAt: records.submittedAt,
        reviewedAt: records.reviewedAt,
        user: {
          id: users.id,
          username: users.username,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(records)
      .leftJoin(users, eq(records.userId, users.id))
      .where(and(eq(records.status, "approved"), eq(records.demonId, demonId)))
      .orderBy(desc(records.submittedAt));
  }

  async createRecord(userId: string, recordData: InsertRecord): Promise<Record> {
    const [record] = await db
      .insert(records)
      .values({
        ...recordData,
        userId,
        status: "pending",
      })
      .returning();
    return record;
  }

  async approveRecord(recordId: string, reviewerId: string): Promise<void> {
    // Get the record to find the demonId
    const [record] = await db
      .select()
      .from(records)
      .where(eq(records.id, recordId));

    if (!record) {
      throw new Error("Record not found");
    }

    // Update record status
    await db
      .update(records)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      })
      .where(eq(records.id, recordId));

    // Increment demon completion count using SQL to avoid race conditions
    await db
      .update(demons)
      .set({
        completionCount: sql`${demons.completionCount} + 1`,
      })
      .where(eq(demons.id, record.demonId));
  }

  async rejectRecord(recordId: string, reviewerId: string): Promise<void> {
    await db
      .update(records)
      .set({
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      })
      .where(eq(records.id, recordId));
  }

  // Leaderboard operations
  async getLeaderboard(listType?: string): Promise<any[]> {
    // Get all users with their completion points and verifier points
    const allUsers = await db.select().from(users);
    
    const leaderboard = await Promise.all(allUsers.map(async (user) => {
      // Calculate completion points from approved records
      const completionResult = await (listType
        ? db
            .select({
              points: sql<number>`COALESCE(SUM(${demons.points}), 0)`,
              completions: sql<number>`COUNT(${records.id})`,
            })
            .from(records)
            .leftJoin(demons, eq(records.demonId, demons.id))
            .where(and(
              eq(records.userId, user.id),
              eq(records.status, "approved"),
              eq(demons.listType, listType)
            ))
        : db
            .select({
              points: sql<number>`COALESCE(SUM(${demons.points}), 0)`,
              completions: sql<number>`COUNT(${records.id})`,
            })
            .from(records)
            .leftJoin(demons, eq(records.demonId, demons.id))
            .where(and(
              eq(records.userId, user.id),
              eq(records.status, "approved")
            ))
      );

      // Calculate verifier points from demons they verified
      const verifierResult = await (listType
        ? db
            .select({
              verifierPoints: sql<number>`COALESCE(SUM(${demons.points}), 0)`,
              verifiedCount: sql<number>`COUNT(${demons.id})`,
            })
            .from(demons)
            .where(and(
              eq(demons.verifierId, user.id),
              eq(demons.listType, listType)
            ))
        : db
            .select({
              verifierPoints: sql<number>`COALESCE(SUM(${demons.points}), 0)`,
              verifiedCount: sql<number>`COUNT(${demons.id})`,
            })
            .from(demons)
            .where(eq(demons.verifierId, user.id))
      );

      const completionPoints = completionResult[0]?.points || 0;
      const completions = completionResult[0]?.completions || 0;
      const verifierPoints = verifierResult[0]?.verifierPoints || 0;
      const verifiedCount = verifierResult[0]?.verifiedCount || 0;
      const totalPoints = completionPoints + verifierPoints;
      // Verified levels count as completions
      const totalCompletions = completions + verifiedCount;

      return {
        userId: user.id,
        user: {
          id: user.id,
          username: user.username,
          profileImageUrl: user.profileImageUrl,
          country: user.country,
        },
        completionPoints,
        verifierPoints,
        points: totalPoints,
        completions: totalCompletions,
        verifiedCount,
      };
    }));

    // Sort by total points descending
    const sorted = leaderboard.filter(entry => entry.points > 0).sort((a, b) => b.points - a.points);

    // Add rank to each entry
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }

  async getPlayerDetails(userId: string): Promise<any> {
    // Get user
    const user = await this.getUser(userId);
    if (!user) return null;

    // Get completed levels (approved records)
    const completedRecords = await db
      .select({
        demon: {
          id: demons.id,
          name: demons.name,
          creator: demons.creator,
          verifier: demons.verifier,
          difficulty: demons.difficulty,
          position: demons.position,
          points: demons.points,
          videoUrl: demons.videoUrl,
          listType: demons.listType,
        }
      })
      .from(records)
      .leftJoin(demons, eq(records.demonId, demons.id))
      .where(and(eq(records.userId, userId), eq(records.status, "approved")));

    // Get verified levels
    const verifiedDemons = await db
      .select()
      .from(demons)
      .where(eq(demons.verifierId, userId));

    // Calculate points
    const completionPoints = completedRecords.reduce((sum, r) => sum + (r.demon?.points || 0), 0);
    const verifierPoints = verifiedDemons.reduce((sum, d) => sum + (d.points || 0), 0);
    const totalPoints = completionPoints + verifierPoints;

    return {
      user: {
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        country: user.country,
      },
      completedLevels: completedRecords.map(r => r.demon).filter(Boolean),
      verifiedLevels: verifiedDemons,
      completionPoints,
      verifierPoints,
      totalPoints,
    };
  }

  async getStats(): Promise<any> {
    // Total demons in all lists
    const totalDemonsResult = await db
      .select({
        count: sql<number>`COUNT(${demons.id})`,
      })
      .from(demons);

    const totalDemons = totalDemonsResult[0]?.count || 0;

    // Total completed levels + verified levels combined
    const completedResult = await db
      .select({
        count: sql<number>`COUNT(${records.id})`,
      })
      .from(records)
      .where(eq(records.status, "approved"));

    const verifiedResult = await db
      .select({
        count: sql<number>`COUNT(${demons.id})`,
      })
      .from(demons);

    const completed = completedResult[0]?.count || 0;
    const verified = verifiedResult[0]?.count || 0;
    const verifiedRecords = completed + verified;

    // Active players (accounts in database)
    const activePlayers = await db
      .select({
        count: sql<number>`COUNT(${users.id})`,
      })
      .from(users);

    return {
      totalDemons,
      verifiedRecords,
      activePlayers: activePlayers[0]?.count || 0,
    };
  }

  async getModerators(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isModerator, true));
  }
}

export const storage = new DatabaseStorage();
