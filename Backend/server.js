//Loads .env before reading process.env
import "dotenv/config";
//HTTP framework to define routes and start server
import express from "express";
// middleware to add the proper CORS headers so frontend (different origin/port) can call this API.
import cors from "cors";
//ODM for MongoDB; manages the DB connection and schemas/models.
import mongoose from "mongoose";

//router module that holds routes under /api/draws
import drawsRouter from "./routes/draw.js";
import groupsRouter from "./routes/group.js";
import inviteRouter from "./routes/invite.js";

// Create app instance
const app = express();
//Registers the CORS middleware. By default it allows all origins.
app.use(cors());
//Adds a body parser so req.body is automatically populated for Content-Type: application/json requests (POST/PUT/PATCH).
app.use(express.json());

// health first: always available, even if other routers fail to init
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? "up" : "down",
    uptime: process.uptime(),
  });
});

//Mounts all routes from drawsRouter under this prefix.
app.use("/api/draws", drawsRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/invites", inviteRouter);

// Env vars
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in .env");
  process.exitCode = 1; // prefer setting exit code
} else {
  //Optional Mongoose setting to make query casting/behavior stricter and silence legacy warnings.
  mongoose.set("strictQuery", true);
  try {
    //Attempts to connect to MongoDB before starting the HTTP server.
    //await ensures we fail fast at startup if the DB is unreachable.
    await mongoose.connect(MONGO_URI);
    console.log("Mongoose connected");

    //Starts the Express server only after the DB connection succeeds.
    const server = app.listen(PORT, () => {
      console.log(`Server running: http://localhost:${PORT}`);
    });

    //Graceful shutdown
    const shutdown = async (sig) => {
      console.log(`\n${sig} received. Shutting down...`);
      try {
        //stops new connections and waits for in-flight requests to finish.
        await new Promise((r) => server.close(r));
        //close DB
        await mongoose.connection.close(false);
        process.exitCode = 0; // let Node exit naturally
      } catch (err) {
        console.error("Shutdown error:", err);
        //fail startup, don't start server
        process.exitCode = 1;
      }
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error("Mongo connect error:", err.message);
    process.exitCode = 1; // fail startup, don’t start server
  }
}
