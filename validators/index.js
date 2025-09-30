// Combine and re-export all validators from both files.
// The spread operator (...) takes all properties from each object
// (authValidators and userValidators) and merges them into a single object.
// This way, you can import every validator from one central module instead
// of importing them separately from each file.
// Note: if both objects contain properties with the same name, the latter
// (userValidators) will overwrite the former (authValidators).

const authValidators = require("./auth.validators");
const userValidators = require("./user.validators");

module.exports = {
  ...authValidators,
  ...userValidators,
};
