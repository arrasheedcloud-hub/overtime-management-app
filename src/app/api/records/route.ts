import { NextResponse } from "next/server";
import { getRecords, createRecord } from "@/lib/db-access";
import { calculateAmount } from "@/lib/utils";
import type { OvertimeRecord } from "@/lib/types";

function parseRecordBody(body: Partial<OvertimeRecord>) {
  if (!body.recordDate || !body.startTime || !body.endTime) {
    throw new Error("بيانات غير مكتملة");
  }

  const [startH, startM] = body.startTime.split(":").map(Number);
  const [endH, endM] = body.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes <= startMinutes) {
    throw new Error("وقت النهاية يجب أن يكون بعد وقت البداية");
  }

  const minutes = endMinutes - startMinutes;
  const hourlyRate = body.hourlyRate ?? 1500;
  const amount = calculateAmount(minutes, hourlyRate);

  return {
    recordDate: body.recordDate,
    startTime: body.startTime,
    endTime: body.endTime,
    minutes,
    hourlyRate,
    amount,
    notes: body.notes || null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    const data = await getRecords({
      from,
      to,
      order,
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to load records:", error);
    return NextResponse.json(
      { error: "فشل تحميل السجلات" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = parseRecordBody(body);
    const data = await createRecord(payload);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to create record:", error);
    const message =
      error instanceof Error ? error.message : "فشل حفظ السجل";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
