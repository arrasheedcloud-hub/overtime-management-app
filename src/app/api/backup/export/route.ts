import { NextResponse } from "next/server";
import { getSettings, getRecords } from "@/lib/db-access";
import type { BackupData } from "@/lib/types";

export async function GET() {
  try {
    const [settingsData, records] = await Promise.all([
      getSettings(),
      getRecords({ order: "asc" }),
    ]);

    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settingsData,
      records,
    };

    return NextResponse.json(backup);
  } catch (error) {
    console.error("Failed to export backup:", error);
    return NextResponse.json(
      { error: "فشل تصدير النسخة الاحتياطية" },
      { status: 500 }
    );
  }
}
