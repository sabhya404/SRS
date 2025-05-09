// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Initialize Socket.IO with the HTTP server
  const io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_URL
          : ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.IO event handlers
  io.on("connection", (socket) => {
    console.log("A client connected", socket.id);

    // Join a specific event room to receive updates
    socket.on("join-event", (eventId) => {
      console.log(`Client ${socket.id} joined event ${eventId}`);
      socket.join(`event-${eventId}`);
    });

    // Handle temporary seat selection (hold for X minutes)
    socket.on("select-seat", async ({ eventId, seatId, userId }) => {
      console.log(
        `User ${userId} selected seat ${seatId} for event ${eventId}`
      );

      // Emit to other users that this seat is temporarily unavailable
      socket.to(`event-${eventId}`).emit("seat-selected", {
        seatId,
        userId,
        status: "reserved",
        timestamp: Date.now(),
      });
    });

    // Handle seat deselection (release hold)
    socket.on("deselect-seat", async ({ eventId, seatId, userId }) => {
      console.log(
        `User ${userId} deselected seat ${seatId} for event ${eventId}`
      );

      // Emit to other users that this seat is available again
      socket.to(`event-${eventId}`).emit("seat-deselected", {
        seatId,
        userId,
        status: "available",
        timestamp: Date.now(),
      });
    });

    // Handle booking confirmation
    socket.on("book-seats", async ({ eventId, seats, userId }) => {
      console.log(`User ${userId} booked seats for event ${eventId}`);

      // Notify all users in the event room about the booked seats
      io.to(`event-${eventId}`).emit("seats-booked", {
        seats,
        userId,
        status: "booked",
        timestamp: Date.now(),
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
      // Could handle releasing any seats held by this socket
    });
  });

  // Start the server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
