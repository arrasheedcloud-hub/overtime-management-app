import type { AppSettings, OvertimeRecord, BackupData } from "./types";

const SETTINGS_KEY = "overtime_settings";
const RECORDS_KEY = "overtime_records";
const OFFLINE_QUEUE_KEY = "overtime_offline_queue";

export function saveSettingsLocal(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettingsLocal(): AppSettings | null {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? (JSON.parse(data) as AppSettings) : null;
}

export function saveRecordsLocal(records: OvertimeRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadRecordsLocal(): OvertimeRecord[] {
  const data = localStorage.getItem(RECORDS_KEY);
  return data ? (JSON.parse(data) as OvertimeRecord[]) : [];
}

export function exportBackupLocal(): BackupData {
  const settings = loadSettingsLocal();
  const records = loadRecordsLocal();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: settings || ({} as AppSettings),
    records,
  };
}

export function importBackupLocal(backup: BackupData): void {
  saveSettingsLocal(backup.settings);
  saveRecordsLocal(backup.records);
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}
