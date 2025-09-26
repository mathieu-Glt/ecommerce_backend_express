const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail } = require("../config/brevo");

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.jwtSecret =
      process.env.JWT_SECRET || "your-secret-key-change-in-production";
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";
  }

  /**
   * Authentifier un utilisateur avec email et mot de passe
   */
  async authenticateUser(email, password) {
    try {
      // Récupérer l'utilisateur par email
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

      // Vérifier que l'utilisateur a un mot de passe
      if (!user.password) {
        console.error("User has no password:", user.email);
        return {
          success: false,
          error: "Email or password incorrect",
        };
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Email or password incorrect",
        };
      }

      // Générer le token JWT
      const token = this.generateToken(user);

      // Retourner les données utilisateur (sans le mot de passe)
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
   * Générer un token JWT
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
   * Vérifier un token JWT
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
   * Créer un nouvel utilisateur
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
   * Récupérer un utilisateur par ID
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

  // Récuperer le role de l'utilisateur
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
