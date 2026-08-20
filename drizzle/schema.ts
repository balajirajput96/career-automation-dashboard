import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, float } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  fullName: varchar("fullName", { length: 255 }).default("Balaji Dilip Singh Rajput").notNull(),
  headline: text("headline"),
  summary: text("summary"),
  skills: text("skills"), // JSON string or comma-separated
  experienceSummary: text("experienceSummary"),
  targetTracks: text("targetTracks"), // JSON string: ["Pharmaceutical", "AI & Python"]
  matchThreshold: float("matchThreshold").default(75.0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  track: mysqlEnum("track", ["Pharmaceutical", "AI & Python"]).notNull(),
  remoteEligibility: varchar("remoteEligibility", { length: 100 }).notNull(), // e.g. "India eligible", "Worldwide", "Vadodara"
  jobUrl: text("jobUrl").notNull(),
  description: text("description").notNull(),
  matchScore: float("matchScore").default(0).notNull(),
  matchExplanation: text("matchExplanation"),
  status: mysqlEnum("status", ["Discovered", "Applied", "Interview", "Offer", "Rejected"]).default("Discovered").notNull(),
  appliedAt: timestamp("appliedAt"),
  notes: text("notes"),
  discoveredAt: timestamp("discoveredAt").defaultNow().notNull(),
});

export const automationLogs = mysqlTable("automation_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  runTime: timestamp("runTime").defaultNow().notNull(),
  status: mysqlEnum("status", ["Success", "Failed", "Running"]).default("Success").notNull(),
  jobsFound: int("jobsFound").default(0).notNull(),
  details: text("details"),
  errorMessage: text("errorMessage"),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0 for unread, 1 for read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type AutomationLog = typeof automationLogs.$inferSelect;
export type InsertAutomationLog = typeof automationLogs.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferSelect;
