const { Server } = require("socket.io");

let ioInstance;

function initSocket(httpServer, sessionMiddleware) {
  console.log("🚀 Initialisation Socket.IO...");
  if (ioInstance) return ioInstance;
  console.log("♻️ Socket.IO déjà initialisé, retour de l'instance existante");
  console.log("✅ Socket.IO initialisé avec succès");
  ioInstance = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    },
    // Configuration additionnelle pour la performance
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
  });
  console.log("⚙️ Configuration Socket.IO terminée");
  console.log("🔗 Application du middleware de session...");
  ioInstance.engine.use(sessionMiddleware);

  ioInstance.on("connection", (socket) => {
    const session = socket.request.session;
    const sessionId = session?.id;

    console.log("🔌 NOUVELLE CONNEXION SOCKET:");
    console.log(`   → Socket ID: ${socket.id}`);
    console.log(`   → Session ID: ${sessionId}`);
    console.log(`   → IP: ${socket.request.connection.remoteAddress}`);

    if (!session) {
      console.error("❌ Pas de session dans requête socket");
      socket.emit("auth:required", { reason: "no_session" });
      return socket.disconnect(true);
    }

    console.log("🔍 INSPECTION SESSION:");
    console.log(`   → Session ID: ${session.id}`);
    console.log(`   → Keys: [${Object.keys(session).join(", ")}]`);
    console.log(`   → Has user: ${!!session.user}`);
    console.log(`   → Has token: ${!!session.token}`);
    console.log(
      `   → Has pending notification: ${!!session.pendingSocketNotification}`
    );

    // NOUVELLE LOGIQUE: Traiter notification en attente
    if (!session.user && session.pendingSocketNotification) {
      console.log("📋 TRAITEMENT NOTIFICATION EN ATTENTE:");

      const notification = session.pendingSocketNotification;
      console.log(`   → Type: ${notification.type}`);
      console.log(`   → Has user data: ${!!notification.data?.user}`);

      if (notification.data && notification.data.user) {
        console.log("✅ RESTAURATION DONNÉES USER");
        session.user = notification.data.user;
        session.token = notification.data.token;
        session.refreshToken = notification.data.refreshToken;

        // Nettoyer la notification
        delete session.pendingSocketNotification;

        // Sauvegarder
        session.save((err) => {
          if (err) {
            console.error("❌ Erreur save session restaurée:", err);
          } else {
            console.log("✅ Session restaurée et sauvegardée");
          }
        });
      }
    }

    // Vérification finale
    if (!session.user) {
      console.warn("❌ CONNEXION REFUSÉE - Pas d'utilisateur");
      console.warn("🔍 Session complète:", JSON.stringify(session, null, 2));

      socket.emit("auth:required", {
        reason: "no_user_in_session",
        debug: {
          sessionId: sessionId,
          sessionKeys: Object.keys(session),
        },
      });
      return socket.disconnect(true);
    }

    // ✅ CONNEXION AUTORISÉE
    console.log("✅ CONNEXION SOCKET AUTORISÉE:");
    console.log(`   → User ID: ${session.user}`);
    console.log(`   → User ID: ${session.user.id}`);
    console.log(`   → User email: ${session.user.email}`);

    socket.join(sessionId);
    socket.join(`user:${session.user.id}`);

    // Notification connexion réussie
    const connectionData = {
      user: session.user,
      token: session.token,
      refreshToken: session.refreshToken,
      socketId: socket.id,
      timestamp: Date.now(),
    };

    console.log("📡 ÉMISSION user:connected");
    socket.emit("user:connected", connectionData);

    // Reste des listeners...
    socket.on("disconnect", (reason) => {
      console.log(`🔌 SOCKET DÉCONNECTÉ: ${socket.id} - Raison: ${reason}`);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error(
      "Socket.IO n'est pas initialisé. Appelle initSocket d'abord."
    );
  }
  return ioInstance;
}

// Fonction utilitaire pour émettre à un utilisateur spécifique
function emitToUser(userId, event, data) {
  const io = getIO();
  io.to(`user:${userId}`).emit(event, data);
}

// Fonction utilitaire pour émettre à une session spécifique
function emitToSession(sessionId, event, data) {
  const io = getIO();
  io.to(sessionId).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUser, emitToSession };
