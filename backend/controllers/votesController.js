import Vote from "../models/Vote.js";

// Get all votes
export const getVotes = async (req, res) => {
  try {
    const votes = await Vote.find();
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cast vote
export const castVote = async (req, res) => {
  try {
    const { user_email, round_id, competitor_id } = req.body;

    // prevent double voting
    const existingVote = await Vote.findOne({
      user_email,
      round_id
    });

    if (existingVote) {
      return res.status(400).json({
        message: "You already voted in this round"
      });
    }

    const vote = new Vote({
      user_email,
      round_id,
      competitor_id
    });

    const savedVote = await vote.save();

    res.json(savedVote);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Count votes for competitor
export const getVoteCount = async (req, res) => {
  try {
    const { competitorId } = req.params;

    const count = await Vote.countDocuments({
      competitor_id: competitorId
    });

    res.json({ votes: count });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get leaderboard for round
export const getLeaderboard = async (req, res) => {
  try {
    const { roundId } = req.params;

    const results = await Vote.aggregate([
      {
        $match: { round_id: roundId }
      },
      {
        $group: {
          _id: "$competitor_id",
          votes: { $sum: 1 }
        }
      },
      {
        $sort: { votes: -1 }
      }
    ]);

    res.json(results);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};