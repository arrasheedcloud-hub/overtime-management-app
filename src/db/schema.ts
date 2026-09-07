import {
  pgTable,
  serial,
  date,
  time,
  integer,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const overtimeRecords = pgTable("overtime_records", {
  id: serial("id").primaryKey(),
  recordDate: date("record_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  minutes: integer("minutes").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  amount: integer("amount").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
export type OvertimeRecord = typeof overtimeRecords.$inferSelect;
export type NewOvertimeRecord = typeof overtimeRecords.$inferInsert;
