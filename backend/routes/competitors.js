import express from "express";

import {
  getCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor
} from "../controllers/competitorsController.js";

const router = express.Router();

// GET competitors
router.get("/", getCompetitors);

// POST competitor
router.post("/", createCompetitor);

// UPDATE competitor
router.put("/:id", updateCompetitor);

// DELETE competitor
router.delete("/:id", deleteCompetitor);

export default router;