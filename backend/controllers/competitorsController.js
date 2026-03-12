import Competitor from "../models/Competitor.js";
import Vote from "../models/Vote.js";

// Get all competitors (optionally filter by round)
export const getCompetitors = async (req, res) => {
  try {
    const { round_id } = req.query;

    let competitors;

    if (round_id) {
      competitors = await Competitor.find({ round_id });
    } else {
      competitors = await Competitor.find();
    }

    res.json(competitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Add competitor
// export const createCompetitor = async (req, res) => {
//   try {
//     const { name, round_id } = req.body;

//     const competitor = new Competitor({
//       name,
//       round_id
//     });

//     const saved = await competitor.save();

//     res.json(saved);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const createCompetitor = async (req, res) => {
  try {
    const { name, round_id } = req.body;

    const competitor = new Competitor({
      name,
      round_id,
      photo: req.file ? req.file.filename : null
    });

    const saved = await competitor.save();

    res.json(saved);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update competitor
export const updateCompetitor = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Competitor.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete competitor
export const deleteCompetitor = async (req, res) => {
  try {
    const { id } = req.params;

    await Competitor.findByIdAndDelete(id);

    // remove votes for that competitor
    await Vote.deleteMany({ competitor_id: id });

    res.json({ message: "Competitor deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};