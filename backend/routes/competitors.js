import express from "express";
import {
  getCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor
} from "../controllers/competitorsController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// GET competitors
router.get("/", getCompetitors);

// POST competitor with optional photo
router.post("/", upload.single("photo"), createCompetitor);

// UPDATE competitor
router.put("/:id", updateCompetitor);

// DELETE competitor
router.delete("/:id", deleteCompetitor);

export default router;