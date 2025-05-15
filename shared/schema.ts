import { pgTable, text, serial, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum types
export const ticketStatusEnum = pgEnum('ticket_status', [
  'waiting',
  'in_progress',
  'completed'
]);

export const priorityEnum = pgEnum('priority', [
  'low',
  'medium',
  'high'
]);

export const facilityTypeEnum = pgEnum('facility_type', [
  'electrical',
  'plumbing',
  'ac',
  'furniture',
  'it',
  'other'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default('user'),
});

// Technicians table
export const technicians = pgTable("technicians", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specialization: text("specialization").notNull(),
  initials: text("initials").notNull(),
  active: boolean("active").notNull().default(true),
});

// Tickets table
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  facilityType: facilityTypeEnum("facility_type").notNull(),
  facilityName: text("facility_name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  status: ticketStatusEnum("status").notNull().default('waiting'),
  priority: priorityEnum("priority").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  technicianId: integer("technician_id").references(() => technicians.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deadline: timestamp("deadline"),
  completedAt: timestamp("completed_at"),
});

// Ticket history table
export const ticketHistory = pgTable("ticket_history", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  status: ticketStatusEnum("status").notNull(),
  notes: text("notes"),
  updatedBy: integer("updated_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTickets: many(tickets, { relationName: 'createdTickets' }),
  ticketUpdates: many(ticketHistory, { relationName: 'ticketUpdates' }),
  technician: many(technicians),
}));

export const techniciansRelations = relations(technicians, ({ one, many }) => ({
  user: one(users, {
    fields: [technicians.userId],
    references: [users.id],
  }),
  assignments: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [tickets.createdBy],
    references: [users.id],
    relationName: 'createdTickets',
  }),
  technician: one(technicians, {
    fields: [tickets.technicianId],
    references: [technicians.id],
  }),
  history: many(ticketHistory),
}));

export const ticketHistoryRelations = relations(ticketHistory, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketHistory.ticketId],
    references: [tickets.id],
  }),
  updatedByUser: one(users, {
    fields: [ticketHistory.updatedBy],
    references: [users.id],
    relationName: 'ticketUpdates',
  }),
}));

// Schemas for validation and type inference
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  role: true,
});

export const insertTechnicianSchema = createInsertSchema(technicians).pick({
  userId: true,
  specialization: true,
  initials: true,
  active: true,
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  ticketNumber: true,
}).extend({
  status: z.enum(['waiting', 'in_progress', 'completed']).optional(),
  facilityType: z.enum(['electrical', 'plumbing', 'ac', 'furniture', 'it', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
});

export const insertTicketHistorySchema = createInsertSchema(ticketHistory).omit({
  id: true,
  createdAt: true,
});

export const updateTicketSchema = insertTicketSchema.partial().extend({
  status: z.enum(['waiting', 'in_progress', 'completed']).optional(),
});

export const filterTicketsSchema = z.object({
  status: z.enum(['all', 'waiting', 'in_progress', 'completed']).optional(),
  facilityType: z.enum(['all', 'electrical', 'plumbing', 'ac', 'furniture', 'it', 'other']).optional(),
  priority: z.enum(['all', 'low', 'medium', 'high']).optional(),
  search: z.string().optional(),
  technicianId: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const dateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  facilityType: z.enum(['all', 'electrical', 'plumbing', 'ac', 'furniture', 'it', 'other']).optional(),
  status: z.enum(['all', 'waiting', 'in_progress', 'completed']).optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertTicketHistory = z.infer<typeof insertTicketHistorySchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
export type FilterTickets = z.infer<typeof filterTicketsSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;

export type User = typeof users.$inferSelect;
export type Technician = typeof technicians.$inferSelect;
export type Ticket = typeof tickets.$inferSelect;
export type TicketHistory = typeof ticketHistory.$inferSelect;

// Extended types for frontend
export type TicketWithTechnician = Ticket & {
  technician?: Technician & {
    user: User;
  };
  createdByUser: User;
};

export type TechnicianWithStats = Technician & {
  user: User;
  activeTickets: number;
  completedTickets: number;
  averageCompletionTime: number;
};

export type DashboardStats = {
  totalTickets: number;
  pendingTickets: number;
  inProgressTickets: number;
  completedTickets: number;
  pendingChange: number;
  inProgressChange: number;
  completedChange: number;
  totalChange: number;
};

export type CategoryStats = {
  electrical: number;
  plumbing: number;
  ac: number;
  furniture: number;
  it: number;
  other: number;
};

export type MonthlyTrend = {
  month: string;
  waiting: number;
  inProgress: number;
  completed: number;
};

export type ReportSummary = {
  totalTickets: number;
  avgCompletionTime: string;
  onTimePercentage: string;
  technicianEfficiency: string;
};
