import express from "express";
import {
  getRounds,
  createRound,
  updateRound,
  deleteRound
} from "../controllers/roundsController.js";

const router = express.Router();

router.get("/", getRounds);
router.post("/", createRound);
router.put("/:id", updateRound);
router.delete("/:id", deleteRound);

export default router;