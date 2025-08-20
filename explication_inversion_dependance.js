/**
 * EXPLICATION : PRINCIPE D'INVERSION DE DÉPENDANCE (DIP)
 *
 * Le principe d'inversion de dépendance dit que :
 * 1. Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau
 * 2. Les deux doivent dépendre d'abstractions
 * 3. Les abstractions ne doivent pas dépendre des détails
 *
 * Dans notre cas : Comment changer de Mongoose à MySQL sans casser le code ?
 */

// ============================================================================
// ARCHITECTURE ACTUELLE (AVEC MONGOOSE)
// ============================================================================

// ❌ PROBLÈME : Dépendance directe à Mongoose
const User = require("../models/User"); // Dépendance directe à Mongoose

class UserService {
  async findOrCreateUser(userData) {
    // ❌ Code spécifique à Mongoose
    const user = await User.findOneAndUpdate(
      { email },
      { firstname, lastname, email, picture },
      { new: true, upsert: true }
    );
    return { success: true, user };
  }
}

// ============================================================================
// SOLUTION : INVERSION DE DÉPENDANCE
// ============================================================================

// ✅ ÉTAPE 1 : Créer une interface/abstraction
class IUserRepository {
  async findOrCreateUser(userData) {
    throw new Error("Method must be implemented");
  }

  async updateUser(email, updateData) {
    throw new Error("Method must be implemented");
  }

  async getUserByEmail(email) {
    throw new Error("Method must be implemented");
  }
}

// ✅ ÉTAPE 2 : Implémentation Mongoose
class MongooseUserRepository extends IUserRepository {
  constructor(UserModel) {
    super();
    this.User = UserModel;
  }

