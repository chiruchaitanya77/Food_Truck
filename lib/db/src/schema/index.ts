import { pgTable, serial, text, boolean, real, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const menuItemsTable = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  isVeg: boolean("is_veg").notNull().default(false),
  price: real("price").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItemsTable.$inferSelect;

export const festivalDiscountsTable = pgTable("festival_discounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  discountPercentage: real("discount_percentage").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  isAuto: boolean("is_auto").notNull().default(false),
  startDate: date("start_date"),
  endDate: date("end_date"),
  posterUrl: text("poster_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFestivalDiscountSchema = createInsertSchema(festivalDiscountsTable).omit({ id: true, createdAt: true });
export type InsertFestivalDiscount = z.infer<typeof insertFestivalDiscountSchema>;
export type FestivalDiscount = typeof festivalDiscountsTable.$inferSelect;

export const stopwatchWinnersTable = pgTable("stopwatch_winners", {
  id: serial("id").primaryKey(),
  userName: text("user_name").notNull(),
  timeStopped: real("time_stopped").notNull(),
  prize: text("prize").notNull().default("Free Treat"),
  ipAddress: text("ip_address"),
  city: text("city"),
  country: text("country"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStopwatchWinnerSchema = createInsertSchema(stopwatchWinnersTable).omit({ id: true, createdAt: true });
export type InsertStopwatchWinner = z.infer<typeof insertStopwatchWinnerSchema>;
export type StopwatchWinner = typeof stopwatchWinnersTable.$inferSelect;

export const stopwatchAttemptsTable = pgTable("stopwatch_attempts", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  attemptDate: date("attempt_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStopwatchAttemptSchema = createInsertSchema(stopwatchAttemptsTable).omit({ id: true, createdAt: true });
export type InsertStopwatchAttempt = z.infer<typeof insertStopwatchAttemptSchema>;
export type StopwatchAttempt = typeof stopwatchAttemptsTable.$inferSelect;

export const userSubmissionsTable = pgTable("user_submissions", {
  id: serial("id").primaryKey(),
  userName: text("user_name").notNull(),
  imageUrl: text("image_url"),
  experienceText: text("experience_text").notNull(),
  approved: boolean("approved").notNull().default(false),
  ipAddress: text("ip_address"),
  location: text("location"),
  city: text("city"),
  country: text("country"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSubmissionSchema = createInsertSchema(userSubmissionsTable).omit({ id: true, createdAt: true, approved: true });
export type InsertUserSubmission = z.infer<typeof insertUserSubmissionSchema>;
export type UserSubmission = typeof userSubmissionsTable.$inferSelect;

export const truckLocationTable = pgTable("truck_location", {
  id: serial("id").primaryKey(),
  currentLocation: text("current_location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by"),
});

export const insertTruckLocationSchema = createInsertSchema(truckLocationTable).omit({ id: true, updatedAt: true });
export type InsertTruckLocation = z.infer<typeof insertTruckLocationSchema>;
export type TruckLocation = typeof truckLocationTable.$inferSelect;

export const analyticsTable = pgTable("analytics", {
  id: serial("id").primaryKey(),
  visitorIp: text("visitor_ip").notNull(),
  country: text("country"),
  city: text("city"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  userAgent: text("user_agent"),
  page: text("page"),
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
});

export const insertAnalyticsSchema = createInsertSchema(analyticsTable).omit({ id: true, visitedAt: true });
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analyticsTable.$inferSelect;

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsersTable).omit({ id: true, createdAt: true });
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsersTable.$inferSelect;
