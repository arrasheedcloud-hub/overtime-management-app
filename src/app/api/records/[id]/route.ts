import { NextResponse } from "next/server";
import { getRecordById, updateRecord, deleteRecord } from "@/lib/db-access";
import { calculateAmount } from "@/lib/utils";
import type { OvertimeRecord } from "@/lib/types";

function parseUpdateBody(body: Partial<OvertimeRecord>) {
  const startTime = body.startTime;
  const endTime = body.endTime;

  let minutes = body.minutes;
  let amount = body.amount;
  let hourlyRate = body.hourlyRate;

  if (startTime && endTime) {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      throw new Error("وقت النهاية يجب أن يكون بعد وقت البداية");
    }

    minutes = endMinutes - startMinutes;
  }

  if (minutes !== undefined && hourlyRate !== undefined) {
    amount = calculateAmount(minutes, hourlyRate);
  }

  return {
    recordDate: body.recordDate,
    startTime,
    endTime,
    minutes,
    hourlyRate,
    amount,
    notes: body.notes,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getRecordById(Number(id));
    if (!data) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to load record:", error);
    return NextResponse.json(
      { error: "فشل تحميل السجل" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payload = parseUpdateBody(body);
    const data = await updateRecord(Number(id), payload);
    if (!data) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to update record:", error);
    const message =
      error instanceof Error ? error.message : "فشل تعديل السجل";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteRecord(Number(id));
    if (!success) {
      return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete record:", error);
    return NextResponse.json(
      { error: "فشل حذف السجل" },
      { status: 500 }
    );
  }
}
