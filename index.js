const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const fs = require("fs");

const { connectDB, validateDatabaseConfig } = require("./config/database");
const { errorHandler } = require("./middlewares/errorHandler");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
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
    app.listen(PORT, () => {
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
