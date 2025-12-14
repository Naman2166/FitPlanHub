const express = require('express');
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const auth = require('../middleware/auth');

const router = express.Router();

// Subscribe to a plan
router.post('/:planId', auth, async (req, res) => {
  try {
    if (req.user.role === 'trainer') {
      return res.status(403).json({ message: 'Trainers cannot subscribe to plans' });
    }

    const plan = await Plan.findById(req.params.planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const userId = req.user._id || req.user.id;

    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
      user: userId,
      plan: req.params.planId
    });

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        return res.status(400).json({ message: 'Already subscribed to this plan' });
      } else {
        // Reactivate subscription
        existingSubscription.status = 'active';
        existingSubscription.purchaseDate = new Date();
        await existingSubscription.save();
        await existingSubscription.populate('plan', 'title price duration');
        return res.json({ message: 'Subscription reactivated', subscription: existingSubscription });
      }
    }

    // Create new subscription (simulate payment)
    const subscription = new Subscription({
      user: userId,
      plan: req.params.planId
    });

    await subscription.save();
    await subscription.populate('plan', 'title price duration');

    res.status(201).json({
      message: 'Subscription successful',
      subscription
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already subscribed to this plan' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Get user's subscriptions
router.get('/my-subscriptions', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const subscriptions = await Subscription.find({ user: userId, status: 'active' })
      .populate('plan', 'title description price duration trainerName')
      .sort({ purchaseDate: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if user is subscribed to a plan
router.get('/check/:planId', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const subscription = await Subscription.findOne({
      user: userId,
      plan: req.params.planId,
      status: 'active'
    });
    res.json({ isSubscribed: !!subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

