const express = require('express');
const Follow = require('../models/Follow');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Follow a trainer
router.post('/:trainerId', auth, async (req, res) => {
  try {
    if (req.user.role === 'trainer') {
      return res.status(400).json({ message: 'Trainers cannot follow other trainers' });
    }

    const trainer = await User.findById(req.params.trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const userId = req.user._id || req.user.id;
    if (userId.toString() === req.params.trainerId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: userId,
      trainer: req.params.trainerId
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this trainer' });
    }

    const follow = new Follow({
      follower: userId,
      trainer: req.params.trainerId
    });

    await follow.save();
    await follow.populate('trainer', 'name email');

    res.status(201).json({ message: 'Successfully followed trainer', follow });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already following this trainer' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Unfollow a trainer
router.delete('/:trainerId', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const follow = await Follow.findOne({
      follower: userId,
      trainer: req.params.trainerId
    });

    if (!follow) {
      return res.status(404).json({ message: 'Not following this trainer' });
    }

    await Follow.findByIdAndDelete(follow._id);
    res.json({ message: 'Successfully unfollowed trainer' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's followed trainers
router.get('/my-follows', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const follows = await Follow.find({ follower: userId })
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 });
    res.json(follows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user is following a trainer
router.get('/check/:trainerId', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const follow = await Follow.findOne({
      follower: userId,
      trainer: req.params.trainerId
    });
    res.json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

