import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "../../../../../lib/agent/security";
import { oauthUrl } from "../../../../../lib/agent/instagram";
export async function POST(request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const state=randomBytes(24).toString("hex");
    const url=oauthUrl(state);
    const response=NextResponse.json({url},{headers:{"Cache-Control":"no-store"}});
    response.cookies.set("drcloud_meta_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:600,path:"/api/agent/meta/callback"});
    return response;
  } catch(error) { return NextResponse.json({error:error.message},{status:500}); }
}
