# Migration de Mongoose vers MySQL

## Vue d'ensemble

Ce projet supporte actuellement Mongoose (MongoDB) et peut facilement être migré vers MySQL grâce au pattern Factory et Repository.

## Architecture actuelle

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│   Services       │───▶│   Repositories   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Factories      │    │   Models        │
                       └──────────────────┘    └─────────────────┘
```

## Migration vers MySQL

### 1. Configuration de l'environnement

Modifiez votre fichier `.env` :

```env
# Changer de mongoose à mysql
DATABASE_TYPE=mysql

# Configuration MySQL
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```

### 2. Installation des dépendances MySQL

```bash
npm install mysql2
```

### 3. Création de la base de données

Exécutez le script SQL pour créer les tables nécessaires :

```sql
-- Créer la base de données
CREATE DATABASE IF NOT EXISTS your_database;
USE your_database;

-- Exécuter le script de création des tables
-- Voir server/docs/mysql_password_reset_tokens_table.sql
```

### 4. Migration des données (optionnel)

Si vous avez des données existantes dans MongoDB, vous devrez les migrer :

```javascript
// Script de migration (à adapter selon vos besoins)
const mongoose = require("mongoose");
const mysql = require("mysql2/promise");

async function migratePasswordResetTokens() {
  // Connexion MongoDB
  await mongoose.connect("mongodb://localhost/your_database");

  // Connexion MySQL
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Récupérer tous les tokens de MongoDB
  const PasswordResetToken = require("./models/PasswordResetToken");
  const tokens = await PasswordResetToken.find({});

  // Insérer dans MySQL
  for (const token of tokens) {
    await connection.execute(
      "INSERT INTO password_reset_tokens (user_id, token, hashed_token, created_at) VALUES (?, ?, ?, ?)",
      [token.userId, token.token, token.hashedToken, token.createdAt]
    );
  }

  await connection.end();
  await mongoose.disconnect();
}
```

## Avantages de cette architecture

### ✅ Flexibilité

- Changement de base de données sans modifier le code métier
- Support de multiples bases de données simultanément

### ✅ Maintenabilité

- Séparation claire des responsabilités
- Code testable et modulaire

### ✅ Évolutivité

- Ajout facile de nouvelles bases de données
- Migration progressive possible

## Structure des repositories

### Mongoose (MongoDB)

- `MongooseResetPasswordRepository.js`
- Utilise les modèles Mongoose
- Stockage en documents JSON

### MySQL

- `MySQLResetPasswordRepository.js`
- Utilise les requêtes SQL
- Stockage en tables relationnelles

## Tests

Pour tester la migration :

```bash
# Test avec Mongoose
DATABASE_TYPE=mongoose npm test

# Test avec MySQL
DATABASE_TYPE=mysql npm test
```

## Notes importantes

1. **Sécurité** : Les tokens sont toujours hashés avec bcrypt
2. **Performance** : Les index sont créés pour optimiser les requêtes
3. **Expiration** : Les tokens expirent automatiquement (15 minutes)
4. **Compatibilité** : L'API reste identique quel que soit le backend

## Troubleshooting

### Erreur de connexion MySQL

- Vérifiez les variables d'environnement
- Assurez-vous que MySQL est démarré
- Vérifiez les permissions utilisateur

### Erreur de table manquante

- Exécutez le script SQL de création des tables
- Vérifiez que la base de données existe

### Problèmes de migration

- Sauvegardez vos données avant migration
- Testez sur un environnement de développement
- Vérifiez l'intégrité des données après migration




