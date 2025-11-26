// Database Storage - references javascript_database and javascript_log_in_with_replit blueprints
import {
  users,
  demons,
  records,
  packs,
  packLevels,
  type User,
  type UpsertUser,
  type Demon,
  type InsertDemon,
  type Record,
  type InsertRecord,
  type Pack,
  type InsertPack,
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

  // Pack operations
  getAllPacks(listType?: string): Promise<any[]>;
  getPack(id: string): Promise<any>;
  createPack(pack: InsertPack): Promise<Pack>;
  updatePack(id: string, pack: Partial<InsertPack>): Promise<Pack>;
  deletePack(id: string): Promise<void>;
  addLevelToPack(packId: string, demonId: string): Promise<void>;
  removeLevelFromPack(packId: string, demonId: string): Promise<void>;
  getPacksByUser(userId: string): Promise<any[]>;
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
    // Check if a demon with this position already exists in the same list type
    const existingAtPosition = await db
      .select()
      .from(demons)
      .where(and(
        eq(demons.position, demonData.position),
        eq(demons.listType, demonData.listType)
      ));

    // If a demon exists at this position, shift all demons at this position and below down by 1
    if (existingAtPosition.length > 0) {
      await db
        .update(demons)
        .set({
          position: sql`${demons.position} + 1`,
          updatedAt: new Date(),
        })
        .where(and(
          sql`${demons.position} >= ${demonData.position}`,
          eq(demons.listType, demonData.listType)
        ));
    }

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
    // Calculate points based on position
    // Standard lists: rank #1 = 300 pts, rank #200 = 1 pt, 201+ = 0 pts
    // Challenge list: rank #1 = 300 pts, rank #100 = 1 pt, 101+ = 0 pts (no submissions accepted)
    const calculatePoints = (position: number): number => {
      // Challenge list only accepts positions 1-100
      if (listType === "challenge") {
        if (position < 1 || position > 100) return 0;
        if (position === 1) return 300;
        if (position === 100) return 1;
        // Linear interpolation: points = 300 - ((position - 1) * 299 / 99)
        const points = 300 - ((position - 1) * 299 / 99);
        return Math.round(points);
      } else {
        // Standard lists: 1-200
        if (position < 1 || position > 200) return 0;
        if (position === 1) return 300;
        if (position === 200) return 1;
        // Linear interpolation: points = 300 - ((position - 1) * 299 / 199)
        const points = 300 - ((position - 1) * 299 / 199);
        return Math.round(points);
      }
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

  async deleteRecord(recordId: string): Promise<void> {
    const record = await db
      .select()
      .from(records)
      .where(eq(records.id, recordId));

    if (!record || record.length === 0) {
      throw new Error("Record not found");
    }

    // If record is approved, decrement completion count
    if (record[0].status === "approved") {
      await db
        .update(demons)
        .set({
          completionCount: sql`${demons.completionCount} - 1`,
        })
        .where(eq(demons.id, record[0].demonId));
    }

    // Delete the record
    await db
      .delete(records)
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

      const completionPoints = Number(completionResult[0]?.points) || 0;
      const completions = Number(completionResult[0]?.completions) || 0;
      const verifierPoints = Number(verifierResult[0]?.verifierPoints) || 0;
      const verifiedCount = Number(verifierResult[0]?.verifiedCount) || 0;

      // Calculate pack completion bonus points
      let packBonusPoints = 0;
      try {
        const userPacks = await this.getPacksByUser(user.id);
        const completedPacks = userPacks.filter(p => p.isCompleted);
        packBonusPoints = completedPacks.reduce((sum, pack) => sum + pack.points, 0);
      } catch (error) {
        // Silently fail if packs feature not ready
        packBonusPoints = 0;
      }

      const totalPoints = completionPoints + verifierPoints + packBonusPoints;
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
        packBonusPoints,
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
    
    // Calculate pack completion bonus points
    let packBonusPoints = 0;
    try {
      const userPacks = await this.getPacksByUser(userId);
      const completedPacks = userPacks.filter(p => p.isCompleted);
      packBonusPoints = completedPacks.reduce((sum, pack) => sum + pack.points, 0);
    } catch (error) {
      // Silently fail if packs feature not ready
      packBonusPoints = 0;
    }
    
    const totalPoints = completionPoints + verifierPoints + packBonusPoints;

    return {
      user: {
        id: user.id,
        username: user.username,
        profileImageUrl: user.profileImageUrl,
        country: user.country,
      },
      completedLevels: completedRecords.map(r => r.demon).filter(Boolean),
      verifiedLevels: verifiedDemons,
      completedPacks: completedPacks.map(p => ({ id: p.id, name: p.name, points: p.points })),
      completionPoints,
      verifierPoints,
      packBonusPoints,
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

  async getAllPacks(listType?: string): Promise<any[]> {
    const allPacks = await (listType
      ? db.select().from(packs).where(eq(packs.listType, listType))
      : db.select().from(packs));
    
    return await Promise.all(
      allPacks.map(async (pack) => {
        const levels = await db
          .select()
          .from(packLevels)
          .leftJoin(demons, eq(packLevels.demonId, demons.id))
          .where(eq(packLevels.packId, pack.id));
        
        return {
          ...pack,
          levels: levels.map(l => l.demons).filter(Boolean),
        };
      })
    );
  }

  async getPack(id: string): Promise<any> {
    const [pack] = await db.select().from(packs).where(eq(packs.id, id));
    if (!pack) return null;

    const levels = await db
      .select()
      .from(packLevels)
      .leftJoin(demons, eq(packLevels.demonId, demons.id))
      .where(eq(packLevels.packId, id));

    return {
      ...pack,
      levels: levels.map(l => l.demons).filter(Boolean),
    };
  }

  async createPack(packData: InsertPack): Promise<Pack> {
    const [pack] = await db.insert(packs).values(packData).returning();
    return pack;
  }

  async updatePack(id: string, packData: Partial<InsertPack>): Promise<Pack> {
    const [pack] = await db
      .update(packs)
      .set({ ...packData, updatedAt: new Date() })
      .where(eq(packs.id, id))
      .returning();
    return pack;
  }

  async deletePack(id: string): Promise<void> {
    await db.delete(packs).where(eq(packs.id, id));
  }

  async addLevelToPack(packId: string, demonId: string): Promise<void> {
    await db.insert(packLevels).values({ packId, demonId }).onConflictDoNothing();
  }

  async removeLevelFromPack(packId: string, demonId: string): Promise<void> {
    await db
      .delete(packLevels)
      .where(and(eq(packLevels.packId, packId), eq(packLevels.demonId, demonId)));
  }

  async getPacksByUser(userId: string): Promise<any[]> {
    const allPacks = await db.select().from(packs);
    
    return await Promise.all(
      allPacks.map(async (pack) => {
        const levels = await db
          .select({ demonId: packLevels.demonId })
          .from(packLevels)
          .where(eq(packLevels.packId, pack.id));

        const demonIds = levels.map(l => l.demonId);
        
        if (demonIds.length === 0) {
          return { ...pack, isCompleted: false, levels: [] };
        }

        const userRecords = await db
          .select({ demonId: records.demonId })
          .from(records)
          .where(and(
            eq(records.userId, userId),
            eq(records.status, "approved")
          ));

        const userCompletedDemonIds = new Set(userRecords.map(r => r.demonId));
        const isCompleted = demonIds.every(id => userCompletedDemonIds.has(id));

        return { ...pack, isCompleted, levels: demonIds };
      })
    );
  }
}

export const storage = new DatabaseStorage();
