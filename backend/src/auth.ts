import { ApiError, type Env } from "./util";

export interface CurrentUser {
  id: number;
  zalo_user_id: string;
  display_name: string;
  status: string;
}

export interface Identity {
  zaloUserId: string;
  zaloName: string | null;
}

/**
 * Xác định người gọi là ai. KHÔNG tin bất kỳ id/role nào client tự gửi lên.
 * - Chạy thật: Mini App gửi Zalo access token, Worker hỏi lại Zalo để lấy user id.
 * - Test không qua Zalo: chỉ bật khi đã đặt secret DEV_TOKEN và request gửi đúng token đó.
 */
export async function resolveIdentity(req: Request, env: Env): Promise<Identity> {
  const devToken = req.headers.get("X-Dev-Token");
  if (devToken !== null) {
    if (!env.DEV_TOKEN || env.DEV_TOKEN.length < 16 || !safeEqual(devToken, env.DEV_TOKEN)) {
      throw new ApiError(401, "UNAUTHORIZED", "Phiên đăng nhập không hợp lệ.");
    }
    const zaloId = req.headers.get("X-Dev-Zalo-Id");
    if (!zaloId) throw new ApiError(400, "BAD_REQUEST", "Thiếu X-Dev-Zalo-Id.");
    return { zaloUserId: zaloId, zaloName: null };
  }

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) throw new ApiError(401, "UNAUTHORIZED", "Bạn cần mở ứng dụng từ Zalo.");
  if (!env.ZALO_APP_SECRET) {
    throw new ApiError(500, "SERVER_MISCONFIGURED", "Máy chủ chưa được cấu hình xong.");
  }

  const proof = await hmacSha256Hex(env.ZALO_APP_SECRET, token);
  const res = await fetch("https://graph.zalo.me/v2.0/me?fields=id,name", {
    headers: { access_token: token, appsecret_proof: proof },
  });
  const data = (await res.json().catch(() => null)) as
    | { id?: string; name?: string; error?: number; message?: string }
    | null;
  if (!res.ok || !data || !data.id || (data.error && data.error !== 0)) {
    throw new ApiError(401, "UNAUTHORIZED", "Không xác thực được tài khoản Zalo. Hãy mở lại ứng dụng.");
  }
  return { zaloUserId: String(data.id), zaloName: data.name ?? null };
}

export async function loadUser(env: Env, identity: Identity): Promise<CurrentUser> {
  const user = await env.DB.prepare(
    "SELECT id, zalo_user_id, display_name, status FROM users WHERE zalo_user_id = ?",
  )
    .bind(identity.zaloUserId)
    .first<CurrentUser>();
  if (!user) {
    throw new ApiError(403, "NOT_LINKED", "Tài khoản Zalo này chưa được liên kết với nhân viên SERIM.", {
      zalo_name: identity.zaloName,
    });
  }
  if (user.status === "locked" || user.status === "left") {
    throw new ApiError(403, "ACCOUNT_LOCKED", "Tài khoản đã bị khóa.");
  }
  return user;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
