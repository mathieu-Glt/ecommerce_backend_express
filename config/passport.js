// config/passport.js
const passport = require("passport");
const { OIDCStrategy } = require("passport-azure-ad");
const AzureAdOAuth2Strategy = require("passport-azure-ad-oauth2").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { default: axios } = require("axios");

// --- Azure AD ---
// passport.use(
//   new OIDCStrategy(
//     {
//       identityMetadata: process.env.AZURE_IDENTITY_METADATA,
//       clientID: process.env.AZURE_CLIENT_ID,
//       clientSecret: process.env.AZURE_CLIENT_SECRET,
//       responseType: "code",
//       responseMode: "form_post",
//       redirectUrl:
//         process.env.AZURE_REDIRECT_URI ||
//         "http://localhost:8000/api/auth/azure/callback",
//       passReqToCallback: true,
//       allowHttpForRedirectUrl: true,
//       scope: ["openid", "profile", "email"],
//       loggingLevel: "info",
//       passReqToCallback: false,
//     },
//     async (req, iss, sub, profile, accessToken, refreshToken, done) => {
//       try {
//         console.log("req : ", req);
//         let user = await User.findOne({ azureId: profile.oid });

//         const email = profile._json.email || profile._json.preferred_username;
//         const firstname =
//           profile._json.given_name || profile.displayName?.split(" ")[0] || "";
//         const lastname =
//           profile._json.family_name || profile.displayName?.split(" ")[1] || "";

//         if (!user) {
//           user = await User.create({
//             azureId: profile.oid,
//             email,
//             firstname,
//             lastname,
//             password: "azure-auth",
//           });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// Azure AD with oauth2 - Configuration corrigée
passport.use(
  new AzureAdOAuth2Strategy(
    {
      clientID: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      callbackURL:
        process.env.AZURE_REDIRECT_URI ||
        "http://localhost:8000/api/auth/azure/callback",
      tenant: process.env.AZURE_TENANT_ID || "common",
      // Correction MAJEURE: Utiliser le endpoint v2.0 pour obtenir les bons tokens
      authorizationURL: `https://login.microsoftonline.com/${
        process.env.AZURE_TENANT_ID || "common"
      }/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${
        process.env.AZURE_TENANT_ID || "common"
      }/oauth2/v2.0/token`,
      // Correction 1: Utiliser les bons scopes pour Microsoft Graph v2
      scope: [
        "openid",
        "profile",
        "email",
        "https://graph.microsoft.com/User.Read",
      ],
      prompt: "consent", // force le consentement utilisateur
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        console.log("Azure OAuth2 params:", params);
        console.log("Access Token reçu:", accessToken);

        // Correction 2: Supprimer la vérification du JWT décodé
        // Le token d'accès pour Graph API n'est pas forcément un JWT lisible
        // et ne contient pas toujours les scopes de la même manière

        // Correction 3: Tester directement l'appel à Microsoft Graph
        // Si l'appel échoue, c'est que les permissions ne sont pas accordées
        const graphRes = await axios.get(
          "https://graph.microsoft.com/v1.0/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const userData = graphRes.data;
        console.log("Données utilisateur récupérées:", userData);

        // Cherche ou crée l'utilisateur dans MongoDB
        let user = await User.findOne({ azureId: userData.id });

        if (!user) {
          // Vérifier si un utilisateur avec cet email existe déjà
          const existingUser = await User.findOne({
            email: userData.mail || userData.userPrincipalName,
          });
          const randomPassword = crypto.randomBytes(16).toString("hex");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          if (existingUser) {
            // Lier le compte Azure à l'utilisateur existant
            existingUser.azureId = userData.id;
            existingUser.isActive = true;
            existingUser.lastLogin = new Date();
            user = await existingUser.save();
            console.log("Compte Azure lié à l'utilisateur existant:", user);
          } else {
            // Créer un nouveau compte
            user = await User.create({
              azureId: userData.id,
              email: userData.mail || userData.userPrincipalName,
              firstname: userData.givenName || "Prénom",
              lastname: userData.surname || "Nom",
              role: "user",
              isActive: true,
              lastLogin: new Date(),
              password: hashedPassword,
              // Les champs password et picture ne sont pas fournis (optionnels pour Azure AD)
            });
            console.log("Nouvel utilisateur Azure créé:", user);
          }
        } else {
          // Mettre à jour l'utilisateur existant
          user.isActive = true;
          user.lastLogin = new Date();

          // Mettre à jour les informations si elles ont changé
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
          console.log("Utilisateur Azure existant mis à jour:", user);
        }

        return done(null, user);
      } catch (err) {
        console.error("Erreur Azure/Graph:", err.response?.data || err.message);

        if (err.response?.status === 401) {
          console.error(
            "Token non autorisé - vérifiez les permissions de l'application Azure"
          );
        } else if (err.response?.status === 403) {
          console.error(
            "Accès interdit - l'utilisateur n'a pas consenti aux permissions"
          );
        }

        return done(err, null);
      }
    }
  )
);

// --- Google --- //
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
        console.log("Google profile passport :", profile);
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

// --- Serialize / Deserialize ---
passport.serializeUser((user, done) => {
  console.log("🔐 SERIALIZE USER (Azure):");
  console.log("   → User object:", user);
  console.log("   → User _id:", user._id);
  console.log("   → User id:", user.id);
  console.log("   → User type:", typeof user);
  console.log("   → User constructor:", user.constructor?.name);

  // Convertir l'ObjectId MongoDB en string pour la session
  const userId = user._id ? user._id.toString() : user.id;
  console.log("   → ID à sérialiser:", userId);

  if (!userId) {
    console.error("❌ ERREUR: Pas d'ID MongoDB à sérialiser");
    return done(new Error("No user ID to serialize"), null);
  }

  done(null, userId);
});
passport.deserializeUser(async (id, done) => {
  console.log("🔍 DESERIALIZE USER (Azure) - ID:", id);

  try {
    const User = require("../models/User"); // Ajustez le chemin
    const user = await User.findById(id);

    if (!user) {
      console.error("❌ User non trouvé en base avec ID:", id);
      return done(new Error(`User not found: ${id}`), null);
    }

    console.log("✅ USER DÉSÉRIALISÉ (Azure):");
    console.log("   → _id:", user._id);
    console.log("   → id (virtual):", user.id);
    console.log("   → email:", user.email);
    console.log("   → firstname:", user.firstname);
    console.log("   → azureId:", user.azureId);

    done(null, user);
  } catch (error) {
    console.error("❌ ERREUR DESERIALIZE (Azure):", error);
    done(error, null);
  }
});
module.exports = passport;
