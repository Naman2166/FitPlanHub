const express = require('express');
const Follow = require('../models/Follow');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Get personalized feed
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'trainer') {
      return res.status(403).json({ message: 'Feed is only for regular users' });
    }

    const userId = req.user._id || req.user.id;

    // Get all trainers the user follows
    const follows = await Follow.find({ follower: userId });
    const trainerIds = follows.map(f => f.trainer);

    // Get all plans from followed trainers
    const plans = await Plan.find({ trainer: { $in: trainerIds } })
      .populate('trainer', 'name email')
      .sort({ createdAt: -1 });

    // Get user's subscriptions
    const subscriptions = await Subscription.find({ user: userId, status: 'active' });
    const subscribedPlanIds = subscriptions.map(s => s.plan.toString());

    // Add subscription status to each plan
    const feedItems = plans.map(plan => ({
      ...plan.toObject(),
      isSubscribed: subscribedPlanIds.includes(plan._id.toString())
    }));

    res.json(feedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

