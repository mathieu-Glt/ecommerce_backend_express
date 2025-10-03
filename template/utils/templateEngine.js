const ejs = require("ejs");
const path = require("path");

/**
 * Render an EJS email template with given data
 * @param {string} templateName - Name of the template file (without .ejs extension)
 * @param {object} data - Data to inject into the template
 * @returns {Promise<string>} - Rendered HTML content
 */
const renderTemplate = async (templateName, data) => {
  const filePath = path.join(__dirname, "template", `${templateName}.ejs`);
  return ejs.renderFile(filePath, data);
};

module.exports = renderTemplate;
