import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
const table = "drcloud_social_state";
function key() {
  const value = process.env.AGENT_ENCRYPTION_KEY || "";
  const bytes = Buffer.from(value, "base64");
  if (bytes.length !== 32) throw new Error("AGENT_ENCRYPTION_KEY doit contenir 32 octets encodés en base64");
  return bytes;
}
export function encrypt(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ciphertext].map(v => v.toString("base64")).join(".");
}
export function decrypt(value) {
  const [a,b,c] = String(value || "").split(".");
  if (!a || !b || !c) throw new Error("Jeton chiffré manquant");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(a,"base64"));
  decipher.setAuthTag(Buffer.from(b,"base64"));
  return Buffer.concat([decipher.update(Buffer.from(c,"base64")), decipher.final()]).toString("utf8");
}
async function request(path, options={}) {
  const endpoint = process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!endpoint || !secret) throw new Error("Configurer SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY");
  const url = new URL("/rest/v1/" + table + path, endpoint);
  const response = await fetch(url, { ...options, headers: {
    apikey: secret, Authorization: "Bearer " + secret,
    "Content-Type": "application/json", ...(options.headers || {})
  }, cache: "no-store" });
  if (!response.ok) throw new Error("Erreur de stockage Supabase ("+response.status+")");
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
export async function getState() {
  const rows = await request("?id=eq.drcloud&select=*", { method: "GET" });
  return rows?.[0] || null;
}
export async function saveState(data) {
  return request("?on_conflict=id", { method: "POST", headers: { Prefer:"resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({id:"drcloud", ...data, updated_at:new Date().toISOString()}) });
}
