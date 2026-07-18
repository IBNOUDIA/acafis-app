# 🌿 ACAFIS App — Backend API

Application de Gestion du Conseil d'Administration de l'ACAFIS.

## 🚀 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env
# Remplir le fichier .env avec vos valeurs

# 3. Initialiser la base de données
npm run seed

# 4. Démarrer le serveur
npm run dev      # Développement
npm start        # Production
```

## 📋 Variables d'environnement requises

| Variable | Description |
|---|---|
| `MONGODB_URI` | URI de connexion MongoDB Atlas |
| `JWT_SECRET` | Secret pour les tokens JWT |
| `JWT_REFRESH_SECRET` | Secret pour les refresh tokens |
| `RESEND_API_KEY` | Clé API Resend pour les emails |
| `CLIENT_URL` | URL du frontend (app.coop-acafis.com) |

## 🔌 Endpoints API

### Auth
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/refresh` | Rafraîchir token |
| GET  | `/api/auth/me` | Profil connecté |
| PUT  | `/api/auth/change-password` | Changer mot de passe |

### Membres
| Méthode | Route | Description |
|---|---|---|
| GET  | `/api/members` | Liste des 48 acquéreurs |
| GET  | `/api/members/stats` | Statistiques membres |
| GET  | `/api/members/:id` | Détail membre |
| POST | `/api/members` | Créer membre |
| PUT  | `/api/members/:id` | Modifier membre |

### Réunions
| Méthode | Route | Description |
|---|---|---|
| GET  | `/api/meetings` | Liste des réunions |
| GET  | `/api/meetings/next` | Prochaine réunion |
| GET  | `/api/meetings/:id` | Détail réunion |
| POST | `/api/meetings` | Créer réunion |
| PUT  | `/api/meetings/:id` | Modifier réunion |
| POST | `/api/meetings/:id/attendance` | Enregistrer présence |
| PUT  | `/api/meetings/:id/minutes` | Ajouter PV |

### Paiements
| Méthode | Route | Description |
|---|---|---|
| GET  | `/api/payments` | Liste paiements |
| GET  | `/api/payments/stats` | Statistiques financières |
| POST | `/api/payments` | Enregistrer paiement |
| PUT  | `/api/payments/:id/confirm` | Confirmer paiement |

### Documents
| Méthode | Route | Description |
|---|---|---|
| GET    | `/api/documents` | Liste documents |
| POST   | `/api/documents` | Ajouter document |
| DELETE | `/api/documents/:id` | Archiver document |

## 👥 Rôles et permissions

| Rôle | Description |
|---|---|
| `super_admin` | Accès total (Président) |
| `admin` | Gestion membres et réunions |
| `admin_finance` | Module financier complet |
| `membre_ca` | Lecture + commissions |
| `acquereur` | Profil personnel uniquement |

## 🔐 Comptes initiaux (après seed)

| Email | Rôle | Position |
|---|---|---|
| omar.sarr@acafis.ca | super_admin | Président |
| bintou.sarr@acafis.ca | admin_finance | Trésorière |
| diaamar757@gmail.com | super_admin | Développeur |

**Mot de passe par défaut : `Acafis2026!`**

## 🏗️ Structure du projet

```
backend/
├── config/         # Configuration DB
├── controllers/    # Logique métier
├── middleware/     # Auth JWT, validation
├── models/         # Schémas MongoDB
├── routes/         # Routes API
├── services/       # Email, notifications
├── utils/          # Helpers, seed
└── server.js       # Point d'entrée
```
