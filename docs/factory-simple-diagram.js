/**
 * 🏭 PATTERN FACTORY - SCHÉMA SIMPLE ET PRATIQUE
 *
 * Ce fichier montre comment le pattern Factory fonctionne dans votre architecture
 */

// ============================================================================
// 1. CONFIGURATION (Fichier .env)
// ============================================================================

const configuration = {
  DATABASE_TYPE: "mongoose", // ou 'mysql' ou 'mock'
  MONGODB_URI: "mongodb://localhost:27017/ecommerce",
  DB_HOST: "localhost",
  DB_USER: "root",
  DB_PASSWORD: "password",
  DB_NAME: "ecommerce",
};

// ============================================================================
// 2. FACTORY PATTERN - LE CŒUR DU SYSTÈME
// ============================================================================

class UserServiceFactory {
  // 🎯 MÉTHODE PRINCIPALE - Le point d'entrée
  static createUserService(databaseType = "mongoose") {
    console.log(`🏭 Factory: Création d'un service pour ${databaseType}`);

    switch (databaseType.toLowerCase()) {
      case "mongoose":
        return this.createMongooseUserService();
      case "mysql":
        return this.createMySQLUserService();
      case "mock":
        return this.createMockUserService();
      default:
        console.warn(
          `⚠️ Type de DB non supporté: ${databaseType}, utilisation de mongoose par défaut`
        );
        return this.createMongooseUserService();
    }
  }

  // 🐘 CRÉATION SERVICE MONGODB
  static createMongooseUserService() {
    console.log("📦 Factory: Création du repository MongoDB");
    const User = require("../models/User");
    const MongooseUserRepository = require("../repositories/MongooseUserRepository");

    const userRepository = new MongooseUserRepository(User);
    const userService = new UserService(userRepository);

    console.log("✅ Factory: Service MongoDB créé avec succès");
    return userService;
  }

  // 🐬 CRÉATION SERVICE MYSQL
  static createMySQLUserService() {
    console.log("📦 Factory: Création du repository MySQL");
    const mysql = require("mysql2/promise");
    const MySQLUserRepository = require("../repositories/MySQLUserRepository");

    const connection = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const userRepository = new MySQLUserRepository(connection);
    const userService = new UserService(userRepository);

    console.log("✅ Factory: Service MySQL créé avec succès");
    return userService;
  }

  // 🧪 CRÉATION SERVICE MOCK (pour les tests)
  static createMockUserService() {
    console.log("📦 Factory: Création du repository Mock");
    const MockUserRepository =
      require("../tests/userService.test").MockUserRepository;

    const userRepository = new MockUserRepository();
    const userService = new UserService(userRepository);

    console.log("✅ Factory: Service Mock créé avec succès");
    return userService;
  }
}

// ============================================================================
// 3. UTILISATION DANS LES CONTRÔLEURS
// ============================================================================

// 🎯 EXEMPLE D'UTILISATION SIMPLE
function exempleUtilisation() {
  console.log("\n🎯 EXEMPLE D'UTILISATION:");

  // Le contrôleur demande un service
  const userService = UserServiceFactory.createUserService("mongoose");

  // Il utilise le service sans savoir quelle DB est utilisée
  const result = userService.findOrCreateUser({
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    picture: "avatar.jpg",
  });

  console.log("📊 Résultat:", result);
}

// ============================================================================
// 4. SCHÉMA VISUEL DU FLUX
// ============================================================================

const fluxFactory = `
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLUX FACTORY                                   │
│                                                                             │
│  1. 📝 CONFIGURATION                                                        │
│     .env → DATABASE_TYPE=mongoose                                          │
│                                                                             │
│  2. 🚀 DÉMARRAGE SERVEUR                                                   │
│     server/index.js → lit DATABASE_TYPE                                    │
│                                                                             │
│  3. 🏭 CRÉATION FACTORY                                                    │
│     UserServiceFactory.createUserService('mongoose')                       │
│                                                                             │
│  4. 🔧 DÉCISION FACTORY                                                    │
│     switch('mongoose') → createMongooseUserService()                       │
│                                                                             │
│  5. 📦 CRÉATION REPOSITORY                                                 │
│     new MongooseUserRepository(User)                                       │
│                                                                             │
│  6. 🎯 CRÉATION SERVICE                                                    │
│     new UserService(mongooseRepository)                                    │
│                                                                             │
│  7. ✅ SERVICE PRÊT                                                         │
│     userService.findOrCreateUser(userData)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
`;

// ============================================================================
// 5. AVANTAGES DU PATTERN FACTORY
// ============================================================================

const avantages = {
  flexibilite: "🔄 Changer de DB en modifiant juste DATABASE_TYPE",
  testabilite: "🧪 Tests faciles avec des mocks",
  maintenabilite: "🔧 Code centralisé et réutilisable",
  encapsulation: "🛡️ Le client ne sait pas comment le service est créé",
  separation: "📋 Séparation claire des responsabilités",
};

// ============================================================================
// 6. COMPARAISON AVANT/APRÈS
// ============================================================================

const comparaison = {
  avant: {
    code: `
// ❌ ANCIEN CODE - Dépendance directe
const User = require('../models/User');
const userService = new UserService(User);
    `,
    problemes: [
      "Dépendance directe à Mongoose",
      "Impossible de changer de DB",
      "Code dupliqué",
      "Difficile à tester",
    ],
  },
  apres: {
    code: `
// ✅ NOUVEAU CODE - Avec Factory
const userService = UserServiceFactory.createUserService(process.env.DATABASE_TYPE);
    `,
    avantages: [
      "Configuration centralisée",
      "Changement de DB facile",
      "Code réutilisable",
      "Tests faciles",
    ],
  },
};

// ============================================================================
// 7. EXPORT POUR UTILISATION
// ============================================================================

module.exports = {
  UserServiceFactory,
  configuration,
  fluxFactory,
  avantages,
  comparaison,
  exempleUtilisation,
};

// ============================================================================
// 8. EXÉCUTION DE L'EXEMPLE
// ============================================================================

if (require.main === module) {
  console.log("🏭 PATTERN FACTORY - DÉMONSTRATION");
  console.log("=====================================");

  console.log(fluxFactory);

  console.log("📋 AVANTAGES:");
  Object.entries(avantages).forEach(([key, value]) => {
    console.log(`  ${value}`);
  });

  console.log("\n🔄 COMPARAISON:");
  console.log("❌ AVANT (sans Factory):");
  console.log(comparaison.avant.code);

  console.log("✅ APRÈS (avec Factory):");
  console.log(comparaison.apres.code);
}


