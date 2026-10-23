# Dr Cloud Social Agent — V2 (branche de travail)

Cette V2 ajoute un agent d'audit Instagram pour le compte professionnel Dr Cloud :
- OAuth officiel Instagram Login, sans nécessité de page Facebook liée ;
- jeton longue durée chiffré côté serveur (AES-256-GCM) ;
- collecte profil, 30 derniers médias et insights lorsque accessibles ;
- synthèse et propositions de niches institutionnelles factuelles par IA ;
- enregistrement du dernier rapport dans Supabase ;
- déclenchement manuel et tâche planifiée quotidienne Vercel ;
- tableau de bord privé par clé d'administration ;
- AUCUNE publication, publicité ni réponse automatique.

## Configuration

1. Créer une application sur Meta for Developers > Instagram API with Instagram Login.
2. Configurer son URL de retour EXACTE : https://VOTRE-DOMAINE/api/agent/meta/callback
3. Obtenir les autorisations instagram_business_basic et instagram_business_manage_insights adaptées au compte professionnel.
4. Créer la table avec sql/agent.sql dans votre projet Supabase.
5. Définir les variables d'environnement de .env.example dans Vercel, sans jamais les committer.
6. Générer AGENT_ENCRYPTION_KEY depuis 32 octets aléatoires encodés en base64 ; créer une longue clé AGENT_ADMIN_KEY et CRON_SECRET distincte.
7. Déployer après revue du code, ouvrir /agent, saisir la clé admin et cliquer « Connecter Instagram ».
8. Cliquer « Lancer l'audit » ; le cron s'exécutera chaque jour à 08:00 UTC si l'offre Vercel l'autorise.

## Conformité et limites

L'application d'audit est indépendante de la connexion Metricool faite dans ChatGPT : ses autorisations ne sont pas réutilisables dans Vercel.
Le jeton Meta et la clé Supabase sont exclusivement côté serveur.
Les données disponibles dépendent des autorisations accordées, de l'ancienneté du compte et des limitations API.
Les propositions éditoriales sont des brouillons institutionnels non promotionnels soumis à vérification humaine.
La publication automatique, la gestion des commentaires, l'analyse de concurrents via API et le montage vidéo ne sont PAS inclus dans cette V2.
Aucun secret, jeton ou mot de passe ne doit être partagé dans ChatGPT ou enregistré dans Git.
