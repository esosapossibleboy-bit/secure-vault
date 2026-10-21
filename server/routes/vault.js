const express = require("express");
const Vault = require("../models/Vault");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  const vaults = await Vault.find({ user: req.user._id });
  res.json(vaults);
});

router.post("/", async (req, res) => {
  const { title, content } = req.body;
  const vault = await Vault.create({ title, content, user: req.user._id });
  res.json(vault);
});

router.delete("/:id", async (req, res) => {
  const vault = await Vault.findById(req.params.id);
  if (!vault) return res.status(404).json({ message: "Vault not found" });
  if (vault.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "BOLA blocked - not your vault" });
  }
  await vault.deleteOne();
  res.json({ message: "Deleted" });
});

module.exports = router;