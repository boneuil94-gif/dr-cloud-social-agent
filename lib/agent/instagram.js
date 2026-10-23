const graph = "https://graph.instagram.com";
async function json(url, options={}) {
  const response = await fetch(url, { ...options, cache: "no-store" });
  const value = await response.json().catch(() => ({}));
  if (!response.ok || value.error) throw new Error("Instagram API ("+response.status+"): "+(value.error?.message || "requête refusée"));
  return value;
}
export function oauthUrl(state) {
  const appId = process.env.META_INSTAGRAM_APP_ID;
  const redirect = process.env.META_INSTAGRAM_REDIRECT_URI;
  if (!appId || !redirect) throw new Error("Configurer l'application Meta");
  const params = new URLSearchParams({
    client_id:appId, redirect_uri:redirect, response_type:"code", state,
    scope:"instagram_business_basic,instagram_business_manage_insights"
  });
  return "https://www.instagram.com/oauth/authorize?"+params.toString();
}
export async function exchangeCode(code) {
  const params = new URLSearchParams({
    client_id:process.env.META_INSTAGRAM_APP_ID,
    client_secret:process.env.META_INSTAGRAM_APP_SECRET,
    grant_type:"authorization_code",
    redirect_uri:process.env.META_INSTAGRAM_REDIRECT_URI,
    code
  });
  const short = await json("https://api.instagram.com/oauth/access_token", { method:"POST", body:params });
  const token = short.access_token || short.data?.[0]?.access_token;
  if (!token) throw new Error("Jeton Instagram absent");
  const url = new URL(graph+"/access_token");
  url.search = new URLSearchParams({
    grant_type:"ig_exchange_token", client_secret:process.env.META_INSTAGRAM_APP_SECRET, access_token:token
  }).toString();
  const long = await json(url);
  return {accessToken:long.access_token, expiresAt:new Date(Date.now()+(long.expires_in || 5184000)*1000).toISOString()};
}
export async function refreshToken(token) {
  const url = new URL(graph+"/refresh_access_token");
  url.search = new URLSearchParams({grant_type:"ig_refresh_token", access_token:token}).toString();
  const data = await json(url);
  return {accessToken:data.access_token, expiresAt:new Date(Date.now()+(data.expires_in || 5184000)*1000).toISOString()};
}
export async function getAccount(token) {
  const headers = { Authorization:"Bearer "+token };
  const profile = await json(graph+"/me?fields=id,username,followers_count,follows_count,media_count,profile_picture_url", {headers});
  const media = await json(graph+"/me/media?fields=id,caption,media_type,media_product_type,timestamp,permalink,like_count,comments_count&limit=30", {headers});
  return { profile, media:media.data || [] };
}
export async function getInsights(token) {
  try {
    const headers = { Authorization:"Bearer "+token };
    const data = await json(graph+"/me/insights?metric=reach,views&period=day&since="+
      Math.floor((Date.now()-7*86400000)/1000)+"&until="+Math.floor(Date.now()/1000), {headers});
    return {data:data.data || [], error:null};
  } catch(error) {
    return {data:[],error:error.message};
  }
}
