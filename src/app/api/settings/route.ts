import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/db-access";
import type { AppSettings } from "@/lib/types";

export async function GET() {
  try {
    const data = await getSettings();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to load settings:", error);
    return NextResponse.json(
      { error: "فشل تحميل الإعدادات" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AppSettings;
    const data = await updateSettings(body);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json(
      { error: "فشل حفظ الإعدادات" },
      { status: 500 }
    );
  }
}
