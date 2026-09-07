import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US");
}

export function formatHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourLabel = hours === 1 ? "ساعة" : "ساعات";
  const minuteLabel = minutes === 1 ? "دقيقة" : "دقائق";

  if (minutes === 0) {
    return `${hours} ${hourLabel}`;
  }
  return `${hours} ${hourLabel} و ${minutes} ${minuteLabel}`;
}

export function formatHoursMinutesShort(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  return `${h}:${m}`;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function calculateAmount(minutes: number, hourlyRate: number): number {
  return Math.round((minutes / 60) * hourlyRate);
}

export function getWeekDayName(date: Date): string {
  const days = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  return days[date.getDay()];
}

export function getWeekDayKey(date: Date): string {
  const keys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return keys[date.getDay()];
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function parseTime(time: string): { hours: number; minutes: number } {
  const [h, m] = time.split(":").map(Number);
  return { hours: h, minutes: m };
}

export function formatTime12Hour(time: string): string {
  const { hours, minutes } = parseTime(time);
  const suffix = hours >= 12 ? "م" : "ص";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Week starts Saturday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

import type { OvertimeRecord as OvertimeRecordType } from "./types";

export function getDayRecords(
  records: OvertimeRecordType[],
  dateStr: string
): OvertimeRecordType[] {
  return records.filter((r) => r.recordDate === dateStr);
}
