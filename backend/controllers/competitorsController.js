import Competitor from "../models/Competitor.js";
import Vote from "../models/Vote.js";
import cloudinary from "../config/cloudinary.js"; // make sure this file exports cloudinary properly

// Get all competitors (optionally by round)
export const getCompetitors = async (req, res) => {
  try {
    const { round_id } = req.query;
    const competitors = round_id
      ? await Competitor.find({ round_id })
      : await Competitor.find();
    res.json(competitors);
  } catch (error) {
    console.error("Get competitors error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create new competitor with optional photo
export const createCompetitor = async (req, res) => {
  try {
    const { name, round_id } = req.body;
    if (!name || !round_id)
      return res.status(400).json({ message: "Name and round required" });

    let photoUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "competitors",
      });
      photoUrl = result.secure_url;
    }

    const competitor = new Competitor({ name, round_id, photo: photoUrl });
    const saved = await competitor.save();
    res.json(saved);
  } catch (err) {
    console.error("Create competitor error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update non-photo fields: name and round_id
export const updateCompetitor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, round_id } = req.body;

    if (!name || !round_id)
      return res.status(400).json({ message: "Name and round required" });

    const updated = await Competitor.findByIdAndUpdate(
      id,
      { name, round_id },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Update competitor error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update only photo
export const updateCompetitorPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "competitors",
    });

    const updated = await Competitor.findByIdAndUpdate(
      id,
      { photo: result.secure_url },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Update competitor photo error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete competitor and votes
export const deleteCompetitor = async (req, res) => {
  try {
    const { id } = req.params;
    await Competitor.findByIdAndDelete(id);
    await Vote.deleteMany({ competitor_id: id });
    res.json({ message: "Competitor deleted" });
  } catch (error) {
    console.error("Delete competitor error:", error);
    res.status(500).json({ message: error.message });
  }
};