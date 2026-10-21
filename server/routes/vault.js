const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Vault = require('../models/Vault');
const router = express.Router();

// ALL routes need token - Week 3 token pipeline
router.use(protect);

// CREATE - link vault to logged-in user
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title & content required' });
    
    const vault = await Vault.create({
      title,
      content,
      user: req.user._id // THIS fixes BOLA - each vault belongs to a user
    });
    res.status(201).json(vault);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - ONLY my vaults - THIS is the BOLA protection
router.get('/', async (req, res) => {
  try {
    const vaults = await Vault.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(vaults);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ ONE - can only read if I own it
router.get('/:id', async (req, res) => {
  try {
    const vault = await Vault.findOne({ _id: req.params.id, user: req.user._id });
    if (!vault) return res.status(404).json({ message: 'Not found or not yours - BOLA blocked' });
    res.json(vault);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE - can only delete if I own it
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Vault.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Not found or not yours - BOLA blocked' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE - can only update if I own it
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const updated = await Vault.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, content },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found or not yours' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;