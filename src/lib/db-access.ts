import { db } from "@/db";
import { settings, overtimeRecords, type NewOvertimeRecord } from "@/db/schema";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import type { AppSettings, OvertimeRecord } from "./types";
import { defaultSettings, getSettingsWithDefaults } from "./settings";

export async function getSettings(): Promise<AppSettings> {
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  if (rows.length === 0) {
    await db.insert(settings).values({ id: 1, data: defaultSettings });
    return defaultSettings;
  }
  return getSettingsWithDefaults(rows[0].data as Partial<AppSettings>);
}

export async function updateSettings(data: AppSettings): Promise<AppSettings> {
  const existing = await db.select().from(settings).where(eq(settings.id, 1));
  if (existing.length === 0) {
    await db.insert(settings).values({ id: 1, data });
  } else {
    await db
      .update(settings)
      .set({ data, updatedAt: new Date() })
      .where(eq(settings.id, 1));
  }
  return data;
}

export async function getRecords(filters?: {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
}): Promise<OvertimeRecord[]> {
  const conditions = [];
  if (filters?.from) conditions.push(gte(overtimeRecords.recordDate, filters.from));
  if (filters?.to) conditions.push(lte(overtimeRecords.recordDate, filters.to));

  const orderBy =
    filters?.order === "asc"
      ? asc(overtimeRecords.recordDate)
      : desc(overtimeRecords.recordDate);

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(overtimeRecords)
          .where(and(...conditions))
          .orderBy(orderBy)
      : await db.select().from(overtimeRecords).orderBy(orderBy);

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    notes: row.notes ?? null,
  }));
}

export async function getRecordById(id: number): Promise<OvertimeRecord | null> {
  const rows = await db
    .select()
    .from(overtimeRecords)
    .where(eq(overtimeRecords.id, id));
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    notes: row.notes ?? null,
  };
}

export async function createRecord(
  record: Omit<NewOvertimeRecord, "id" | "createdAt" | "updatedAt">
): Promise<OvertimeRecord> {
  const payload = {
    ...record,
    notes: record.notes || null,
  };
  const rows = await db.insert(overtimeRecords).values(payload).returning();
  const row = rows[0];
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    notes: row.notes ?? null,
  };
}

export async function updateRecord(
  id: number,
  record: Partial<Omit<NewOvertimeRecord, "id" | "createdAt" | "updatedAt">>
): Promise<OvertimeRecord | null> {
  const existing = await getRecordById(id);
  if (!existing) return null;

  const rows = await db
    .update(overtimeRecords)
    .set({
      ...record,
      updatedAt: new Date(),
    })
    .where(eq(overtimeRecords.id, id))
    .returning();
  const row = rows[0];
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    notes: row.notes ?? null,
  };
}

export async function deleteRecord(id: number): Promise<boolean> {
  const result = await db
    .delete(overtimeRecords)
    .where(eq(overtimeRecords.id, id))
    .returning();
  return result.length > 0;
}

export async function deleteAllRecords(): Promise<void> {
  await db.delete(overtimeRecords);
}

export async function importRecords(
  records: Omit<NewOvertimeRecord, "id" | "createdAt" | "updatedAt">[]
): Promise<void> {
  if (records.length === 0) return;
  const payload = records.map((r) => ({
    ...r,
    notes: r.notes || null,
  }));
  await db.insert(overtimeRecords).values(payload);
}
