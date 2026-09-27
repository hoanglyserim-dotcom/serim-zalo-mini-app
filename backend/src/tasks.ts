import type { CurrentUser } from "./auth";
import {
  ApiError,
  type Env,
  dueTimestamp,
  isOverdue,
  oneOf,
  optionalText,
  parseDue,
  readJson,
  requireText,
} from "./util";

const STATUSES = ["todo", "doing", "waiting", "done", "cancelled"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
const VISIBILITIES = ["participants", "group", "private"] as const;
const PRIORITY_RANK: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

interface Membership {
  group_id: number;
  role: string;
}

export interface Ctx {
  env: Env;
  user: CurrentUser;
  memberships: Membership[];
  isOwner: boolean;
}

interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  source_type: string;
  creator_id: number;
  responsible_user_id: number;
  group_id: number | null;
  status: string;
  priority: string;
  visibility_mode: string;
  due_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

const TASK_SELECT = `
  SELECT t.*, g.name AS group_name,
         c.display_name AS creator_name, r.display_name AS responsible_name
  FROM tasks t
  LEFT JOIN groups g ON g.id = t.group_id
  JOIN users c ON c.id = t.creator_id
  JOIN users r ON r.id = t.responsible_user_id`;

export async function buildCtx(env: Env, user: CurrentUser): Promise<Ctx> {
  const { results } = await env.DB.prepare(
    `SELECT gm.group_id, gm.role FROM group_members gm
     JOIN groups g ON g.id = gm.group_id
     WHERE gm.user_id = ? AND gm.is_active = 1 AND g.status = 'active'`,
  )
    .bind(user.id)
    .all<Membership>();
  return { env, user, memberships: results, isOwner: results.some((m) => m.role === "owner") };
}

function roleIn(ctx: Ctx, groupId: number | null): string | null {
  if (groupId === null) return null;
  return ctx.memberships.find((m) => m.group_id === groupId)?.role ?? null;
}

function isGroupManager(ctx: Ctx, groupId: number | null): boolean {
  const role = roleIn(ctx, groupId);
  return role === "leader" || role === "manager" || role === "owner";
}

/** Quyền xem — luôn kiểm tra ở server. */
function canView(ctx: Ctx, t: TaskRow): boolean {
  if (ctx.isOwner) return true;
  if (t.creator_id === ctx.user.id || t.responsible_user_id === ctx.user.id) return true;
  if (t.visibility_mode === "private") return false;
  if (t.visibility_mode === "group" && roleIn(ctx, t.group_id) !== null) return true;
  return isGroupManager(ctx, t.group_id);
}

/** Quyền sửa nội dung/deadline/người phụ trách: người tạo, Leader/Quản lý của nhóm, Chủ. Người làm không tự sửa deadline. */
function canEdit(ctx: Ctx, t: TaskRow): boolean {
  return ctx.isOwner || t.creator_id === ctx.user.id || isGroupManager(ctx, t.group_id);
}

function canChangeStatus(ctx: Ctx, t: TaskRow): boolean {
  return canEdit(ctx, t) || t.responsible_user_id === ctx.user.id;
}

function present(t: TaskRow) {
  return { ...t, overdue: isOverdue(t) };
}

async function getTaskOr404(ctx: Ctx, id: number): Promise<TaskRow> {
  const t = await ctx.env.DB.prepare(`${TASK_SELECT} WHERE t.id = ?`).bind(id).first<TaskRow>();
  // Không có quyền cũng trả 404 để không lộ việc task có tồn tại.
  if (!t || !canView(ctx, t)) throw new ApiError(404, "NOT_FOUND", "Không tìm thấy công việc.");
  return t;
}

function logStmt(ctx: Ctx, taskId: number, action: string, before: unknown, after: unknown, reason: string | null) {
  return ctx.env.DB.prepare(
    `INSERT INTO activity_logs (actor_user_id, entity_type, entity_id, action, before_data, after_data, reason)
     VALUES (?, 'task', ?, ?, ?, ?, ?)`,
  ).bind(
    ctx.user.id,
    taskId,
    action,
    before === null ? null : JSON.stringify(before),
    after === null ? null : JSON.stringify(after),
    reason,
  );
}

async function assertActiveMember(ctx: Ctx, groupId: number, userId: number) {
  const row = await ctx.env.DB.prepare(
    `SELECT 1 FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = ? AND gm.user_id = ? AND gm.is_active = 1 AND g.status = 'active'
       AND u.status IN ('active','leave')`,
  )
    .bind(groupId, userId)
    .first();
  if (!row) throw new ApiError(400, "VALIDATION", "Người được giao không thuộc nhóm này.");
}

// GET /tasks — "Việc của tôi": việc mình phụ trách hoặc mình tạo, gộp mọi nhóm.
export async function listTasks(ctx: Ctx, url: URL) {
  const groupId = url.searchParams.get("group_id");
  const params: unknown[] = [ctx.user.id, ctx.user.id];
  let sql = `${TASK_SELECT} WHERE (t.responsible_user_id = ? OR t.creator_id = ?)`;
  if (groupId) {
    sql += " AND t.group_id = ?";
    params.push(Number(groupId));
  }
  sql += " ORDER BY t.updated_at DESC LIMIT 300";
  const { results } = await ctx.env.DB.prepare(sql).bind(...params).all<TaskRow>();

  // Thứ tự ưu tiên: Quá hạn → Khẩn → Sắp đến hạn → còn lại; việc đã đóng xuống cuối.
  const now = Date.now();
  const bucket = (t: TaskRow) => {
    if (t.status === "done" || t.status === "cancelled") return 9;
    if (isOverdue(t, now)) return 0;
    if (t.priority === "urgent") return 1;
    const due = dueTimestamp(t.due_at);
    if (due !== null && due - now < 48 * 3600 * 1000) return 2;
    return 3;
  };
  const tasks = results.filter((t) => canView(ctx, t)).map(present);
  tasks.sort(
    (a, b) =>
      bucket(a) - bucket(b) ||
      (dueTimestamp(a.due_at) ?? Infinity) - (dueTimestamp(b.due_at) ?? Infinity) ||
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  );
  return { tasks };
}

export async function getTask(ctx: Ctx, id: number) {
  const t = await getTaskOr404(ctx, id);
  const { results: attachments } = await ctx.env.DB.prepare(
    `SELECT a.id, a.file_name, a.file_type, a.created_at, u.display_name AS uploaded_by_name
     FROM attachments a JOIN users u ON u.id = a.uploaded_by WHERE a.task_id = ? ORDER BY a.id`,
  )
    .bind(id)
    .all();
  return { task: present(t), attachments };
}

export async function createTask(ctx: Ctx, req: Request) {
  const body = await readJson(req);
  const title = requireText(body.title, "tiêu đề", 200);
  const description = optionalText(body.description, "mô tả", 5000);
  const priority = body.priority === undefined ? "normal" : oneOf(body.priority, PRIORITIES, "Mức ưu tiên");
  const dueAt = parseDue(body.due_at);
  const groupId = body.group_id === undefined || body.group_id === null ? null : Number(body.group_id);
  const responsibleId =
    body.responsible_user_id === undefined || body.responsible_user_id === null
      ? ctx.user.id
      : Number(body.responsible_user_id);
  const visibility =
    body.visibility_mode === undefined
      ? "participants"
      : oneOf(body.visibility_mode, VISIBILITIES, "Phạm vi hiển thị");

  if (groupId !== null) {
    if (!Number.isInteger(groupId)) throw new ApiError(400, "VALIDATION", "Nhóm không hợp lệ.");
    if (roleIn(ctx, groupId) === null) throw new ApiError(403, "FORBIDDEN", "Bạn không thuộc nhóm này.");
  }
  if (visibility === "group" && groupId === null) {
    throw new ApiError(400, "VALIDATION", "Muốn cả nhóm xem thì phải chọn nhóm.");
  }
  const assigned = responsibleId !== ctx.user.id;
  if (assigned) {
    // Giao cho người khác: phải cùng một nhóm đang hoạt động.
    if (groupId === null) throw new ApiError(400, "VALIDATION", "Giao việc cho người khác thì phải chọn nhóm.");
    await assertActiveMember(ctx, groupId, responsibleId);
  }

  const row = await ctx.env.DB.prepare(
    `INSERT INTO tasks (title, description, source_type, creator_id, responsible_user_id, group_id,
                        priority, visibility_mode, due_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  )
    .bind(title, description, assigned ? "assigned" : "self", ctx.user.id, responsibleId, groupId, priority, visibility, dueAt)
    .first<{ id: number }>();
  const id = row!.id;
  const created = await getTaskOr404(ctx, id);
  await logStmt(ctx, id, "create", null, created, null).run();
  return { task: present(created) };
}

const EDITABLE = ["title", "description", "priority", "due_at", "responsible_user_id", "visibility_mode"] as const;
type Editable = (typeof EDITABLE)[number];

/**
 * PATCH /tasks/:id  body: { changes: {field: newValue}, base: {field: valueClientĐangThấy}, reason? }
 * Optimistic concurrency theo từng trường: hai người sửa khác trường thì giữ cả hai;
 * sửa cùng trường mà giá trị đã bị người khác đổi → 409 CONFLICT, yêu cầu tải lại.
 */
export async function updateTask(ctx: Ctx, id: number, req: Request) {
  const body = await readJson<{ changes?: Record<string, unknown>; base?: Record<string, unknown>; reason?: unknown }>(req);
  const t = await getTaskOr404(ctx, id);
  if (!canEdit(ctx, t)) throw new ApiError(403, "FORBIDDEN", "Bạn không có quyền sửa công việc này.");
  const changes = body.changes ?? {};
  const base = body.base ?? {};
  const reason = optionalText(body.reason, "lý do", 1000);

  const fields = Object.keys(changes) as Editable[];
  if (!fields.length) throw new ApiError(400, "VALIDATION", "Không có gì để cập nhật.");
  for (const f of fields) {
    if (!EDITABLE.includes(f)) throw new ApiError(400, "VALIDATION", `Không sửa được trường ${f}.`);
    if (!(f in base)) throw new ApiError(400, "VALIDATION", `Thiếu giá trị gốc của ${f}.`);
  }

  const next: Partial<Record<Editable, unknown>> = {};
  for (const f of fields) {
    const v = changes[f];
    if (f === "title") next.title = requireText(v, "tiêu đề", 200);
    if (f === "description") next.description = optionalText(v, "mô tả", 5000);
    if (f === "priority") next.priority = oneOf(v, PRIORITIES, "Mức ưu tiên");
    if (f === "due_at") next.due_at = parseDue(v);
    if (f === "visibility_mode") next.visibility_mode = oneOf(v, VISIBILITIES, "Phạm vi hiển thị");
    if (f === "responsible_user_id") next.responsible_user_id = Number(v);
  }
  if (next.visibility_mode === "group" && t.group_id === null) {
    throw new ApiError(400, "VALIDATION", "Muốn cả nhóm xem thì phải chọn nhóm.");
  }
  if (next.responsible_user_id !== undefined && next.responsible_user_id !== t.responsible_user_id) {
    if (!reason) throw new ApiError(400, "VALIDATION", "Đổi người phụ trách bắt buộc nhập lý do.");
    if (t.group_id === null) throw new ApiError(400, "VALIDATION", "Việc không thuộc nhóm nên không đổi người được.");
    await assertActiveMember(ctx, t.group_id, next.responsible_user_id as number);
  }

  const setSql = fields.map((f) => `${f} = ?`).join(", ");
  const whereSql = fields.map((f) => `${f} IS ?`).join(" AND ");
  const values = fields.map((f) => next[f] ?? null);
  const baseValues = fields.map((f) => base[f] ?? null);

  const res = await ctx.env.DB.prepare(
    `UPDATE tasks SET ${setSql}, version = version + 1, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND ${whereSql} RETURNING version`,
  )
    .bind(...values, id, ...baseValues)
    .first<{ version: number }>();
  if (!res) throw conflict();

  const before = Object.fromEntries(fields.map((f) => [f, t[f]]));
  const action = fields.includes("responsible_user_id") ? "reassign" : fields.includes("due_at") ? "change_due" : "update";
  await logStmt(ctx, id, action, before, next, reason).run();
  return { task: present(await getTaskOr404(ctx, id)) };
}

// PATCH /tasks/:id/status  body: { status, base_status, reason? }
export async function changeStatus(ctx: Ctx, id: number, req: Request) {
  const body = await readJson(req);
  const t = await getTaskOr404(ctx, id);
  if (!canChangeStatus(ctx, t)) throw new ApiError(403, "FORBIDDEN", "Bạn không có quyền đổi trạng thái việc này.");
  const status = oneOf(body.status, STATUSES, "Trạng thái");
  const baseStatus = oneOf(body.base_status, STATUSES, "Trạng thái gốc");
  const reason = optionalText(body.reason, "lý do", 1000);
  if (status === "cancelled" && !reason) throw new ApiError(400, "VALIDATION", "Hủy việc bắt buộc nhập lý do.");
  if (status === baseStatus) return { task: present(t) };

  const res = await ctx.env.DB.prepare(
    `UPDATE tasks SET status = ?,
       completed_at = CASE WHEN ? = 'done' THEN CURRENT_TIMESTAMP ELSE NULL END,
       cancelled_at = CASE WHEN ? = 'cancelled' THEN CURRENT_TIMESTAMP ELSE NULL END,
       version = version + 1, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = ? RETURNING version`,
  )
    .bind(status, status, status, id, baseStatus)
    .first();
  if (!res) throw conflict();

  const action = baseStatus === "done" || baseStatus === "cancelled" ? "reopen" : "change_status";
  await logStmt(ctx, id, action, { status: baseStatus }, { status }, reason).run();
  return { task: present(await getTaskOr404(ctx, id)) };
}

export async function getActivity(ctx: Ctx, id: number) {
  await getTaskOr404(ctx, id);
  const { results } = await ctx.env.DB.prepare(
    `SELECT l.id, l.action, l.before_data, l.after_data, l.reason, l.created_at, u.display_name AS actor_name
     FROM activity_logs l LEFT JOIN users u ON u.id = l.actor_user_id
     WHERE l.entity_type = 'task' AND l.entity_id = ? ORDER BY l.id`,
  )
    .bind(id)
    .all();
  return { activity: results };
}

function conflict() {
  return new ApiError(409, "CONFLICT", "Người khác vừa cập nhật công việc này. Hãy tải lại rồi thử lại.");
}
