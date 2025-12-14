import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';
import { PlanCardSkeleton } from '../components/LoadingSkeleton';
import { FiHeart, FiTrendingUp, FiUsers } from 'react-icons/fi';
import './UserFeed.css';

const UserFeed = () => {
  const { user } = useContext(AuthContext);
  const { error: showError } = useToastContext();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPlans: 0,
    subscribedPlans: 0,
    trainersFollowed: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchFeed();
    }
  }, [user]);

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${API_URL}/feed`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFeedItems(response.data);
      
      const subscribedCount = response.data.filter(item => item.isSubscribed).length;
      const uniqueTrainers = new Set(response.data.map(item => item.trainer?._id || item.trainer)).size;
      
      setStats({
        totalPlans: response.data.length,
        subscribedPlans: subscribedCount,
        trainersFollowed: uniqueTrainers
      });
    } catch (err) {
      console.error('Error fetching feed:', err);
      showError('Failed to load your feed');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'user') {
    return (
      <div className="container" style={{ color: 'white', padding: '50px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>This page is only available for regular users.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="user-feed">
        <div className="container">
          <div className="feed-header">
            <h1 className="feed-title">My Personalized Feed</h1>
          </div>
          <div className="grid">
            {[...Array(6)].map((_, i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-feed">
      <div className="container">
        <div className="feed-header">
          <div>
            <h1 className="feed-title">My Personalized Feed</h1>
            <p className="feed-subtitle">
              Plans from trainers you follow
            </p>
          </div>
        </div>

        <div className="feed-stats">
          <div className="stat-card">
            <FiTrendingUp className="stat-icon" />
            <div>
              <div className="stat-value">{stats.totalPlans}</div>
              <div className="stat-label">Total Plans</div>
            </div>
          </div>
          <div className="stat-card">
            <FiHeart className="stat-icon" />
            <div>
              <div className="stat-value">{stats.subscribedPlans}</div>
              <div className="stat-label">Subscribed</div>
            </div>
          </div>
          <div className="stat-card">
            <FiUsers className="stat-icon" />
            <div>
              <div className="stat-value">{stats.trainersFollowed}</div>
              <div className="stat-label">Trainers</div>
            </div>
          </div>
        </div>

        {feedItems.length === 0 ? (
          <div className="card text-center empty-state">
            <div className="empty-icon">📭</div>
            <h3>Your feed is empty</h3>
            <p>Start following trainers to see their plans here!</p>
            <Link to="/" className="btn btn-primary mt-2">
              Browse All Plans
            </Link>
          </div>
        ) : (
          <div className="grid">
            {feedItems.map((item) => (
              <div key={item._id} className="feed-card plan-card">
                <div className="feed-card-header plan-card-header">
                  <h3>{item.title}</h3>
                  {item.isSubscribed && (
                    <span className="badge badge-success">Subscribed</span>
                  )}
                </div>
                <p className="trainer-name">
                  by{' '}
                  <Link to={`/trainers/${item.trainer?._id || item.trainer}`}>
                    {item.trainerName || item.trainer?.name}
                  </Link>
                </p>
                <div className="plan-info">
                  <div className="info-item">
                    <span className="price">${item.price}</span>
                  </div>
                  <div className="info-item">
                    <span className="duration">{item.duration} days</span>
                  </div>
                </div>
                {item.description && (
                  <p className="plan-preview">
                    {item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description}
                  </p>
                )}
                <div className="plan-card-actions">
                  <Link to={`/plans/${item._id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFeed;

