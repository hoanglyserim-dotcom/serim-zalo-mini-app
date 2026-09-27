export interface Env {
  DB: D1Database;
  ZALO_APP_SECRET?: string;
  DEV_TOKEN?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Authorization,Content-Type,X-Dev-Token,X-Dev-Zalo-Id",
  "Access-Control-Max-Age": "86400",
};

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function json(data: unknown, status = 200, requestId?: string): Response {
  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", ...CORS_HEADERS };
  if (requestId) headers["X-Request-Id"] = requestId;
  return new Response(JSON.stringify(data), { status, headers });
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    const body = await req.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return body as T;
  } catch {
    // rơi xuống lỗi bên dưới
  }
  throw new ApiError(400, "BAD_REQUEST", "Dữ liệu gửi lên không hợp lệ.");
}

export function requireText(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "VALIDATION", `Thiếu ${field}.`);
  }
  const v = value.trim();
  if (v.length > max) throw new ApiError(400, "VALIDATION", `${field} quá dài (tối đa ${max} ký tự).`);
  return v;
}

export function optionalText(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null || value === "") return null;
  return requireText(value, field, max);
}

export function oneOf<T extends string>(value: unknown, allowed: readonly T[], field: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new ApiError(400, "VALIDATION", `${field} không hợp lệ.`);
  }
  return value as T;
}

/** Deadline: "YYYY-MM-DD" (chỉ ngày) hoặc ISO có giờ, ví dụ "2026-09-30T17:00:00+07:00". */
export function parseDue(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new ApiError(400, "VALIDATION", "Deadline không hợp lệ.");
  if (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))) return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value))) return new Date(value).toISOString();
  throw new ApiError(400, "VALIDATION", "Deadline không hợp lệ.");
}

/** Quá hạn KHÔNG phải trạng thái: now > due_at và chưa done/cancelled. Deadline chỉ-ngày tính hết ngày giờ VN. */
export function dueTimestamp(due: string | null): number | null {
  if (!due) return null;
  if (due.length === 10) return Date.parse(`${due}T23:59:59+07:00`);
  return Date.parse(due);
}

export function isOverdue(task: { due_at: string | null; status: string }, now = Date.now()): boolean {
  const t = dueTimestamp(task.due_at);
  return t !== null && now > t && task.status !== "done" && task.status !== "cancelled";
}
