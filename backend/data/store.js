const bcrypt = require('bcryptjs');

// In-memory data stores
let users = [];
let plans = [];
let subscriptions = [];
let follows = [];

let userIdCounter = 1;
let planIdCounter = 1;
let subscriptionIdCounter = 1;
let followIdCounter = 1;

// Helper function to generate ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User operations
const userStore = {
  async findOne(query) {
    const user = users.find(u => {
      if (query.email) return u.email === query.email;
      if (query._id || query.id) {
        const id = query._id || query.id;
        return u._id === id || u.id === id;
      }
      return false;
    });
    return user ? { ...user } : null;
  },

  async findById(id) {
    const user = users.find(u => u._id === id || u.id === id);
    return user ? { ...user } : null;
  },

  async find(query) {
    if (query.role) {
      return users.filter(u => u.role === query.role).map(u => ({ ...u }));
    }
    return users.map(u => ({ ...u }));
  },

  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = {
      _id: generateId(),
      id: generateId(),
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role,
      isTrainer: userData.role === 'trainer',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(user);
    return { ...user };
  },

  async comparePassword(user, candidatePassword) {
    return await bcrypt.compare(candidatePassword, user.password);
  }
};

// Plan operations
const planStore = {
  async find(query) {
    let results = plans;
    
    if (query.trainer) {
      results = results.filter(p => p.trainer === query.trainer || p.trainer._id === query.trainer || p.trainer.id === query.trainer);
    }
    
    if (query._id) {
      results = results.filter(p => p._id === query._id || p.id === query._id);
    }
    
    // Sort by createdAt descending
    results = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Populate trainer
    return results.map(plan => ({
      ...plan,
      trainer: users.find(u => (u._id === plan.trainer || u.id === plan.trainer)) || { name: plan.trainerName, email: '' }
    }));
  },

  async findById(id) {
    const plan = plans.find(p => p._id === id || p.id === id);
    if (!plan) return null;
    
    const trainer = users.find(u => (u._id === plan.trainer || u.id === plan.trainer));
    return {
      ...plan,
      trainer: trainer ? { _id: trainer._id, id: trainer.id, name: trainer.name, email: trainer.email } : { name: plan.trainerName, email: '' }
    };
  },

  async create(planData) {
    const plan = {
      _id: generateId(),
      id: generateId(),
      title: planData.title,
      description: planData.description,
      price: planData.price,
      duration: planData.duration,
      trainer: planData.trainer,
      trainerName: planData.trainerName,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    plans.push(plan);
    
    const trainer = users.find(u => (u._id === plan.trainer || u.id === plan.trainer));
    return {
      ...plan,
      trainer: trainer ? { _id: trainer._id, id: trainer.id, name: trainer.name } : { name: plan.trainerName }
    };
  },

  async update(id, updateData) {
    const planIndex = plans.findIndex(p => p._id === id || p.id === id);
    if (planIndex === -1) return null;
    
    plans[planIndex] = {
      ...plans[planIndex],
      ...updateData,
      updatedAt: new Date()
    };
    
    const trainer = users.find(u => (u._id === plans[planIndex].trainer || u.id === plans[planIndex].trainer));
    return {
      ...plans[planIndex],
      trainer: trainer ? { _id: trainer._id, id: trainer.id, name: trainer.name } : { name: plans[planIndex].trainerName }
    };
  },

  async delete(id) {
    const planIndex = plans.findIndex(p => p._id === id || p.id === id);
    if (planIndex === -1) return false;
    plans.splice(planIndex, 1);
    return true;
  }
};

// Subscription operations
const subscriptionStore = {
  async findOne(query) {
    const subscription = subscriptions.find(s => {
      if (query.user && query.plan) {
        return (s.user === query.user || s.user._id === query.user || s.user.id === query.user) &&
               (s.plan === query.plan || s.plan._id === query.plan || s.plan.id === query.plan);
      }
      return false;
    });
    return subscription ? { ...subscription } : null;
  },

  async find(query) {
    let results = subscriptions;
    
    if (query.user) {
      results = results.filter(s => s.user === query.user || s.user._id === query.user || s.user.id === query.user);
    }
    
    if (query.status) {
      results = results.filter(s => s.status === query.status);
    }
    
    // Sort by purchaseDate descending
    results = results.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
    
    // Populate plan
    return results.map(sub => {
      const plan = plans.find(p => (p._id === sub.plan || p.id === sub.plan));
      return {
        ...sub,
        plan: plan ? { ...plan } : sub.plan
      };
    });
  },

  async create(subscriptionData) {
    const subscription = {
      _id: generateId(),
      id: generateId(),
      user: subscriptionData.user,
      plan: subscriptionData.plan,
      status: 'active',
      purchaseDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    subscriptions.push(subscription);
    
    const plan = plans.find(p => (p._id === subscription.plan || p.id === subscription.plan));
    return {
      ...subscription,
      plan: plan ? { _id: plan._id, id: plan.id, title: plan.title, price: plan.price, duration: plan.duration } : subscription.plan
    };
  },

  async update(id, updateData) {
    const subIndex = subscriptions.findIndex(s => s._id === id || s.id === id);
    if (subIndex === -1) return null;
    
    subscriptions[subIndex] = {
      ...subscriptions[subIndex],
      ...updateData,
      updatedAt: new Date()
    };
    
    return { ...subscriptions[subIndex] };
  }
};

// Follow operations
const followStore = {
  async findOne(query) {
    const follow = follows.find(f => {
      if (query.follower && query.trainer) {
        return (f.follower === query.follower || f.follower._id === query.follower || f.follower.id === query.follower) &&
               (f.trainer === query.trainer || f.trainer._id === query.trainer || f.trainer.id === query.trainer);
      }
      return false;
    });
    return follow ? { ...follow } : null;
  },

  async find(query) {
    let results = follows;
    
    if (query.follower) {
      results = results.filter(f => f.follower === query.follower || f.follower._id === query.follower || f.follower.id === query.follower);
    }
    
    // Sort by createdAt descending
    results = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Populate trainer
    return results.map(follow => {
      const trainer = users.find(u => (u._id === follow.trainer || u.id === follow.trainer));
      return {
        ...follow,
        trainer: trainer ? { _id: trainer._id, id: trainer.id, name: trainer.name, email: trainer.email } : follow.trainer
      };
    });
  },

  async create(followData) {
    const follow = {
      _id: generateId(),
      id: generateId(),
      follower: followData.follower,
      trainer: followData.trainer,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    follows.push(follow);
    
    const trainer = users.find(u => (u._id === follow.trainer || u.id === follow.trainer));
    return {
      ...follow,
      trainer: trainer ? { _id: trainer._id, id: trainer.id, name: trainer.name, email: trainer.email } : follow.trainer
    };
  },

  async delete(id) {
    const followIndex = follows.findIndex(f => f._id === id || f.id === id);
    if (followIndex === -1) return false;
    follows.splice(followIndex, 1);
    return true;
  }
};

module.exports = {
  userStore,
  planStore,
  subscriptionStore,
  followStore
};
