import express from "express";

import {
  getVotes,
  castVote,
  getVoteCount,
  getLeaderboard
} from "../controllers/votesController.js";

const router = express.Router();

// GET all votes
router.get("/", getVotes);

// CAST vote
router.post("/", castVote);

// GET vote count
router.get("/count/:competitorId", getVoteCount);

// GET leaderboard for round
router.get("/leaderboard/:roundId", getLeaderboard);

export default router;