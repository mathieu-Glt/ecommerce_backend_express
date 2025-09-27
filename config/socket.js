const { Server } = require("socket.io");

let ioInstance;

/**
 * Initialize the Socket.IO server with session middleware and CORS configuration.
 * Ensures a singleton instance of Socket.IO.
 * @param {http.Server} httpServer - The HTTP server to attach Socket.IO to.
 * @param {function} sessionMiddleware - Express session middleware to integrate sessions with sockets.
 * @returns {Server} The Socket.IO instance.
 */
function initSocket(httpServer, sessionMiddleware) {
  console.log("🚀 Initializing Socket.IO...");

  // Return existing instance if already initialized
  if (ioInstance) return ioInstance;
  console.log("♻️ Socket.IO already initialized, returning existing instance");

  // Create new Socket.IO server
  ioInstance = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"], // Allowed frontend origins
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    },
    pingTimeout: 60000, // Disconnect after 60s without ping
    pingInterval: 25000, // Ping clients every 25s
    transports: ["websocket", "polling"], // Transport methods
  });

  console.log("⚙️ Socket.IO configuration complete");
  console.log("🔗 Applying session middleware...");
  ioInstance.engine.use(sessionMiddleware);

  // Handle new socket connections
  ioInstance.on("connection", (socket) => {
    const session = socket.request.session;
    const sessionId = session?.id;

    console.log("🔌 NEW SOCKET CONNECTION:");
    console.log(`   → Socket ID: ${socket.id}`);
    console.log(`   → Session ID: ${sessionId}`);
    console.log(`   → IP: ${socket.request.connection.remoteAddress}`);

    if (!session) {
      console.error("❌ No session found in socket request");
      socket.emit("auth:required", { reason: "no_session" });
      return socket.disconnect(true);
    }

    // Log session details for debugging
    console.log("🔍 SESSION INSPECTION:");
    console.log(`   → Session ID: ${session.id}`);
    console.log(`   → Keys: [${Object.keys(session).join(", ")}]`);
    console.log(`   → Has user: ${!!session.user}`);
    console.log(`   → Has token: ${!!session.token}`);
    console.log(
      `   → Has pending notification: ${!!session.pendingSocketNotification}`
    );

    // Handle pending notifications (if any)
    if (!session.user && session.pendingSocketNotification) {
      console.log("📋 PROCESSING PENDING NOTIFICATION:");

      const notification = session.pendingSocketNotification;
      console.log(`   → Type: ${notification.type}`);
      console.log(`   → Has user data: ${!!notification.data?.user}`);

      if (notification.data && notification.data.user) {
        console.log("✅ RESTORING USER DATA");
        session.user = notification.data.user;
        session.token = notification.data.token;
        session.refreshToken = notification.data.refreshToken;

        // Clear the pending notification
        delete session.pendingSocketNotification;

        // Save session
        session.save((err) => {
          if (err) {
            console.error("❌ Error saving restored session:", err);
          } else {
            console.log("✅ Session restored and saved");
          }
        });
      }
    }

    // Final validation: ensure session has a user
    if (!session.user) {
      console.warn("❌ CONNECTION REFUSED - No user in session");
      console.warn("🔍 Full session:", JSON.stringify(session, null, 2));

      socket.emit("auth:required", {
        reason: "no_user_in_session",
        debug: {
          sessionId: sessionId,
          sessionKeys: Object.keys(session),
        },
      });
      return socket.disconnect(true);
    }

    // Authorized connection
    console.log("✅ SOCKET CONNECTION AUTHORIZED:");
    console.log(`   → User ID: ${session.user}`);
    console.log(`   → User ID: ${session.user.id}`);
    console.log(`   → User email: ${session.user.email}`);

    // Join rooms for the session and user
    socket.join(sessionId);
    socket.join(`user:${session.user.id}`);

    // Notify client of successful connection
    const connectionData = {
      user: session.user,
      token: session.token,
      refreshToken: session.refreshToken,
      socketId: socket.id,
      timestamp: Date.now(),
    };

    console.log("📡 EMITTING user:connected");
    socket.emit("user:connected", connectionData);

    // Disconnect listener
    socket.on("disconnect", (reason) => {
      console.log(`🔌 SOCKET DISCONNECTED: ${socket.id} - Reason: ${reason}`);
    });
  });

  return ioInstance;
}

/**
 * Get the current Socket.IO instance.
 * @throws Will throw an error if Socket.IO is not initialized.
 */
function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO is not initialized. Call initSocket first.");
  }
  return ioInstance;
}

/**
 * Emit an event to a specific user by user ID.
 * @param {string} userId - Target user ID.
 * @param {string} event - Event name.
 * @param {Object} data - Event payload.
 */
function emitToUser(userId, event, data) {
  const io = getIO();
  io.to(`user:${userId}`).emit(event, data);
}

/**
 * Emit an event to a specific session by session ID.
 * @param {string} sessionId - Target session ID.
 * @param {string} event - Event name.
 * @param {Object} data - Event payload.
 */
function emitToSession(sessionId, event, data) {
  const io = getIO();
  io.to(sessionId).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUser, emitToSession };
