import type {
  AppSettings,
  OvertimeRecord,
  BackupData,
} from "./types";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "حدث خطأ");
  }
  return data;
}

export async function fetchSettings(): Promise<AppSettings> {
  const data = await fetchJson<{ data: AppSettings }>("/api/settings");
  return data.data;
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  const data = await fetchJson<{ data: AppSettings }>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
  return data.data;
}

export async function fetchRecords(options?: {
  from?: string;
  to?: string;
  order?: "asc" | "desc";
}): Promise<OvertimeRecord[]> {
  const params = new URLSearchParams();
  if (options?.from) params.set("from", options.from);
  if (options?.to) params.set("to", options.to);
  if (options?.order) params.set("order", options.order);
  const data = await fetchJson<{ data: OvertimeRecord[] }>(
    `/api/records?${params.toString()}`
  );
  return data.data;
}

export async function createRecord(
  record: Partial<OvertimeRecord>
): Promise<OvertimeRecord> {
  const data = await fetchJson<{ data: OvertimeRecord }>("/api/records", {
    method: "POST",
    body: JSON.stringify(record),
  });
  return data.data;
}

export async function updateRecord(
  id: number,
  record: Partial<OvertimeRecord>
): Promise<OvertimeRecord> {
  const data = await fetchJson<{ data: OvertimeRecord }>(`/api/records/${id}`, {
    method: "PATCH",
    body: JSON.stringify(record),
  });
  return data.data;
}

export async function deleteRecord(id: number): Promise<void> {
  await fetchJson<{ success: boolean }>(`/api/records/${id}`, {
    method: "DELETE",
  });
}

export async function exportBackup(): Promise<BackupData> {
  return fetchJson<BackupData>("/api/backup/export");
}

export async function importBackup(backup: BackupData): Promise<{
  success: boolean;
  settings: AppSettings;
  count: number;
}> {
  return fetchJson<{ success: boolean; settings: AppSettings; count: number }>(
    "/api/backup/import",
    {
      method: "POST",
      body: JSON.stringify(backup),
    }
  );
}
