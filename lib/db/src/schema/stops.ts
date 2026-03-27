import { pgTable, text, timestamp, uuid, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { plansTable } from "./plans";

export const stopsTable = pgTable("stops", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").notNull().references(() => plansTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  notes: text("notes"),
  lat: real("lat"),
  lng: real("lng"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStopSchema = createInsertSchema(stopsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertStop = z.infer<typeof insertStopSchema>;
export type Stop = typeof stopsTable.$inferSelect;
