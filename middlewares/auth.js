const admin = require("../firebase");

exports.checkAuth = async (req, res, next) => {
  console.log("Checking Authentication :: ", req.headers);

  try {
    // BEARER TOKEN
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token :: ", token);
    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const firebaseUser = await admin.auth().verifyIdToken(token);
    console.log("Firebase User in  authchacheck:: ", firebaseUser);

    // Récupérer l'utilisateur à partir de son UID dans Firebase
    // const userRecord = await admin.auth().getUser(firebaseUser.uid);
    // console.log("User Record in checkAuth middleware :: ", userRecord);

    // Récupérer les informations utilisateur supplémentaires depuis Firestore
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(firebaseUser.uid)
      .get();

    req.user = userDoc.data();
    console.log("User in checkAuth middleware :: ", req.user);
    next();
  } catch (error) {
    console.log("Error in checkAuth middleware :: ", error);
    res
      .status(401)
      .json({ status: "error", message: "Invalid or Expired Token" });
  }
};
