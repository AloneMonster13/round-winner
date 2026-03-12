import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import roundsRoutes from "./routes/rounds.js";
import competitorsRoutes from "./routes/competitors.js";
import votesRoutes from "./routes/votes.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// API routes
app.use("/api/rounds", roundsRoutes);
app.use("/api/competitors", competitorsRoutes);
app.use("/api/votes", votesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));