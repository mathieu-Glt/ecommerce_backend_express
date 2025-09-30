/**
 * @file AuthService.js
 * @description
 * Authentication Service
 *
 * Handles authentication, JWT generation and verification,
 * user creation, password validation, and user retrieval.
 * Uses an abstracted user repository for database operations.
 *
 * Dependencies:
 *  - jsonwebtoken
 *  - bcryptjs
 *  - Brevo transactional email service (sendWelcomeEmail)
 *
 * Environment Variables:
 *  - JWT_SECRET: Secret key for signing JWT tokens
 *  - JWT_EXPIRES_IN: Expiration time for JWT tokens (default: "24h")
 */

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail } = require("../config/brevo");

/**
 * Authentication Service
 * @class AuthService
 */
class AuthService {
  /**
   * Initializes AuthService with a user repository.
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
   * @param {string} email - User email.
   * @param {string} password - Plain text password.
   * @returns {Promise<Object>} Result object containing:
   *  - success {boolean} Whether authentication succeeded
   *  - user {Object} User data (if success, without password)
   *  - token {string} JWT token (if success)
   *  - error {string} Error message (if failure)
   */
  async authenticateUser(email, password) {
    try {
      const userResult = await this.userRepository.getUserByEmail(email);

      if (!userResult.success || !userResult.user) {
        return { success: false, error: "Email or password incorrect" };
      }

      const user = userResult.user;

      if (!user.password) {
        return { success: false, error: "Email or password incorrect" };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return { success: false, error: "Email or password incorrect" };
      }

      const token = this.generateToken(user);

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

      return { success: true, user: userData, token };
    } catch (error) {
      return { success: false, error: "Authentication error" };
    }
  }

  /**
   * Generate a JWT token for a user.
   * @param {Object} user - User object.
   * @returns {string} Signed JWT containing userId, email, and role.
   */
  generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role || "user",
    };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  /**
   * Verify a JWT token.
   * @param {string} token - JWT token to verify.
   * @returns {Object} Result containing:
   *  - success {boolean} Whether token is valid
   *  - user {Object} Decoded payload (if valid)
   *  - error {string} Error message (if invalid/expired)
   */
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return { success: true, user: decoded };
    } catch (error) {
      return { success: false, error: "Invalid or expired token" };
    }
  }

  /**
   * Create a new user or update existing one if email already exists.
   * Automatically hashes password if needed and sends a welcome email.
   * @param {Object} userData - User data including email, password, firstname, lastname, picture, address, role.
   * @returns {Promise<Object>} Result containing:
   *  - success {boolean}
   *  - user {Object} Created/updated user data (without password)
   *  - token {string} JWT token for the new user
   *  - error {string} Error message (if failure)
   */
  async createUser(userData) {
    try {
      const result = await this.userRepository.findOrCreateUser(userData);

      if (!result.success) return result;

      const token = this.generateToken(result.user);

      try {
        await sendWelcomeEmail(result.user.email, result.user.firstname);
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }

      const userResponse = {
        _id: result.user._id,
        email: result.user.email,
        name:
          result.user.name ||
          `${result.user.firstname || ""} ${result.user.lastname || ""}`.trim(),
        firstname: result.user.firstname,
        lastname: result.user.lastname,
        picture: result.user.picture,
        address: result.user.address || "",
        role: result.user.role || "user",
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      };

      return { success: true, user: userResponse, token };
    } catch (error) {
      return { success: false, error: "User creation error" };
    }
  }

  /**
   * Retrieve a user by their ID.
   * @param {string} userId - User ID.
   * @returns {Promise<Object>} Result containing:
   *  - success {boolean}
   *  - user {Object} User data without password
   *  - error {string} Error message (if failure)
   */
  async getUserById(userId) {
    try {
      const result = await this.userRepository.findUserById(userId);

      if (!result.success || !result.user) return result;

      const userResponse = {
        _id: result.user._id,
        email: result.user.email,
        name:
          result.user.name ||
          `${result.user.firstname || ""} ${result.user.lastname || ""}`.trim(),
        firstname: result.user.firstname,
        lastname: result.user.lastname,
        picture: result.user.picture,
        address: result.user.address || "",
        role: result.user.role || "user",
        createdAt: result.user.createdAt,
        updatedAt: result.user.updatedAt,
      };

      return { success: true, user: userResponse };
    } catch (error) {
      return { success: false, error: "User retrieval error" };
    }
  }

  /**
   * Get the role of a user by their ID.
   * @param {string} userId - User ID.
   * @returns {Promise<Object>} Result containing:
   *  - success {boolean}
   *  - role {string} User role (default "user")
   *  - error {string} Error message (if failure)
   */
  async getUserRole(userId) {
    try {
      const result = await this.userRepository.findUserById(userId);
      if (!result.success || !result.user)
        return { success: false, error: "User not found" };
      return { success: true, role: result.user.role || "user" };
    } catch (error) {
      return { success: false, error: "Error retrieving user role" };
    }
  }
}

module.exports = AuthService;
