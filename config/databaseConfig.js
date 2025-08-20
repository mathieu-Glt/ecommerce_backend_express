/**
 * CONFIGURATION DE LA BASE DE DONNÉES
 *
 * Pour choisir entre Mongoose et MySQL, modifiez la variable DATABASE_TYPE dans votre fichier .env
 */

// ============================================================================
// ÉTAPE 1 : Créer/modifier le fichier .env dans le dossier server/
// ============================================================================

/*
# Pour utiliser MongoDB avec Mongoose :
DATABASE_TYPE=mongoose
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Pour utiliser MySQL :
DATABASE_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=ecommerce
*/

// ============================================================================
// ÉTAPE 2 : Comment le serveur fait le choix
// ============================================================================

/**
 * Dans server/index.js, ligne 8 :
 * const userService = UserServiceFactory.createUserService(process.env.DATABASE_TYPE || 'mongoose');
 *
 * Le serveur lit la variable DATABASE_TYPE et :
 * - Si DATABASE_TYPE=mongoose → utilise MongoDB
 * - Si DATABASE_TYPE=mysql → utilise MySQL
 * - Si pas de valeur → utilise mongoose par défaut
 */

// ============================================================================
// ÉTAPE 3 : Comment tester le changement
// ============================================================================

/**
 * 1. Modifiez votre fichier .env :
 *    DATABASE_TYPE=mysql
 *
 * 2. Redémarrez le serveur :
 *    npm start
 *
 * 3. Regardez les logs :
 *    📊 Database type: mysql
 *    ✅ MySQL configuration ready
 */

// ============================================================================
// EXEMPLE DE FICHIER .env COMPLET
// ============================================================================

const exampleEnvFile = `
# Configuration de la base de données
DATABASE_TYPE=mongoose

# Configuration MongoDB (pour mongoose)
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Configuration MySQL (pour mysql)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=ecommerce

# Autres configurations
PORT=8000
NODE_ENV=development
`;

// ============================================================================
// VÉRIFICATION DE LA CONFIGURATION
// ============================================================================

function checkDatabaseConfig() {
  const databaseType = process.env.DATABASE_TYPE || "mongoose";

  console.log("🔍 Vérification de la configuration :");
  console.log(`📊 Type de base de données : ${databaseType}`);

  if (databaseType === "mongoose") {
    if (process.env.MONGODB_URI) {
      console.log("✅ MONGODB_URI configuré");
    } else {
      console.log("❌ MONGODB_URI manquant");
    }
  } else if (databaseType === "mysql") {
    const requiredVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length === 0) {
      console.log("✅ Toutes les variables MySQL sont configurées");
    } else {
      console.log(`❌ Variables MySQL manquantes : ${missingVars.join(", ")}`);
    }
  }
}

module.exports = {
  checkDatabaseConfig,
  exampleEnvFile,
};
