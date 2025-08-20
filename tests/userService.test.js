const UserService = require("../services/userService");
const IUserRepository = require("../repositories/IUserRepository");

/**
 * Mock Repository pour les tests
 * Implémente l'interface IUserRepository
 */
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

  async findUserById(id) {
    const user = this.users.find((u) => u.id === id);
    return { success: true, user: user || null };
  }

  async deleteUser(email) {
    const index = this.users.findIndex((u) => u.email === email);
    if (index !== -1) {
      this.users.splice(index, 1);
      return { success: true, deleted: true };
    }
    return { success: false, error: "User not found" };
  }
}

/**
 * Tests du service utilisateur avec mock
 */
describe("UserService Tests", () => {
  let userService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    userService = new UserService(mockRepository);
  });

  test("should create a new user", async () => {
    const userData = {
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      picture: "avatar.jpg",
    };

    const result = await userService.findOrCreateUser(userData);

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("john@example.com");
    expect(result.user.firstname).toBe("John");
  });

  test("should update existing user", async () => {
    // Créer un utilisateur
    const userData = {
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      picture: "avatar.jpg",
    };
    await userService.findOrCreateUser(userData);

    // Mettre à jour l'utilisateur
    const updateData = { firstname: "Jane" };
    const result = await userService.updateUser("john@example.com", updateData);

    expect(result.success).toBe(true);
    expect(result.user.firstname).toBe("Jane");
  });

  test("should get user profile without password", async () => {
    // Créer un utilisateur avec mot de passe
    const userData = {
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      picture: "avatar.jpg",
      password: "secret123",
    };
    await userService.findOrCreateUser(userData);

    // Récupérer le profil
    const result = await userService.getUserProfile("john@example.com");

    expect(result.success).toBe(true);
    expect(result.profile.firstname).toBe("John");
    expect(result.profile.password).toBeUndefined();
  });

  test("should delete user", async () => {
    // Créer un utilisateur
    const userData = {
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
      picture: "avatar.jpg",
    };
    await userService.findOrCreateUser(userData);

    // Supprimer l'utilisateur
    const result = await userService.deleteUser("john@example.com");

    expect(result.success).toBe(true);
    expect(result.deleted).toBe(true);
  });
});

// Exemple d'utilisation simple
function runSimpleTest() {
  console.log("🧪 Running simple user service test...");

  const mockRepository = new MockUserRepository();
  const userService = new UserService(mockRepository);

  userService
    .findOrCreateUser({
      firstname: "Test",
      lastname: "User",
      email: "test@example.com",
      picture: "test.jpg",
    })
    .then((result) => {
      console.log("✅ Test result:", result);
    })
    .catch((error) => {
      console.error("❌ Test error:", error);
    });
}

// Exporter pour utilisation
module.exports = {
  MockUserRepository,
  runSimpleTest,
};

// Exécuter le test simple si le fichier est appelé directement
if (require.main === module) {
  runSimpleTest();
}


