const express = require('express');
const Plan = require('../models/Plan');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all plans (public - shows preview)
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find({}).populate('trainer', 'name email').sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single plan (with access control)
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).populate('trainer', 'name email');
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user is subscribed
    const subscription = await Subscription.findOne({
      user: req.user._id || req.user.id,
      plan: plan._id,
      status: 'active'
    });

    const isSubscribed = !!subscription;
    const userId = req.user._id || req.user.id;
    const trainerId = plan.trainer._id || plan.trainer;
    const isOwner = trainerId.toString() === userId.toString();

    // Return preview or full details based on subscription/ownership
    if (isSubscribed || isOwner || req.user.role === 'trainer') {
      res.json({ plan, hasAccess: true });
    } else {
      res.json({
        plan: {
          _id: plan._id,
          title: plan.title,
          trainerName: plan.trainerName,
          price: plan.price,
          duration: plan.duration
        },
        hasAccess: false
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create plan (trainer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Only trainers can create plans' });
    }

    const { title, description, price, duration } = req.body;

    if (!title || !description || !price || !duration) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const plan = new Plan({
      title,
      description,
      price,
      duration,
      trainer: req.user._id || req.user.id,
      trainerName: req.user.name
    });

    await plan.save();
    await plan.populate('trainer', 'name email');

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update plan (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const userId = req.user._id || req.user.id;
    const trainerId = plan.trainer;
    
    if (trainerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this plan' });
    }

    const { title, description, price, duration } = req.body;
    if (title) plan.title = title;
    if (description) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (duration) plan.duration = duration;

    await plan.save();
    await plan.populate('trainer', 'name email');
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete plan (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const userId = req.user._id || req.user.id;
    const trainerId = plan.trainer;
    
    if (trainerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this plan' });
    }

    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trainer's plans
router.get('/trainer/:trainerId', async (req, res) => {
  try {
    const plans = await Plan.find({ trainer: req.params.trainerId }).populate('trainer', 'name email').sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

