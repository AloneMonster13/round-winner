import express from "express";
import {
  getCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
  updateCompetitorPhoto,
} from "../controllers/competitorsController.js";
import upload from "../middleware/upload.js"; // multer single file handler

const router = express.Router();

// GET all competitors
router.get("/", getCompetitors);

// POST new competitor (with optional photo)
router.post("/", upload.single("photo"), createCompetitor);

// POST update competitor photo
router.post("/update-photo/:id", upload.single("photo"), updateCompetitorPhoto);

// PUT update competitor name & round
router.put("/:id", updateCompetitor);

// DELETE competitor
router.delete("/:id", deleteCompetitor);

export default router;