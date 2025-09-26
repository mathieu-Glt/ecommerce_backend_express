const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const fs = require("fs");
const passport = require("./config/passport");
const { initSocket } = require("./config/socket");

const { connectDB, validateDatabaseConfig } = require("./config/database");
const { errorHandler } = require("./utils/errorHandler");

// Initialize Express app
const app = express();
const httpServer = require("http").createServer(app);

const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false, // IMPORTANT: false!
  cookie: {
    secure: false, // true en production avec HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24h
  },
};

const sessionMiddleware = session(sessionConfig);
app.use(sessionMiddleware);
initSocket(httpServer, sessionMiddleware);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "10mb" })); // Augmenter la limite pour les images Base64
app.use(morgan("dev"));
app.use(helmet());
app.use(bodyParser.json({ limit: "10mb" })); // Augmenter la limite pour bodyParser aussi

// Active la protection CSP avec les règles nécessaires pour Azure AD
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://*.microsoftonline.com",
        "https://*.msauth.net",
        "https://*.msidentity.com",
        "https://*.msftauth.net",
        "https://*.msftauthimages.net",
      ],
      workerSrc: ["'self'", "blob:"], // ⚡️ très important pour Azure AD
      frameSrc: ["'self'", "https://login.microsoftonline.com"],
      connectSrc: [
        "'self'",
        "https://login.microsoftonline.com",
        "https://*.msidentity.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://*.msidentity.com",
        "https://*.microsoftonline.com",
      ],
    },
  })
);

// Dossier public pour servir les fichiers statiques
app.use("/public", express.static("public"));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

//
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware pour servir les images avec les bons en-têtes CORS
app.use(
  "/api/uploads",
  (req, res, next) => {
    // Ajouter les en-têtes CORS pour toutes les requêtes d'images
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
  },
  express.static("uploads")
);

app.use((req, res, next) => {
  // En-têtes de sécurité moins restrictifs pour permettre l'affichage des images
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// Load routes dynamically
const loadRoutes = () => {
  fs.readdirSync("./routes").forEach((file) => {
    if (file.endsWith(".routes.js")) {
      console.log("Loading route file:", file);
      const route = require(`./routes/${file}`);
      const routeName = file.replace(".routes.js", "");
      app.use(`/api/${routeName}`, route);
    }
  });
};

// Initialize application
const initializeApp = async () => {
  try {
    // Validate database configuration
    validateDatabaseConfig();

    // Connect to database
    await connectDB();

    // Load routes
    loadRoutes();

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // Start server
    const PORT = process.env.PORT || 8000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(
        `📊 Database type: ${process.env.DATABASE_TYPE || "mongoose"}`
      );
    });
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    process.exit(1);
  }
};

// Start the application
initializeApp();
