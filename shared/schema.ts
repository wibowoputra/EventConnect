import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("participant"), // admin, organizer, community_manager, participant
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(), // running, cycling, swimming, triathlon, etc.
  capacity: integer("capacity"),
  price: real("price").default(0),
  image: text("image"),
  organizerId: integer("organizer_id").notNull(),
  status: text("status").notNull().default("draft"), // draft, published, completed, cancelled
  registrationOpen: boolean("registration_open").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Registration table
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("registered"), // registered, confirmed, checked_in, completed, cancelled
  bibNumber: text("bib_number"),
  category: text("category"), // e.g., Marathon 42K, Half Marathon 21K
  registrationDate: timestamp("registration_date").defaultNow(),
  additionalInfo: json("additional_info"), // For custom form fields
});

// Community table
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  managerId: integer("manager_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community membership table
export const communityMembers = pgTable("community_members", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull(),
  userId: integer("user_id").notNull(),
  joinDate: timestamp("join_date").defaultNow(),
});

// Race packs table
export const racePacks = pgTable("race_packs", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  category: text("category").notNull(), // Apparel, Awards, Essentials, etc.
  stockQuantity: integer("stock_quantity").notNull(),
  distributedQuantity: integer("distributed_quantity").default(0),
});

// Participant checkpoints for tracking
export const participantCheckpoints = pgTable("participant_checkpoints", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").notNull(),
  checkpointName: text("checkpoint_name").notNull(),
  checkpointDistance: real("checkpoint_distance"), // in kilometers
  timestamp: timestamp("timestamp").defaultNow(),
  status: text("status").notNull(), // active, finished, delayed, DNF
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertRegistrationSchema = createInsertSchema(registrations).omit({ id: true, registrationDate: true });
export const insertCommunitySchema = createInsertSchema(communities).omit({ id: true, createdAt: true });
export const insertCommunityMemberSchema = createInsertSchema(communityMembers).omit({ id: true, joinDate: true });
export const insertRacePackSchema = createInsertSchema(racePacks).omit({ id: true });
export const insertParticipantCheckpointSchema = createInsertSchema(participantCheckpoints).omit({ id: true });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communities.$inferSelect;

export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;
export type CommunityMember = typeof communityMembers.$inferSelect;

export type InsertRacePack = z.infer<typeof insertRacePackSchema>;
export type RacePack = typeof racePacks.$inferSelect;

export type InsertParticipantCheckpoint = z.infer<typeof insertParticipantCheckpointSchema>;
export type ParticipantCheckpoint = typeof participantCheckpoints.$inferSelect;
