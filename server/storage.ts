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
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (Required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Demon operations
  getAllDemons(): Promise<Demon[]>;
  getDemon(id: string): Promise<Demon | undefined>;
  createDemon(demon: InsertDemon): Promise<Demon>;
  updateDemon(id: string, demon: Partial<InsertDemon>): Promise<Demon>;
  deleteDemon(id: string): Promise<void>;

  // Record operations
  getAllRecords(): Promise<any[]>;
  getRecordsByUser(userId: string): Promise<Record[]>;
  createRecord(userId: string, record: InsertRecord): Promise<Record>;
  approveRecord(recordId: string, reviewerId: string): Promise<void>;
  rejectRecord(recordId: string, reviewerId: string): Promise<void>;

  // Leaderboard operations
  getLeaderboard(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
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
  async getLeaderboard(): Promise<any[]> {
    // Calculate points for each user based on approved records
    const result = await db
      .select({
        userId: records.userId,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        points: sql<number>`SUM(${demons.points})`,
        completions: sql<number>`COUNT(${records.id})`,
      })
      .from(records)
      .leftJoin(users, eq(records.userId, users.id))
      .leftJoin(demons, eq(records.demonId, demons.id))
      .where(eq(records.status, "approved"))
      .groupBy(records.userId, users.id, users.email, users.firstName, users.lastName, users.profileImageUrl)
      .orderBy(desc(sql`SUM(${demons.points})`));

    // Add rank to each entry
    return result.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}

export const storage = new DatabaseStorage();
