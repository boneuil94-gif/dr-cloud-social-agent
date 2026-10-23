import { isAdmin, isCron, unauthorized } from "../../../../lib/agent/security";
import { getState, saveState, decrypt, encrypt } from "../../../../lib/agent/store";
import { refreshToken, getAccount, getInsights } from "../../../../lib/agent/instagram";
import { summarize, createStrategy } from "../../../../lib/agent/brain";
export const maxDuration=60;
async function audit() {
  const state=await getState();
  if (!state?.token_ciphertext) throw new Error("Connecte Instagram depuis l'espace Agent");
  let token=decrypt(state.token_ciphertext);
  if (state.token_expires_at && Date.parse(state.token_expires_at)-Date.now() < 10*86400000) {
    const refreshed=await refreshToken(token);
    token=refreshed.accessToken;
    await saveState({token_ciphertext:encrypt(token),token_expires_at:refreshed.expiresAt});
  }
  const [account,insights]=await Promise.all([getAccount(token),getInsights(token)]);
  const snapshot=summarize(account,insights);
  const strategy=await createStrategy(snapshot);
  await saveState({snapshot,strategy,last_run_at:new Date().toISOString()});
  return {snapshot,strategy};
}
async function handler(request) {
  if (!isAdmin(request) && !isCron(request)) return unauthorized();
  try {
    const result=await audit();
    return Response.json(isAdmin(request)?result:{ok:true,checkedAt:result.snapshot.checkedAt},{headers:{"Cache-Control":"no-store"}});
  } catch(error) {
    return Response.json({error:error.message},{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
export async function POST(request){return handler(request);}
export async function GET(request){return isCron(request)?handler(request):unauthorized();}
