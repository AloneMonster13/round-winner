import Round from "../models/Round.js";

export const getRounds = async (req, res) => {
  const rounds = await Round.find();
  res.json(rounds);
};

export const createRound = async (req, res) => {
  const round = new Round(req.body);
  await round.save();
  res.json(round);
};

export const updateRound = async (req, res) => {
  const round = await Round.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(round);
};

export const deleteRound = async (req, res) => {
  await Round.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};