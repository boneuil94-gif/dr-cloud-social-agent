import { isAdmin, unauthorized } from "../../../../lib/agent/security";
import { getState } from "../../../../lib/agent/store";
export async function GET(request) {
  if (!isAdmin(request)) return unauthorized();
  try {
    const state=await getState();
    return Response.json({
      connected:Boolean(state?.token_ciphertext), expiresAt:state?.token_expires_at || null,
      lastRunAt:state?.last_run_at || null, snapshot:state?.snapshot || null, strategy:state?.strategy || null,
      note:"Aucune publication automatique activée."
    },{headers:{"Cache-Control":"no-store"}});
  } catch(error) { return Response.json({error:error.message},{status:503}); }
}
