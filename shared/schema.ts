// Database schema for Geometry Dash Demonlist
// References: javascript_database and javascript_log_in_with_replit blueprints

import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// SESSION AND USER TABLES (Required for Replit Auth)
// ============================================================================

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isModerator: boolean("is_moderator").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// ============================================================================
// DEMONLIST TABLES
// ============================================================================

// Demons table - stores demon levels
export const demons = pgTable("demons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  creator: text("creator").notNull(),
  verifier: text("verifier"),
  difficulty: varchar("difficulty", { length: 50 }).notNull(), // Easy, Medium, Hard, Insane, Extreme
  position: integer("position").notNull().unique(),
  points: integer("points").notNull(),
  videoUrl: text("video_url"),
  completionCount: integer("completion_count").notNull().default(0),
  listType: varchar("list_type", { length: 50 }).notNull().default("demonlist"), // demonlist, challenge, unrated, upcoming
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDemonSchema = createInsertSchema(demons).omit({
  id: true,
  completionCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  difficulty: z.enum(["Easy", "Medium", "Hard", "Insane", "Extreme"]),
  position: z.number().int().positive(),
  points: z.number().int().positive(),
  listType: z.enum(["demonlist", "challenge", "unrated", "upcoming"]).default("demonlist"),
});

export type InsertDemon = z.infer<typeof insertDemonSchema>;
export type Demon = typeof demons.$inferSelect;

// Records/Submissions table - stores player completion submissions
export const records = pgTable("records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  demonId: varchar("demon_id").notNull().references(() => demons.id, { onDelete: "cascade" }),
  videoUrl: text("video_url").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  userId: true,
  status: true,
  submittedAt: true,
  reviewedAt: true,
  reviewedBy: true,
}).extend({
  videoUrl: z.string().url("Must be a valid URL"),
});

export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof records.$inferSelect;

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  records: many(records),
}));

export const demonsRelations = relations(demons, ({ many }) => ({
  records: many(records),
}));

export const recordsRelations = relations(records, ({ one }) => ({
  user: one(users, {
    fields: [records.userId],
    references: [users.id],
  }),
  demon: one(demons, {
    fields: [records.demonId],
    references: [demons.id],
  }),
  reviewer: one(users, {
    fields: [records.reviewedBy],
    references: [users.id],
  }),
}));
