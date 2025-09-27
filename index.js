/**
 * Main server entry point.
 * Sets up Express, middlewares, routes, database connection, and starts the server.
 */

// Load environment variables from .env file
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

// Impport express dependence framework HTTP server
const express = require("express");
// Handler for users sessions
const session = require("express-session");
// Enable CORS (politics security for cross-origin requests)
const cors = require("cors");
// HTTP request logger middleware
const morgan = require("morgan");
// Secure HTTP headers middleware
const helmet = require("helmet");
// Parse incoming request bodies
const bodyParser = require("body-parser");
// File and path utilities
const fs = require("fs");
// Path utilities
const path = require("path");
// Paseport for authentication
const passport = require("./config/passport");
// Socket.io for real-time communication
const { initSocket } = require("./config/socket");
// Load route files dynamically
const { loadRoutes } = require("./utils/routeLoader");
// Handler databases connections
const { connectDB, validateDatabaseConfig } = require("./config/database");
// Handler middleware for global errors
const { errorHandler } = require("./utils/errorHandler");

// ---------------------------------------------
// Express Application Initialization
// ---------------------------------------------

const app = express();
const httpServer = require("http").createServer(app);
console.log("httpServer : ", httpServer);

// ---------------------------------------------
// Session Configuration
// ---------------------------------------------

/**
 * Session configuration used by Express and Socket.io
 * Stores user sessions with cookies.
 */
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24h
  },
};

// Apply session middleware to Express app
const sessionMiddleware = session(sessionConfig);
app.use(sessionMiddleware);

// Initialize Socket.io with session support
initSocket(httpServer, sessionMiddleware);

// ---------------------------------------------
// Global Middlewares
// ---------------------------------------------

// CORS policy configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Parse JSON payloads (limit increased for base64 images)
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));

// Logging & security middlewares
app.use(morgan("dev"));
app.use(helmet());

// Content Security Policy (CSP) specifically adapted for Azure AD
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
      workerSrc: ["'self'", "blob:"], // Required for Azure AD workers
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

// ---------------------------------------------
// Static files & uploads
// ---------------------------------------------

// Serve public files
app.use("/public", express.static("public"));

// Additional session middleware (could be consolidated with sessionConfig)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Initialize Passport.js authentication
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded images with CORS headers
app.use(
  "/api/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
    next();
  },
  express.static("uploads")
);

// Apply less restrictive headers to allow images to display correctly
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// ---------------------------------------------
// Application Initialization
// ---------------------------------------------

/**
 * Initialize the application.
 * - Validate environment database configuration
 * - Connect to the database
 * - Load all routes
 * - Setup global error handler
 * - Start the HTTP server
 */
const initializeApp = async () => {
  try {
    validateDatabaseConfig();
    await connectDB();
    loadRoutes(app);

    // Must be last: global error handler
    app.use(errorHandler);

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

// ---------------------------------------------
// Start the server
// ---------------------------------------------
initializeApp();
