import { loadUser, resolveIdentity } from "./auth";
import { buildCtx, changeStatus, createTask, getActivity, getTask, listTasks, updateTask, type Ctx } from "./tasks";
import { ApiError, type Env, corsPreflight, json, readJson, requireText } from "./util";

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const requestId = crypto.randomUUID();
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    let userId: number | null = null;

    try {
      if (req.method === "OPTIONS") return corsPreflight();

      if (req.method === "GET" && path === "/health") {
        await env.DB.prepare("SELECT 1").first();
        return json({ ok: true, service: "serim-work-api", time: new Date().toISOString() }, 200, requestId);
      }

      const identity = await resolveIdentity(req, env);

      if (req.method === "POST" && path === "/me/link") {
        return json(await linkAccount(env, identity.zaloUserId, req), 200, requestId);
      }

      const user = await loadUser(env, identity);
      userId = user.id;
      const ctx = await buildCtx(env, user);

      const taskMatch = path.match(/^\/tasks\/(\d+)(\/status|\/activity)?$/);
      const taskId = taskMatch ? Number(taskMatch[1]) : 0;
      const sub = taskMatch?.[2];

      let data: unknown;
      if (req.method === "GET" && path === "/me") data = await me(ctx);
      else if (req.method === "GET" && path === "/groups") data = await groups(ctx);
      else if (req.method === "GET" && path === "/tasks") data = await listTasks(ctx, url);
      else if (req.method === "POST" && path === "/tasks") data = await createTask(ctx, req);
      else if (taskMatch && req.method === "GET" && !sub) data = await getTask(ctx, taskId);
      else if (taskMatch && req.method === "PATCH" && !sub) data = await updateTask(ctx, taskId, req);
      else if (taskMatch && req.method === "PATCH" && sub === "/status") data = await changeStatus(ctx, taskId, req);
      else if (taskMatch && req.method === "GET" && sub === "/activity") data = await getActivity(ctx, taskId);
      else throw new ApiError(404, "NOT_FOUND", "Không tìm thấy.");

      return json(data, 200, requestId);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status >= 500) logError(requestId, userId, req, err.code, err);
        return json({ error: { code: err.code, message: err.message, ...err.extra }, request_id: requestId }, err.status, requestId);
      }
      // Không bao giờ trả lỗi SQL thô cho người dùng.
      logError(requestId, userId, req, "INTERNAL", err);
      return json(
        { error: { code: "INTERNAL", message: "Có lỗi xảy ra, vui lòng thử lại." }, request_id: requestId },
        500,
        requestId,
      );
    }
  },
} satisfies ExportedHandler<Env>;

function logError(requestId: string, userId: number | null, req: Request, code: string, err: unknown) {
  console.error(
    JSON.stringify({
      request_id: requestId,
      user_id: userId,
      action: `${req.method} ${new URL(req.url).pathname}`,
      error_code: code,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString(),
    }),
  );
}

async function me(ctx: Ctx) {
  const { results: memberships } = await ctx.env.DB.prepare(
    `SELECT g.id AS group_id, g.name AS group_name, gm.role FROM group_members gm
     JOIN groups g ON g.id = gm.group_id
     WHERE gm.user_id = ? AND gm.is_active = 1 AND g.status = 'active' ORDER BY g.name`,
  )
    .bind(ctx.user.id)
    .all();
  return { user: { id: ctx.user.id, display_name: ctx.user.display_name, status: ctx.user.status }, memberships, is_owner: ctx.isOwner };
}

/** Nhóm của tôi kèm danh sách thành viên (để chọn người khi giao việc). */
async function groups(ctx: Ctx) {
  const ids = ctx.memberships.map((m) => m.group_id);
  if (!ids.length) return { groups: [] };
  const marks = ids.map(() => "?").join(",");
  const { results: gs } = await ctx.env.DB.prepare(
    `SELECT id, name, type FROM groups WHERE id IN (${marks}) ORDER BY name`,
  )
    .bind(...ids)
    .all<{ id: number; name: string; type: string }>();
  const { results: members } = await ctx.env.DB.prepare(
    `SELECT gm.group_id, u.id AS user_id, u.display_name, gm.role FROM group_members gm
     JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id IN (${marks}) AND gm.is_active = 1 AND u.status IN ('active','leave')
     ORDER BY u.display_name`,
  )
    .bind(...ids)
    .all<{ group_id: number; user_id: number; display_name: string; role: string }>();
  return {
    groups: gs.map((g) => ({
      ...g,
      my_role: ctx.memberships.find((m) => m.group_id === g.id)?.role,
      members: members.filter((m) => m.group_id === g.id).map(({ group_id, ...m }) => m),
    })),
  };
}

/**
 * Lần đầu mở app: nhân viên nhập mã nhân viên (Chủ đã tạo sẵn trong bảng users)
 * để gắn tài khoản Zalo của mình vào hồ sơ đó. Mỗi mã chỉ gắn được 1 lần.
 */
async function linkAccount(env: Env, zaloUserId: string, req: Request) {
  const body = await readJson(req);
  const code = requireText(body.employee_code, "mã nhân viên", 50);
  const already = await env.DB.prepare("SELECT id FROM users WHERE zalo_user_id = ?").bind(zaloUserId).first();
  if (already) throw new ApiError(400, "ALREADY_LINKED", "Tài khoản Zalo này đã được liên kết.");
  const row = await env.DB.prepare(
    `UPDATE users SET zalo_user_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE employee_code = ? AND zalo_user_id IS NULL AND status = 'active'
     RETURNING id, display_name`,
  )
    .bind(zaloUserId, code)
    .first<{ id: number; display_name: string }>();
  if (!row) throw new ApiError(400, "LINK_FAILED", "Mã nhân viên không đúng hoặc đã được sử dụng.");
  await env.DB.prepare(
    `INSERT INTO activity_logs (actor_user_id, entity_type, entity_id, action, after_data)
     VALUES (?, 'user', ?, 'link_zalo', ?)`,
  )
    .bind(row.id, row.id, JSON.stringify({ zalo_linked: true }))
    .run();
  return { user: row };
}
