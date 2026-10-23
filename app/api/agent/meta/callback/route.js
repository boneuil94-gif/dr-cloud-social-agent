import { NextResponse } from "next/server";
import { safeEqual } from "../../../../../lib/agent/security";
import { exchangeCode } from "../../../../../lib/agent/instagram";
import { encrypt, saveState } from "../../../../../lib/agent/store";
export async function GET(request) {
  const url=new URL(request.url);
  const state=request.cookies.get("drcloud_meta_state")?.value;
  let destination="/agent?error=connection";
  try {
    if (!state || !safeEqual(state,url.searchParams.get("state"))) throw new Error("OAuth state invalide");
    const code=url.searchParams.get("code");
    if (!code || url.searchParams.get("error")) throw new Error("Connexion refusée");
    const token=await exchangeCode(code);
    await saveState({token_ciphertext:encrypt(token.accessToken),token_expires_at:token.expiresAt});
    destination="/agent?connected=1";
  } catch { destination="/agent?error=connection"; }
  const response=NextResponse.redirect(new URL(destination,request.url),303);
  response.cookies.set("drcloud_meta_state","",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:0,path:"/api/agent/meta/callback"});
  return response;
}
