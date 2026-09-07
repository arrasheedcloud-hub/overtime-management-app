import { NextResponse } from "next/server";
import { getSettings, updateSettings, deleteAllRecords, importRecords } from "@/lib/db-access";
import type { BackupData } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || !body.records || !body.settings) {
      return NextResponse.json(
        { error: "ملف النسخة الاحتياطية غير صالح" },
        { status: 400 }
      );
    }

    const backup = body as BackupData;

    await updateSettings(backup.settings);
    await deleteAllRecords();

    if (backup.records.length > 0) {
      const recordsToImport = backup.records.map((r) => ({
        recordDate: r.recordDate,
        startTime: r.startTime,
        endTime: r.endTime,
        minutes: r.minutes,
        hourlyRate: r.hourlyRate,
        amount: r.amount,
        notes: r.notes || null,
      }));
      await importRecords(recordsToImport);
    }

    const settingsData = await getSettings();

    return NextResponse.json({
      success: true,
      settings: settingsData,
      count: backup.records.length,
    });
  } catch (error) {
    console.error("Failed to import backup:", error);
    const message =
      error instanceof Error ? error.message : "فشل استيراد النسخة الاحتياطية";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