  async findOrCreateUser(userData) {
    try {
      const { firstname, lastname, email, picture } = userData;
      const user = await this.User.findOneAndUpdate(
        { email },
        { firstname, lastname, email, picture },
        { new: true, upsert: true }
      );
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUser(email, updateData) {
    try {
      const user = await this.User.findOneAndUpdate({ email }, updateData, {
        new: true,
      });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await this.User.findOne({ email });
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// ✅ ÉTAPE 3 : Implémentation MySQL
class MySQLUserRepository extends IUserRepository {
  constructor(database) {
    super();
    this.db = database;
  }

  async findOrCreateUser(userData) {
    try {
      const { firstname, lastname, email, picture } = userData;

      // Vérifier si l'utilisateur existe
      const [existingUser] = await this.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (existingUser.length > 0) {
        // Mettre à jour l'utilisateur existant
        const [result] = await this.db.execute(
          "UPDATE users SET firstname = ?, lastname = ?, picture = ? WHERE email = ?",
          [firstname, lastname, picture, email]
        );

        const [updatedUser] = await this.db.execute(
          "SELECT * FROM users WHERE email = ?",
          [email]
        );

        return { success: true, user: updatedUser[0] };
      } else {
        // Créer un nouvel utilisateur
        const [result] = await this.db.execute(
          "INSERT INTO users (firstname, lastname, email, picture) VALUES (?, ?, ?, ?)",
          [firstname, lastname, email, picture]
        );

        const [newUser] = await this.db.execute(
          "SELECT * FROM users WHERE id = ?",
          [result.insertId]
        );

        return { success: true, user: newUser[0] };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUser(email, updateData) {
    try {
      const fields = Object.keys(updateData)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = Object.values(updateData);
      values.push(email);

      await this.db.execute(
        `UPDATE users SET ${fields} WHERE email = ?`,
        values
      );

      const [user] = await this.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      return { success: true, user: user[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserByEmail(email) {
    try {
      const [users] = await this.db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      return { success: true, user: users[0] || null };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// ✅ ÉTAPE 4 : Service qui dépend de l'abstraction
class UserService {
  constructor(userRepository) {
    // ✅ Dépend de l'abstraction, pas de l'implémentation
    this.userRepository = userRepository;
  }

  async findOrCreateUser(userData) {
    // ✅ Le service ne sait pas s'il utilise Mongoose ou MySQL
    return await this.userRepository.findOrCreateUser(userData);
  }

  async updateUser(email, updateData) {
    return await this.userRepository.updateUser(email, updateData);
  }

  async getUserByEmail(email) {
    return await this.userRepository.getUserByEmail(email);
  }
}

// ============================================================================
// CONFIGURATION ET INJECTION DE DÉPENDANCE
// ============================================================================

// ✅ Configuration pour Mongoose
function createMongooseUserService() {
  const User = require("../models/User");
  const userRepository = new MongooseUserRepository(User);
  return new UserService(userRepository);
}

// ✅ Configuration pour MySQL
function createMySQLUserService() {
  const mysql = require("mysql2/promise");
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const userRepository = new MySQLUserRepository(connection);
  return new UserService(userRepository);
}

// ✅ Factory pattern pour choisir l'implémentation
function createUserService(databaseType = "mongoose") {
  switch (databaseType) {
    case "mongoose":
      return createMongooseUserService();
    case "mysql":
      return createMySQLUserService();
    default:
      throw new Error(`Unsupported database type: ${databaseType}`);
  }
}

// ============================================================================
// UTILISATION DANS LES CONTRÔLEURS
// ============================================================================

// ✅ Le contrôleur ne change pas du tout !
const userService = createUserService(process.env.DATABASE_TYPE);

exports.createOrUpdateUser = asyncHandler(async (req, res) => {
  const result = await userService.findOrCreateUser(req.user);

  if (result.success) {
    res.json({ status: "success", message: "User Registered Successfully" });
  } else {
    res.status(400).json({ status: "error", message: result.error });
  }
});

// ============================================================================
// AVANTAGES DE CETTE APPROCHE
// ============================================================================

/**
 * ✅ AVANTAGES :
 *
 * 1. FLEXIBILITÉ : Peut changer de base de données sans modifier le code métier
 * 2. TESTABILITÉ : Peut facilement créer des mocks pour les tests
 * 3. MAINTENABILITÉ : Code plus modulaire et facile à maintenir
 * 4. ÉVOLUTIVITÉ : Peut ajouter de nouvelles implémentations facilement
 * 5. SÉPARATION DES RESPONSABILITÉS : Chaque classe a une responsabilité claire
 *
 * ❌ INCONVÉNIENTS :
 *
 * 1. PLUS DE CODE : Plus de classes et d'interfaces
 * 2. COMPLEXITÉ : Architecture plus complexe pour de petits projets
 * 3. APPRENTISSAGE : Courbe d'apprentissage plus importante
 */

// ============================================================================
// EXEMPLE DE TEST AVEC MOCK
// ============================================================================

class MockUserRepository extends IUserRepository {
  constructor() {
    super();
    this.users = [];
  }

  async findOrCreateUser(userData) {
    const existingUser = this.users.find((u) => u.email === userData.email);
    if (existingUser) {
      Object.assign(existingUser, userData);
      return { success: true, user: existingUser };
    } else {
      const newUser = { id: Date.now(), ...userData };
      this.users.push(newUser);
      return { success: true, user: newUser };
    }
  }

  async updateUser(email, updateData) {
    const user = this.users.find((u) => u.email === email);
    if (user) {
      Object.assign(user, updateData);
      return { success: true, user };
    }
    return { success: false, error: "User not found" };
  }

  async getUserByEmail(email) {
    const user = this.users.find((u) => u.email === email);
    return { success: true, user: user || null };
  }
}

// Test avec mock
function testUserService() {
  const mockRepository = new MockUserRepository();
  const userService = new UserService(mockRepository);

  // Test sans base de données réelle
  userService
    .findOrCreateUser({
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      picture: "avatar.jpg",
    })
    .then((result) => {
      console.log("Test result:", result);
    });
}

// ============================================================================
// CONCLUSION
// ============================================================================

/**
 * L'inversion de dépendance permet de :
 *
 * 1. Découpler le code métier de la technologie de base de données
 * 2. Faciliter les tests avec des mocks
 * 3. Permettre le changement de technologie sans refactoring massif
 * 4. Améliorer la maintenabilité et l'évolutivité du code
 *
 * C'est particulièrement utile pour :
 * - Les projets qui peuvent changer de base de données
 * - Les projets qui nécessitent des tests unitaires
 * - Les projets qui doivent être maintenus sur le long terme
 * - Les équipes qui travaillent sur différentes parties du système
 */

module.exports = {
  IUserRepository,
  MongooseUserRepository,
  MySQLUserRepository,
  UserService,
  createUserService,
  MockUserRepository,
};
