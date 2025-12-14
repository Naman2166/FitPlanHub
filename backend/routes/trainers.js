const express = require('express');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all trainers
router.get('/', async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer' }).select('name email');
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trainer profile
router.get('/:trainerId', auth, async (req, res) => {
  try {
    const trainer = await User.findById(req.params.trainerId).select('name email role');
    
    if (!trainer || trainer.role !== 'trainer') {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    // Get trainer's plans
    const plans = await Plan.find({ trainer: req.params.trainerId })
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 });

    // Check if current user is following this trainer
    let isFollowing = false;
    if (req.user.role === 'user') {
      const userId = req.user._id || req.user.id;
      const follow = await Follow.findOne({
        follower: userId,
        trainer: req.params.trainerId
      });
      isFollowing = !!follow;
    }

    res.json({
      trainer,
      plans,
      isFollowing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

