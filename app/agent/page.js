"use client";
import { useState } from "react";
import "./agent.css";
export default function AgentPage() {
  const [key,setKey]=useState("");
  const [loading,setLoading]=useState("");
  const [result,setResult]=useState(null);
  const [error,setError]=useState("");
  async function request(path,method="GET") {
    if (!key.trim()) {setError("Renseigne la clé admin définie dans Vercel.");return;}
    setLoading(method==="POST" ? (path.includes("connect")?"connection":"audit"):"lecture");
    setError("");
    try {
      const response=await fetch(path,{method,headers:{"x-agent-admin-key":key.trim()},cache:"no-store"});
      const payload=await response.json();
      if (!response.ok) throw new Error(payload.error || "Requête impossible");
      if (payload.url) { window.location.assign(payload.url);return; }
      setResult(payload);
    } catch(e) {setError(e.message);}
    finally {setLoading("");}
  }
  const snapshot=result?.snapshot;
  const strategy=result?.strategy;
  const connected=result?.connected || Boolean(snapshot);
  return (
    <main className="agentMain">
      <div className="agentTop">
        <div><div className="agentKicker">DR CLOUD · SOCIAL INTELLIGENCE</div><h1>Agent IA Instagram</h1><p>Un cockpit pour analyser, décider et progresser sans publier à l'aveugle.</p></div>
        <span className="agentVersion">V2 · Projet</span>
      </div>
      <div className="agentIntro">
        <div className="agentConnect"><span className="agentDot"/>{connected?"Connexion Meta enregistrée":"Connexion Meta à configurer"}</div>
        <div className="agentControls">
          <label htmlFor="adminKey">Clé d'administration</label>
          <input id="adminKey" type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="Clé AGENT_ADMIN_KEY" autoComplete="off"/>
          <div className="agentButtons">
            <button disabled={!!loading} onClick={()=>request("/api/agent/dashboard")}>Voir le tableau de bord</button>
            <button disabled={!!loading} className="agentSecondary" onClick={()=>request("/api/agent/meta/connect","POST")}>Connecter Instagram</button>
            <button disabled={!!loading} className="agentAccent" onClick={()=>request("/api/agent/run","POST")}>Lancer l'audit IA</button>
          </div>
          <div className="agentHint">Aucune publication automatique. Une configuration Meta et Supabase est nécessaire avant le premier audit.</div>
          {loading && <div className="agentInfo">Opération en cours : {loading}…</div>}
          {error && <div role="alert" className="agentError">{error}</div>}
        </div>
      </div>
      <div className="agentStats">
        <div><span>Abonnés</span><strong>{snapshot?.followers ?? "—"}</strong></div>
        <div><span>Comptes suivis</span><strong>{snapshot?.following ?? "—"}</strong></div>
        <div><span>Contenus analysés</span><strong>{snapshot?.posts?.length ?? "—"}</strong></div>
        <div><span>Dernière analyse</span><strong className="agentSmall">{snapshot?.checkedAt ? new Date(snapshot.checkedAt).toLocaleString("fr-FR"): "—"}</strong></div>
      </div>
      <div className="agentGrid">
        <div className="agentPanel"><h2>Diagnostic IA</h2>
          <p>{strategy?.summary || "L'agent préparera ici son diagnostic dès la première collecte de données."}</p>
          {strategy?.observations?.length>0 && <ul>{strategy.observations.map((s,i)=><li key={i}>{s}</li>)}</ul>}
        </div>
        <div className="agentPanel"><h2>Niches à explorer</h2>
          {strategy?.niches?.length ? <ul>{strategy.niches.map((s,i)=><li key={i}>{s}</li>)}</ul>:<p>Les niches seront établies à partir des statistiques, pas inventées.</p>}
        </div>
        <div className="agentPanel"><h2>Propositions de contenus</h2>
          {strategy?.ideas?.length ? <ul>{strategy.ideas.map((s,i)=><li key={i}>{s}</li>)}</ul>:<p>Les premières idées apparaîtront après l'audit.</p>}
        </div>
        <div className="agentPanel"><h2>Calendrier suggéré</h2>
          {strategy?.calendar?.length ? <ul>{strategy.calendar.map((s,i)=><li key={i}><b>{s.day}</b> — {s.topic}</li>)}</ul>:<p>À construire sur les résultats et sous validation.</p>}
        </div>
      </div>
      <div className="agentPanel agentWide"><h2>Dernières publications collectées</h2>
        {snapshot?.posts?.length ? <div className="agentRows">{snapshot.posts.slice(0,12).map((p,i)=><div key={i} className="agentRow"><span>{p.date} · {p.type}</span><span>{p.likes ?? "?"} likes · {p.comments ?? "?"} commentaires</span><a href={p.url} target="_blank" rel="noopener noreferrer">Voir</a></div>)}</div> : <p>Aucune publication collectée pour le moment.</p>}
        <p className="agentHint">Les métriques non disponibles ne sont pas comptées comme des zéros. Un rapport automatique quotidien pourra être produit par la tâche planifiée.</p>
      </div>
    </main>
  );
}
