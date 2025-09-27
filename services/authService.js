/**
 * Authentication Service
 *
 * Handles authentication, JWT generation/verification,
 * user creation, password validation, and user retrieval.
 * Relies on an abstraction of a user repository.
 *
 * @class AuthService
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail } = require("../config/brevo");
// const { generateRefreshToken } = require("../controllers/auth.controllers");

class AuthService {
  /**
   * Initialize the service with a user repository.
   * @param {Object} userRepository - Repository abstraction for user operations.
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.jwtSecret =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";
  }

  /**
   * Authenticate a user using email and password.
   * @param {string} email - User's email.
   * @param {string} password - Plain text password.
   * @returns {Promise<Object>} Authentication result containing:
   *   - success {boolean}
   *   - user {Object} (if success)
   *   - token {string} (if success)
   *   - error {string} (if failure)
   */
  async authenticateUser(email, password) {
    try {
      // Retrieve user by his email
      const userResult = await this.userRepository.getUserByEmail(email);

      if (!userResult.success || !userResult.user) {
        return {
          success: false,
          error: "Email or password incorrect",
        };
      }

      const user = userResult.user;
      console.log("User found:", {
        _id: user._id,
        email: user.email,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
      });

      // Check user has been pass
      if (!user.password) {
        console.error("User has no password:", user.email);
        return {
          success: false,
          error: "Email or password incorrect",
        };
      }

      // Check validity pass
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Email or password incorrect",
        };
      }

      // Generate JWT Token
      const token = this.generateToken(user);
      // Generate JWT refreshToken
      // const refreshToken = generateRefreshToken(user);

      // Retrieve data user without password
      const userData = {
        _id: user._id,
        email: user.email,
        name:
          user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim(),
        firstname: user.firstname,
        lastname: user.lastname,
        picture: user.picture,
        address: user.address || "",
        role: user.role || "user",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        user: userData,
        token,
        refreshToken,
      };
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      return {
        success: false,
        error: "Erreur lors de l'authentification",
      };
    }
  }

  /**
   * Generate a JWT access token for a user.
   * @param {Object} user - User object.
   * @returns {string} JWT token containing userId, email, and role.
   */
  generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role || "user",
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });
  }

  /**
   * Verify a JWT token.
   * @param {string} token - JWT token to verify.
   * @returns {Object} Result containing:
   *   - success {boolean}
   *   - user {Object} decoded token payload (if valid)
   *   - error {string} (if invalid/expired)
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return {
        success: true,
        user: decoded,
      };
    } catch (error) {
      return {
        success: false,
        error: "Token invalide ou expiré",
      };
    }
  }

  /**
   * Create a new user or update an existing user if email exists.
   * Automatically hashes password if needed and sends welcome email.
   * @param {Object} userData - User data: {email, password, firstname, lastname, picture, address, role}
   * @returns {Promise<Object>} Creation result containing:
   *   - success {boolean}
   *   - user {Object} created/updated user (without password)
   *   - token {string} JWT token for new user
   *   - error {string} (if failure)
   */
  async createUser(userData) {
    console.log("📝 Création d'utilisateur avec les données:", {
      email: userData.email,
      firstname: userData.firstname,
      lastname: userData.lastname,
      hasPassword: !!userData.password,
      passwordLength: userData.password ? userData.password.length : 0,
      hasAddress: !!userData.address,
    });

    try {
      // Le modèle User s'occupe automatiquement du hashage du mot de passe
      // via le middleware pre("save")
      const result = await this.userRepository.findOrCreateUser(userData);

      if (result.success) {
        console.log("✅ Utilisateur créé avec succès:", {
          _id: result.user._id,
          email: result.user.email,
          hasPassword: !!result.user.password,
          passwordLength: result.user.password
            ? result.user.password.length
            : 0,
          isPasswordHashed: result.user.password
            ? result.user.password.startsWith("$2a$")
            : false,
        });

        // Générer le token pour le nouvel utilisateur
        const token = this.generateToken(result.user);
        // ✅ Envoyer l'email de bienvenue
        console.log("📧 Tentative d'envoi d'email de bienvenue...");
        try {
          const emailResult = await sendWelcomeEmail(
            result.user.email,
            result.user.firstname
          );
          if (emailResult.success) {
            console.log(
              `✅ Email de bienvenue envoyé avec succès à: ${result.user.email}`
            );
          } else {
            console.error(
              `❌ Échec de l'envoi d'email à: ${result.user.email}`,
              emailResult.error
            );
          }
        } catch (error) {
          console.error(
            "❌ Erreur lors de l'envoi de l'email de bienvenue:",
            error
          );
          // On continue même si l'email échoue
        }

        // TEMPORAIRE: Pour tester sans email, décommentez la ligne suivante
        // console.log(`📧 Email de bienvenue simulé pour: ${result.user.email}`);

        // Retourner les données utilisateur (sans le mot de passe)
        const userData = {
          _id: result.user._id,
          email: result.user.email,
          name:
            result.user.name ||
            `${result.user.firstname || ""} ${
              result.user.lastname || ""
            }`.trim(),
          firstname: result.user.firstname,
          lastname: result.user.lastname,
          picture: result.user.picture,
          address: result.user.address || "",
          role: result.user.role || "user",
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        };

        return {
          success: true,
          user: userData,
          token,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      return {
        success: false,
        error: "Erreur lors de la création de l'utilisateur",
      };
    }
  }

  /**
   * Retrieve a user by their unique ID.
   * @param {string} userId - User ID.
   * @returns {Promise<Object>} Result containing:
   *   - success {boolean}
   *   - user {Object} user data (without password)
   *   - error {string} (if failure)
   */
  async getUserById(userId) {
    try {
      const result = await this.userRepository.findUserById(userId);

      if (result.success && result.user) {
        // Retourner les données utilisateur (sans le mot de passe)
        const userData = {
          _id: result.user._id,
          email: result.user.email,
          name:
            result.user.name ||
            `${result.user.firstname || ""} ${
              result.user.lastname || ""
            }`.trim(),
          firstname: result.user.firstname,
          lastname: result.user.lastname,
          picture: result.user.picture,
          address: result.user.address || "",
          role: result.user.role || "user",
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        };

        return {
          success: true,
          user: userData,
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return {
        success: false,
        error: "Erreur lors de la récupération de l'utilisateur",
      };
    }
  }

  /**
   * Retrieve the role of a user by their ID.
   * @param {string} userId - User ID.
   * @returns {Promise<Object>} Result containing:
   *   - success {boolean}
   *   - role {string} user role (default "user")
   *   - error {string} (if failure)
   */
  async getUserRole(userId) {
    try {
      const result = await this.userRepository.findUserById(userId);

      if (!result.success || !result.user) {
        return { success: false, error: "User not found" };
      }

      return {
        success: true,
        role: result.user.role || "user",
      };
    } catch (error) {
      console.error("Error getting user role:", error);
      return { success: false, error: "Error getting user role" };
    }
  }
}

module.exports = AuthService;
