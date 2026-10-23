import { timingSafeEqual } from "node:crypto";
export function safeEqual(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}
export function isAdmin(request) {
  return Boolean(process.env.AGENT_ADMIN_KEY) && safeEqual(request.headers.get("x-agent-admin-key"), process.env.AGENT_ADMIN_KEY);
}
export function isCron(request) {
  return Boolean(process.env.CRON_SECRET) && safeEqual(request.headers.get("authorization"), "Bearer " + process.env.CRON_SECRET);
}
export function unauthorized() { return Response.json({ error: "Accès non autorisé" }, { status: 401, headers: { "Cache-Control": "no-store" } }); }
