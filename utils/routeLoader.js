const fs = require("fs");
const path = require("path");

/**
 * Dynamically load all route files from the routes folder.
 * Only files ending with `.routes.js` are included.
 *
 * @param {import("express").Express} app - The Express application instance
 */
const loadRoutes = (app) => {
  const routesPath = path.join(__dirname, "../routes");

  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith(".routes.js")) {
      console.log("Loading route file:", file);
      const route = require(path.join(routesPath, file));
      const routeName = file.replace(".routes.js", "");
      app.use(`/api/${routeName}`, route);
    }
  });
};

module.exports = { loadRoutes };
