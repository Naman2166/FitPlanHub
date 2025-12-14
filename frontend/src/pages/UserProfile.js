import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { PlanCardSkeleton } from '../components/LoadingSkeleton';
import { FiUser, FiMail, FiCalendar, FiDollarSign, FiTrendingUp, FiHeart } from 'react-icons/fi';
import './UserProfile.css';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useToastContext();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    totalSpent: 0,
    activePlans: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSubscriptions(response.data);
      
      // Calculate stats
      const totalSpent = response.data.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);
      const activePlans = response.data.filter(sub => {
        const plan = sub.plan;
        if (!plan) return false;
        const startDate = new Date(sub.createdAt);
        const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
        return new Date() < endDate;
      }).length;

      setStats({
        totalSubscriptions: response.data.length,
        totalSpent,
        activePlans
      });
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      showError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionId) => {
    if (!window.confirm('Are you sure you want to unsubscribe from this plan?')) return;

    try {
      await axios.delete(`${API_URL}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      success('Successfully unsubscribed from plan');
      fetchSubscriptions();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to unsubscribe');
    }
  };

  const isPlanActive = (subscription) => {
    const plan = subscription.plan;
    if (!plan) return false;
    const startDate = new Date(subscription.createdAt);
    const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
    return new Date() < endDate;
  };

  if (!user || user.role !== 'user') {
    return (
      <div className="container" style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This page is only available for regular users.</p>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="container">
        <div className="profile-header">
          <div className="profile-card">
            <div className="profile-avatar">
              <FiUser className="avatar-icon" />
            </div>
            <div className="profile-info">
              <h1>{user.name}</h1>
              <p className="profile-email">
                <FiMail className="info-icon" />
                {user.email}
              </p>
              <p className="profile-role">
                <span className="badge badge-primary">Regular User</span>
              </p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-primary">
                <FiTrendingUp className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalSubscriptions}</div>
                <div className="stat-label">Total Subscriptions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-success">
                <FiHeart className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.activePlans}</div>
                <div className="stat-label">Active Plans</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-warning">
                <FiDollarSign className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">${stats.totalSpent.toFixed(2)}</div>
                <div className="stat-label">Total Spent</div>
              </div>
            </div>
          </div>
        </div>

        <div className="subscriptions-section">
          <h2 className="section-title">My Subscriptions</h2>
          
          {loading ? (
            <div className="grid">
              {[...Array(3)].map((_, i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="card text-center empty-state">
              <div className="empty-icon">📋</div>
              <h3>No subscriptions yet</h3>
              <p>Start your fitness journey by subscribing to a plan!</p>
              <Link to="/" className="btn btn-primary mt-2">
                Browse Plans
              </Link>
            </div>
          ) : (
            <div className="grid">
              {subscriptions.map((subscription) => {
                const plan = subscription.plan;
                if (!plan) return null;
                const active = isPlanActive(subscription);
                const startDate = new Date(subscription.createdAt);
                const endDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));
                const daysRemaining = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={subscription._id} className="subscription-card">
                    <div className="subscription-header">
                      <h3>{plan.title}</h3>
                      {active ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-secondary">Expired</span>
                      )}
                    </div>
                    <p className="trainer-name">
                      by{' '}
                      <Link to={`/trainers/${plan.trainer?._id || plan.trainer}`}>
                        {plan.trainerName || plan.trainer?.name}
                      </Link>
                    </p>
                    <div className="subscription-info">
                      <div className="info-row">
                        <span className="info-label">Price:</span>
                        <span className="price">${plan.price}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Duration:</span>
                        <span>{plan.duration} days</span>
                      </div>
                      {active && (
                        <div className="info-row">
                          <span className="info-label">Days Remaining:</span>
                          <span className="days-remaining">{daysRemaining} days</span>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="info-label">Subscribed:</span>
                        <span>{new Date(subscription.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="subscription-actions">
                      <Link to={`/plans/${plan._id}`} className="btn btn-primary">
                        View Plan
                      </Link>
                      {active && (
                        <button
                          onClick={() => handleUnsubscribe(subscription._id)}
                          className="btn btn-outline"
                        >
                          Unsubscribe
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
