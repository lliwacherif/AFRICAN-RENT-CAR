# 🚗 African Rent Car — Mobilité & Séjours d'Exception en Tunisie

Plateforme premium de location de véhicules, réservation d'hébergements de charme (Dars & Villas privées) et circuits/excursions en Tunisie.

---

## 🏗️ Architecture du Projet

Le projet est composé de deux applications distinctes :
1. **Frontend** : Application React 19 + Vite + Tailwind CSS 4 + Lucide Icons (Port par défaut : `5173`).
2. **Backend** : API RESTful avec NestJS 11 + MongoDB (Mongoose) + JWT + Passport + Cloudinary (Port par défaut : `3000`, préfixe API : `/api`).

---

## 📋 Prérequis

- **Node.js** : version 18.x ou 20.x+ recommandée (`node -v`)
- **npm** : version 9.x+ (`npm -v`)
- **MongoDB** : Serveur MongoDB local en cours d'exécution sur le port `27017` (`mongodb://localhost:27017/tunisia-car-rental`) ou URI MongoDB Atlas.

---

## 🚀 Guide de Démarrage Rapide

### 1️⃣ Étape 1 : Démarrer le Backend (NestJS)

Ouvrez un **premier terminal** et exécutez les commandes suivantes :

```bash
# Se déplacer dans le dossier backend
cd backend

# Installer les dépendances (si ce n'est pas déjà fait)
npm install

# Vérifier la présence du fichier .env
# Un fichier .env est déjà configuré dans le dossier backend.
# Si besoin, créez-le à partir de l'exemple :
# cp .env.example .env

# (Optionnel mais recommandé au premier lancement) Remplir la base de données avec des véhicules, appartements et excursions :
npm run seed

# Démarrer le serveur NestJS en mode développement (avec rechargement à chaud) :
npm run start:dev
```

> 🟢 **Backend actif sur :** [http://localhost:3000](http://localhost:3000)  
> 🔗 **Point d'entrée de l'API :** `http://localhost:3000/api`  
> 📖 **Documentation Swagger (si activée) :** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

### 2️⃣ Étape 2 : Démarrer le Frontend (React + Vite)

Ouvrez un **deuxième terminal** et exécutez les commandes suivantes :

```bash
# Assurez-vous d'être à la racine du projet
# Si vous étiez dans le dossier backend :
cd ..

# Si vous venez d'ouvrir le terminal depuis la racine :
# cd /Users/ahmedguezguez/.gemini/antigravity-ide/scratch/Tunisia-Car-Rental

# Installer les dépendances du frontend :
npm install

# Vérifier le fichier .env à la racine (doit contenir) :
# VITE_API_URL=http://localhost:3000/api

# Lancer le serveur de développement Vite :
npm run dev
```

> 🟢 **Frontend actif sur :** [http://localhost:5173](http://localhost:5173)

---

## 🌐 Routes Principales de l'Application

| Page | Route | Description |
| :--- | :--- | :--- |
| **Accueil** | [`/`](http://localhost:5173/) | Landing page luxe avec moteur de réservation et showcase |
| **Voitures** | [`/voitures`](http://localhost:5173/voitures) | Recherche de véhicules avec filtres avancés & bascule vue Liste / Mosaïque |
| **Hébergements** | [`/appartements`](http://localhost:5173/appartements) | Dars de charme, villas privées avec piscine et appartements |
| **Excursions** | [`/excursions`](http://localhost:5173/excursions) | Circuits sahariens, sorties en mer, visites culturelles & quad |
| **Mes Favoris** | [`/favoris`](http://localhost:5173/favoris) | Wishlist unifiée (Voitures, Hébergements, Excursions) |
| **Mes Réservations** | [`/historique`](http://localhost:5173/historique) | Historique et gestion des réservations du client |
| **Administration** | [`/admin`](http://localhost:5173/admin) | Tableau de bord gestionnaire (flotte, réservations, utilisateurs) |
| **Guide Tunisie** | [`/guide`](http://localhost:5173/guide) | Guide interactif des régions, plages et conseils routiers |
| **Contact** | [`/contact`](http://localhost:5173/contact) | Comptoirs aéroports, agences et formulaire d'assistance VIP |

---

## ⚙️ Commandes Utiles

### Frontend (Racine)
```bash
npm run dev      # Lance le serveur local Vite
npm run build    # Compile le frontend pour la production (dans /dist)
npm run preview  # Prévisualise le build de production localement
```

### Backend (`/backend`)
```bash
cd backend
npm run start:dev   # Lance NestJS en mode watch
npm run build       # Compile NestJS (dans /dist)
npm run start:prod  # Lance le build de production NestJS
npm run seed        # Réinitialise et remplit la base MongoDB avec le jeu d'essai
npm run test        # Lance la suite de tests unitaires Jest
```

---

## 🔒 Comptes de Test

Lors du seed initial (`npm run seed`), les comptes suivants sont automatiquement configurés dans MongoDB :

- **Administrateur :**
  - Email : `admin@tunisiacarrental.com`
  - Mot de passe : `12345678`
- **Client :**
  - Email : `ahmed@example.com`
  - Mot de passe : `12345678`

