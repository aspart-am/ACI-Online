# ACI Online - Application de Gestion des Compensations des Partenaires

Cette application permet de gérer les indicateurs ACI (Accord Conventionnel Interprofessionnel) et les compensations associées pour les membres d'une Maison de Santé Pluriprofessionnelle (MSP).

## Fonctionnalités

- Gestion des indicateurs ACI (socles et optionnels)
- Gestion des associés (professionnels de santé)
- Attribution de missions aux associés
- Suivi des compensations
- Tableau de bord avec statistiques

## Technologies utilisées

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express.js
- **Base de données**: PostgreSQL (via Drizzle ORM)
- **Déploiement**: Render Cloud

## Déploiement sur Render Cloud

### Prérequis

- Un compte [Render](https://render.com/)
- Un compte GitHub (ou GitLab, Bitbucket)

### Étapes de déploiement

1. **Préparer le code source**

   Assurez-vous que votre code est dans un dépôt Git (GitHub, GitLab, Bitbucket).

2. **Se connecter à Render**

   Connectez-vous à votre compte Render et accédez au tableau de bord.

3. **Créer un nouveau service**

   - Cliquez sur "New" puis "Blueprint"
   - Connectez votre dépôt Git
   - Sélectionnez le dépôt contenant l'application

4. **Configuration automatique**

   Render détectera automatiquement le fichier `render.yaml` à la racine du projet et vous proposera de déployer les services définis dans ce fichier.

   - Confirmez la création des services (web service et base de données PostgreSQL)
   - Render va créer et configurer automatiquement les services selon les spécifications du fichier `render.yaml`

5. **Vérification du déploiement**

   - Une fois le déploiement terminé, vous pourrez accéder à votre application via l'URL fournie par Render
   - Vérifiez que l'application fonctionne correctement

### Détails techniques du déploiement

Le fichier `render.yaml` configure:

- Un service web Node.js pour l'application
- Une base de données PostgreSQL
- Les variables d'environnement nécessaires
- Les commandes de build et de démarrage

Lors du déploiement:

1. Render installe les dépendances avec `npm install`
2. Les migrations de la base de données sont générées avec `npm run db:generate`
3. L'application est construite avec `npm run build`
4. L'application démarre avec `npm run start`

### Mise à jour de l'application

Pour mettre à jour l'application:

1. Poussez vos modifications sur le dépôt Git
2. Render détectera automatiquement les changements et redéploiera l'application

## Développement local

### Installation

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd PartnerCompensation

# Installer les dépendances
npm install

# Démarrer l'application en mode développement
npm run dev
```

### Variables d'environnement

Pour le développement local, vous pouvez créer un fichier `.env` à la racine du projet avec les variables suivantes:

```
DATABASE_URL=postgresql://user:password@localhost:5432/aci_online
```

En mode développement, l'application utilise un stockage en mémoire par défaut, donc la base de données n'est pas nécessaire pour les tests initiaux.

## Structure du projet

- `client/`: Code source du frontend React
- `server/`: Code source du backend Express.js
- `shared/`: Code partagé entre le frontend et le backend (schémas, types)
- `scripts/`: Scripts utilitaires
- `migrations/`: Migrations de la base de données (générées)

## Licence

MIT
