/**
 * @file config/passport.js
 * @description
 * Passport.js configuration for authentication with:
 * - Azure AD OAuth2
 * - Google OAuth2
 *
 * Handles user creation and updates in MongoDB,
 * as well as session serialization/deserialization.
 * useful link for reference Azure AD OAuth2 and Microsoft Graph API:
 * - https://www.passportjs.org/packages/passport-azure-ad-oauth2/
 * - https://learn.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
 * - https://learn.microsoft.com/en-us/graph/api/resources/user?view=graph-rest-1.0
 * - https://learn.microsoft.com/en-us/graph/call-api
 *
 * useful link for reference Google OAuth2 :
 * - https://www.passportjs.org/packages/passport-google-oauth2/
 * - https://github.com/jaredhanson/passport-google-oauth2
 * - https://developers.google.com/identity/protocols/oauth2?hl=fr
 * - https://developers.google.com/identity/protocols/oauth2/web-server?hl=fr
 * - https://googleapis.dev/nodejs/googleapis/latest/oauth2/classes/Resource%24Userinfo.html
 *
 *
 */

const passport = require("passport");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

/**
 * @description
 * Azure AD OAuth2 Strategy
 * - Retrieves user information from Microsoft Graph API
 * - Finds or creates a user in MongoDB
 * - Links Azure account to existing user if email matches
 * - Util link 
 */
passport.use(
  // Configuration for Azure AD OAuth2 Strategy
  new AzureAdOAuth2Strategy(
    {
      clientID: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      callbackURL:
        process.env.AZURE_REDIRECT_URI ||
        "http://localhost:8000/api/auth/azure/callback",
      tenant: process.env.AZURE_TENANT_ID || "common",
      authorizationURL: `https://login.microsoftonline.com/${
        process.env.AZURE_TENANT_ID || "common"
      }/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${
        process.env.AZURE_TENANT_ID || "common"
      }/oauth2/v2.0/token`,
      scope: [
        "openid",
        "profile",
        "email",
        "https://graph.microsoft.com/User.Read",
      ],
      prompt: "consent",
    },
    // Function to fetch user profile from Microsoft Graph API
    async (accessToken, refreshToken, params, profile, done) => {
      console.log("Azure profile:", profile);
      try {
        // Retrieves of user information with Microsoft Graph
        const response = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Impossible de récupérer les infos Graph API");
        }

        const userData = await response.json();
        console.log("Microsoft Graph userData:", userData);
        // Find or create user in MongoDB
        let user = await User.findOne({ azureId: profile.id });
        console.log("Azure profile data:", user);

        if (!user) {
          // Fetch user details by userData comes from the call to the Microsoft Graph API
          const existingUser = await User.findOne({
            email: userData.mail || userData.userPrincipalName,
          });
          // Generate 16 random bytes using the native crypto module and convert to hexadecimal string
          const randomPassword = crypto.randomBytes(16).toString("hex");
          // Hash the random password before storing to the database mongoDB
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          if (existingUser) {
            // Link Azure account to existing user
            existingUser.azureId = userData.id;
            existingUser.isActive = true;
            existingUser.lastLogin = new Date();
            user = await existingUser.save();
          } else {
            // Create new user if no existing user found
            user = await User.create({
              azureId: userData.id,
              email: userData.mail || userData.userPrincipalName,
              firstname: userData.givenName || "FirstName",
              lastname: userData.surname || "LastName",
              role: "user",
              isActive: true,
              lastLogin: new Date(),
              password: hashedPassword,
            });
          }
        } else {
          // Update existing user
          user.isActive = true;
          user.lastLogin = new Date();
          if (userData.givenName && user.firstname !== userData.givenName) {
            user.firstname = userData.givenName;
          }
          if (userData.surname && user.lastname !== userData.surname) {
            user.lastname = userData.surname;
          }
          if (
            (userData.mail || userData.userPrincipalName) &&
            user.email !== (userData.mail || userData.userPrincipalName)
          ) {
            user.email = userData.mail || userData.userPrincipalName;
          }
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/**
 * @description
 * Google OAuth2 Strategy
 * - Finds an existing user or creates a new user
 * - Generates a random password and hashes it for new users
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          const randomPassword = crypto.randomBytes(16).toString("hex");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstname: profile.given_name,
            lastname: profile.family_name,
            picture: profile.picture,
            password: hashedPassword,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/**
 * @description
 * Serialize user to store in session
 * Converts MongoDB ObjectId to string
 */
passport.serializeUser((user, done) => {
  const userId = user._id ? user._id.toString() : user.id;
  if (!userId) {
    return done(new Error("No user ID to serialize"), null);
  }
  done(null, userId);
});

/**
 * @description
 * Deserialize user from session
 * Retrieves the user from MongoDB by ID
 */
passport.deserializeUser(async (id, done) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(id);

    if (!user) {
      return done(new Error(`User not found: ${id}`), null);
    }

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
