import { pgTable, text, serial, integer, boolean, pgEnum, uuid, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for indicator types
export const indicatorTypeEnum = pgEnum('indicator_type', ['core', 'optional']);

// Enum for indicator status
export const indicatorStatusEnum = pgEnum('indicator_status', ['validated', 'in_progress', 'not_validated']);

// Enum for profession types
export const professionEnum = pgEnum('profession', [
  'doctor', 'pharmacist', 'nurse', 'physiotherapist', 'other'
]);

// Users table (already defined)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Indicators table (ACI indicators)
export const indicators = pgTable("indicators", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g. S01, O01
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: indicatorTypeEnum("type").notNull(), // core or optional
  objective: text("objective").notNull(), // target to achieve
  maxCompensation: integer("max_compensation").notNull(), // maximum compensation amount
});

export const insertIndicatorSchema = createInsertSchema(indicators).pick({
  code: true,
  name: true,
  description: true,
  type: true,
  objective: true,
  maxCompensation: true,
});

export type InsertIndicator = z.infer<typeof insertIndicatorSchema>;
export type Indicator = typeof indicators.$inferSelect;

// Associates table (MSP members)
export const associates = pgTable("associates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  profession: professionEnum("profession").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  patientCount: integer("patient_count"), // Nombre de patients pour les médecins
  activePatients: integer("active_patients"), // File active des patients
});

export const insertAssociateSchema = createInsertSchema(associates).pick({
  firstName: true,
  lastName: true,
  profession: true,
  email: true,
  phone: true,
  patientCount: true,
  activePatients: true,
});

export type InsertAssociate = z.infer<typeof insertAssociateSchema>;
export type Associate = typeof associates.$inferSelect;

// Missions table (assignments linking associates to indicators)
export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  associateId: integer("associate_id").notNull(),
  indicatorId: integer("indicator_id").notNull(),
  status: indicatorStatusEnum("status").notNull().default('in_progress'),
  currentValue: text("current_value"), // current progress towards objective
  compensation: integer("compensation").default(0), // actual compensation amount
  notes: text("notes"),
});

export const insertMissionSchema = createInsertSchema(missions).pick({
  associateId: true,
  indicatorId: true,
  status: true,
  currentValue: true,
  compensation: true,
  notes: true,
});

export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missions.$inferSelect;
